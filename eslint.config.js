// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

/**
 * Layer boundary rules (see technical-architecture spec).
 * Dependency direction: core -> domain -> shared -> features, with
 * educational-content as pure data (types only from domain).
 */
const layerBoundary = (patterns) => ({
  'no-restricted-imports': 'off',
  '@typescript-eslint/no-restricted-imports': ['error', { patterns }],
});

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['src/app/core/**/*.ts'],
    rules: layerBoundary([
      {
        group: ['@domain/*', '@shared/*', '@features/*', '@content/*'],
        message:
          'core is the leaf layer: it must not import from domain, shared, features or educational-content.',
      },
    ]),
  },
  {
    files: ['src/app/domain/**/*.ts'],
    rules: layerBoundary([
      {
        group: ['@shared/*', '@features/*', '@content/*'],
        message:
          'domain may only import from core: shared, features and educational-content are not allowed.',
      },
    ]),
  },
  {
    files: ['src/app/shared/**/*.ts'],
    rules: layerBoundary([
      {
        group: ['@features/*', '@content/*'],
        message:
          'shared may only import from core and domain: features and educational-content are not allowed.',
      },
    ]),
  },
  {
    files: ['src/app/educational-content/**/*.ts'],
    rules: layerBoundary([
      {
        group: ['@core/*', '@shared/*', '@features/*'],
        message:
          'educational-content is pure data and may not import from core, shared or features.',
      },
      {
        // Content configs are typed with the domain schemas, so type-only
        // imports from domain are permitted while runtime imports are not.
        group: ['@domain/*'],
        allowTypeImports: true,
        message:
          'educational-content may only import (type-only) from domain for content schema types.',
      },
    ]),
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
