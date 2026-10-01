#!/usr/bin/env node
/**
 * Build-time content validation for Neural Lab.
 *
 * Loads every lab config plus the shared Zod schemas and reports schema and
 * cross-reference errors. Exits with a non-zero code when any config is
 * invalid so CI (and `npm run ci`) fails before an invalid config ships.
 *
 * Usage:
 *   node scripts/validate-content.mjs                 # validate all labs
 *   node scripts/validate-content.mjs --file <path>   # validate one file
 *
 * Node's native TypeScript support is used to import the `.ts` sources
 * directly, which is why the schema and config modules are kept
 * dependency-free (type-only imports only).
 */
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  laboratoryConfigSchema,
  validateLaboratoryReferences,
  VISUALIZATION_TYPES,
} from '../src/app/domain/content/schemas.ts';
import { CONCEPT_IDS } from '../src/app/educational-content/concepts/concepts.ts';
import { LAB_CATALOG } from '../src/app/educational-content/lab-configs/lab-catalog.ts';

const REPO_ROOT = resolve(import.meta.dirname, '..');
const LAB_CONFIG_DIR = join(REPO_ROOT, 'src', 'app', 'educational-content', 'lab-configs');

const VISUALIZATION_STAGE_TYPES = new Set(['exemplo-visual', 'demonstracao']);

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Picks the exported `LaboratoryConfig` object from a loaded module. */
function extractConfig(module, file) {
  for (const value of Object.values(module)) {
    if (isRecord(value) && typeof value.id === 'string' && value.id.startsWith('lab-')) {
      return value;
    }
  }
  throw new Error(`No LaboratoryConfig export found in ${file}.`);
}

function collectConfigFiles() {
  const fileFlagIndex = process.argv.indexOf('--file');
  if (fileFlagIndex !== -1) {
    const explicit = process.argv[fileFlagIndex + 1];
    if (!explicit) {
      throw new Error('--file requires a path argument.');
    }
    return [resolve(process.cwd(), explicit)];
  }

  return readdirSync(LAB_CONFIG_DIR)
    .filter((name) => /^lab-\d{2}-.*\.ts$/.test(name))
    .sort()
    .map((name) => join(LAB_CONFIG_DIR, name));
}

async function loadConfigs(files) {
  const configs = [];
  for (const file of files) {
    const module = await import(pathToFileURL(file).href);
    configs.push({ file, config: extractConfig(module, file) });
  }
  return configs;
}

function validateStageVisualizations(config, errors) {
  for (const [index, stage] of config.stages.entries()) {
    if (!VISUALIZATION_STAGE_TYPES.has(stage.type)) {
      continue;
    }
    const visualizationType = stage.config?.visualizationType;
    if (typeof visualizationType === 'string' && !VISUALIZATION_TYPES.includes(visualizationType)) {
      errors.push(
        `Lab "${config.id}" stage ${index} ("${stage.title}") references unknown visualization "${visualizationType}".`,
      );
    }
  }
}

function validateUniqueness(configs, errors) {
  const seen = { id: new Map(), number: new Map(), slug: new Map() };
  for (const { config, file } of configs) {
    for (const [field, map] of Object.entries(seen)) {
      const value = config[field];
      if (map.has(value)) {
        errors.push(
          `Duplicate ${field} "${value}" in ${file} (also in ${map.get(value)}).`,
        );
      } else {
        map.set(value, file);
      }
    }
  }
}

function validateAgainstCatalog(configs, errors) {
  const catalogById = new Map(LAB_CATALOG.map((lab) => [lab.id, lab]));
  for (const { config } of configs) {
    const catalogEntry = catalogById.get(config.id);
    if (!catalogEntry) {
      errors.push(`Lab "${config.id}" is missing from LAB_CATALOG.`);
      continue;
    }
    for (const field of ['number', 'slug', 'title', 'description', 'category']) {
      if (catalogEntry[field] !== config[field]) {
        errors.push(
          `Lab "${config.id}" ${field} does not match LAB_CATALOG (config: ${JSON.stringify(
            config[field],
          )}, catalog: ${JSON.stringify(catalogEntry[field])}).`,
        );
      }
    }
  }
}

async function main() {
  const files = collectConfigFiles();
  const loaded = await loadConfigs(files);

  const errors = [];
  const warnings = [];
  const validConfigs = [];

  for (const { config, file } of loaded) {
    const result = laboratoryConfigSchema.safeParse(config);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(
          `${file}: ${issue.path.join('.') || '(root)'} — ${issue.message}`,
        );
      }
      continue;
    }
    validConfigs.push(result.data);
    validateStageVisualizations(result.data, errors);
  }

  validateUniqueness(loaded, errors);
  validateAgainstCatalog(loaded, errors);

  const references = validateLaboratoryReferences(validConfigs, CONCEPT_IDS);
  errors.push(...references.errors);
  warnings.push(...references.warnings);

  const report = {
    checked: loaded.length,
    valid: validConfigs.length,
    errors,
    warnings,
  };

  console.log(JSON.stringify(report, null, 2));

  if (errors.length > 0) {
    console.error(`\nContent validation failed with ${errors.length} error(s).`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nContent validation passed (${report.valid} lab configs).`);
}

main().catch((error) => {
  console.error('[validate-content] Unexpected failure:', error);
  process.exitCode = 1;
});
