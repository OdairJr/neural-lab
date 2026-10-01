import {
  laboratoryConfigSchema,
  validateLaboratoryReferences,
  type LaboratoryConfig,
} from './schemas';

function baseConfig(): LaboratoryConfig {
  return {
    id: 'lab-01-tensors',
    number: 1,
    slug: '01-fundamentos-de-tensores',
    title: 'Fundamentos de Tensores',
    description: 'Um laboratório de exemplo.',
    estimatedMinutes: 20,
    prerequisites: [],
    concepts: ['tensor'],
    category: 'tensors',
    memoryBudgetMB: 50,
    tags: ['tensors'],
    stages: [
      {
        type: 'contextualizacao',
        title: 'Contexto',
        component: 'markdown',
        config: { content: '# Contexto' },
      },
    ],
  };
}

function makeConfig(overrides: Partial<LaboratoryConfig> = {}): LaboratoryConfig {
  return { ...baseConfig(), ...overrides };
}

describe('content schemas', () => {
  it('accepts a valid laboratory config stub', () => {
    expect(laboratoryConfigSchema.safeParse(baseConfig()).success).toBe(true);
  });

  it('rejects a lab with an out-of-range memory budget', () => {
    const result = laboratoryConfigSchema.safeParse(makeConfig({ memoryBudgetMB: 900 }));

    expect(result.success).toBe(false);
  });

  it('requires visualization stages to declare a visualization type and initial data', () => {
    const config = makeConfig({
      stages: [
        {
          type: 'exemplo-visual',
          title: 'Sem visualização',
          component: 'visualization',
          config: {},
        },
      ],
    });

    const result = laboratoryConfigSchema.safeParse(config);

    expect(result.success).toBe(false);
    const messages = result.success ? [] : result.error.issues.map((issue) => issue.message);
    expect(messages.some((message) => message.includes('visualizationType'))).toBe(true);
  });

  it('requires experiment stages to carry an experimentConfig', () => {
    const config = makeConfig({
      stages: [
        {
          type: 'experimentacao',
          title: 'Experimento',
          component: 'experiment',
        },
      ],
    });

    expect(laboratoryConfigSchema.safeParse(config).success).toBe(false);
  });

  it('flags unknown prerequisites and missing concept definitions', () => {
    const config = makeConfig({ prerequisites: ['lab-99-missing'], concepts: ['tensor', 'escalar'] });
    const { errors, warnings } = validateLaboratoryReferences([config], new Set(['tensor']));

    expect(errors.some((message) => message.includes('lab-99-missing'))).toBe(true);
    expect(warnings.some((message) => message.includes('escalar'))).toBe(true);
  });

  it('accepts known prerequisites and concept ids', () => {
    const config = makeConfig({ prerequisites: ['lab-a'], concepts: ['tensor'] });
    const dependency = makeConfig({
      id: 'lab-a',
      number: 2,
      slug: '02-a',
      prerequisites: [],
      concepts: [],
    });
    const result = validateLaboratoryReferences([config, dependency], new Set(['tensor']));

    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
