import { z } from 'zod';
import type { TensorSnapshot } from '@core/tfjs';
import type { LayersModel } from '@tensorflow/tfjs';

/**
 * Runtime Zod schemas for all declarative educational content.
 *
 * This module is intentionally self-contained (its only imports are `zod` and
 * type-only) so that the Node build-time validator
 * (`scripts/validate-content.mjs`) can import it directly through Node's native
 * TypeScript support without a bundler. Keep it that way: add new schema
 * fragments to this file rather than creating cross-imported modules.
 */

/* -------------------------------------------------------------------------- */
/* Shared enums                                                               */
/* -------------------------------------------------------------------------- */

export const STAGE_TYPES = [
  'contextualizacao',
  'conceito',
  'analogia',
  'exemplo-visual',
  'demonstracao',
  'experimentacao',
  'desafio',
  'explicacao',
  'codigo',
  'resumo',
] as const;
export type StageType = (typeof STAGE_TYPES)[number];
export const stageTypeSchema = z.enum(STAGE_TYPES);

/** Keys resolvable through `ComponentRegistry` (base stage components). */
export const STAGE_COMPONENT_KEYS = [
  'markdown',
  'concept-card',
  'visualization',
  'experiment',
  'challenge',
  'code-view',
] as const;
export type StageComponentKey = (typeof STAGE_COMPONENT_KEYS)[number];
export const stageComponentKeySchema = z.enum(STAGE_COMPONENT_KEYS);

export const LAB_CATEGORIES = [
  'tensors',
  'operations',
  'ml',
  'neural-networks',
  'images',
  'memory',
] as const;
export type LabCategoryName = (typeof LAB_CATEGORIES)[number];
export const labCategorySchema = z.enum(LAB_CATEGORIES);

export const VISUALIZATION_TYPES = [
  'tensor-grid',
  'tensor-3d',
  'matrix-heatmap',
  'line-chart',
  'scatter-plot',
  'decision-boundary',
  'activation-curve',
  'memory-timeline',
  'image-tensor',
  'network-graph',
] as const;
export type VisualizationType = (typeof VISUALIZATION_TYPES)[number];
export const visualizationTypeSchema = z.enum(VISUALIZATION_TYPES);

export const CHALLENGE_TYPES = [
  'parameter-match',
  'tensor-value',
  'code-output',
  'multiple-choice',
  'free-form',
] as const;
export type ChallengeType = (typeof CHALLENGE_TYPES)[number];

/** Code view modes shared by the panel and the code stage. */
export const CODE_VIEW_MODES = ['essential', 'annotated', 'full'] as const;
export type CodeViewMode = (typeof CODE_VIEW_MODES)[number];

/* -------------------------------------------------------------------------- */
/* Experiment schema                                                          */
/* -------------------------------------------------------------------------- */

export const PARAMETER_TYPES = ['number', 'string', 'boolean', 'tensor-shape'] as const;
export type ParameterType = (typeof PARAMETER_TYPES)[number];

export const parameterConfigSchema = z.object({
  name: z.string().min(1),
  type: z.enum(PARAMETER_TYPES),
  label: z.string().min(1),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
  options: z
    .array(
      z.object({
        value: z.union([z.number(), z.string(), z.boolean()]),
        label: z.string(),
      }),
    )
    .optional(),
  defaultValue: z.union([z.number(), z.string(), z.boolean()]).optional(),
  description: z.string().optional(),
  tfjsEquivalent: z.string().optional(),
});
export type ParameterConfig = z.infer<typeof parameterConfigSchema>;

export const constraintConfigSchema = z.object({
  expression: z.string().min(1),
  message: z.string().min(1),
  severity: z.enum(['warning', 'error']),
});
export type ConstraintConfig = z.infer<typeof constraintConfigSchema>;

/* -------------------------------------------------------------------------- */
/* Visualization schema                                                       */
/* -------------------------------------------------------------------------- */

export const interactionConfigSchema = z.object({
  trigger: z.enum(['hover', 'click', 'drag', 'scroll']),
  action: z.enum(['tooltip', 'highlight', 'filter', 'drill-down', 'parameter-change']),
  target: z.string().optional(),
});
export type InteractionConfig = z.infer<typeof interactionConfigSchema>;

export const a11yConfigSchema = z.object({
  ariaLabel: z.string().min(1),
  dataTableAlternative: z.boolean(),
  colorBlindSafe: z.boolean(),
  reducedMotionAlternative: z.string().optional(),
});
export type A11yConfig = z.infer<typeof a11yConfigSchema>;

export const visualizationConfigSchema = z.object({
  type: visualizationTypeSchema,
  props: z.record(z.string(), z.unknown()).optional(),
  interactions: z.array(interactionConfigSchema).optional(),
  accessibility: a11yConfigSchema,
});
export type VisualizationConfig = z.infer<typeof visualizationConfigSchema>;

export const experimentConfigSchema = z.object({
  /** Registry key resolving to the lab-provided `experimentFn`. */
  experimentFnId: z.string().min(1),
  parameters: z.array(parameterConfigSchema).min(1),
  visualization: visualizationConfigSchema,
  constraints: z.array(constraintConfigSchema).optional(),
  defaultState: z.record(z.string(), z.unknown()).optional(),
});
export type ExperimentConfig = z.infer<typeof experimentConfigSchema>;

/* -------------------------------------------------------------------------- */
/* Challenge schema                                                           */
/* -------------------------------------------------------------------------- */

const challengeCommon = {
  hints: z.array(z.string()).optional(),
  maxAttempts: z.number().int().positive().nullable().optional(),
  showSolutionAfter: z.number().int().positive().optional(),
};

export const parameterMatchValidationSchema = z.object({
  type: z.literal('parameter-match'),
  criteria: z.object({ target: z.record(z.string(), z.unknown()) }),
  ...challengeCommon,
});

export const tensorValueValidationSchema = z.object({
  type: z.literal('tensor-value'),
  criteria: z.object({
    expectedShape: z.array(z.number().int().nonnegative()),
    expectedValues: z.array(z.number()),
    tolerance: z.number().nonnegative().optional(),
    /** Optional TF.js snippet key resolved by the challenge validator. */
    solutionFnId: z.string().optional(),
  }),
  ...challengeCommon,
});

export const codeOutputValidationSchema = z.object({
  type: z.literal('code-output'),
  criteria: z.object({
    expectedOutput: z.string(),
    solutionFnId: z.string().optional(),
  }),
  ...challengeCommon,
});

export const multipleChoiceValidationSchema = z.object({
  type: z.literal('multiple-choice'),
  criteria: z.object({
    options: z
      .array(z.object({ id: z.string().min(1), label: z.string().min(1) }))
      .min(2),
    correctOptionIds: z.array(z.string().min(1)).min(1),
    multiple: z.boolean().optional(),
  }),
  ...challengeCommon,
});

export const freeFormValidationSchema = z.object({
  type: z.literal('free-form'),
  criteria: z.object({ requiredTerms: z.array(z.string().min(1)).min(1) }),
  ...challengeCommon,
});

export const challengeValidationSchema = z.discriminatedUnion('type', [
  parameterMatchValidationSchema,
  tensorValueValidationSchema,
  codeOutputValidationSchema,
  multipleChoiceValidationSchema,
  freeFormValidationSchema,
]);
export type ChallengeValidation = z.infer<typeof challengeValidationSchema>;

/* -------------------------------------------------------------------------- */
/* Stage & laboratory schemas                                                 */
/* -------------------------------------------------------------------------- */

/** Stage types whose config must declare a visualization to display. */
const VISUALIZATION_STAGE_TYPES: readonly StageType[] = [
  'exemplo-visual',
  'demonstracao',
];

export const stageConfigSchema = z
  .object({
    type: stageTypeSchema,
    title: z.string().min(1),
    component: stageComponentKeySchema,
    /** Stage-specific free-form config (markdown body, concept id, ...). */
    config: z.record(z.string(), z.unknown()).optional(),
    experimentConfig: experimentConfigSchema.optional(),
    validation: challengeValidationSchema.optional(),
    codeTemplate: z.string().optional(),
    generationStrategy: z.string().optional(),
  })
  .superRefine((stage, ctx) => {
    const config = stage.config ?? {};

    if (VISUALIZATION_STAGE_TYPES.includes(stage.type)) {
      if (typeof config['visualizationType'] !== 'string') {
        ctx.addIssue({
          code: 'custom',
          path: ['config', 'visualizationType'],
          message: `Stage "${stage.title}" (${stage.type}) requires config.visualizationType.`,
        });
      }
      if (config['initialData'] === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['config', 'initialData'],
          message: `Stage "${stage.title}" (${stage.type}) requires config.initialData.`,
        });
      }
    }

    if (stage.type === 'experimentacao' && !stage.experimentConfig) {
      ctx.addIssue({
        code: 'custom',
        path: ['experimentConfig'],
        message: `Experiment stage "${stage.title}" requires an experimentConfig.`,
      });
    }

    if (stage.type === 'desafio' && !stage.validation) {
      ctx.addIssue({
        code: 'custom',
        path: ['validation'],
        message: `Challenge stage "${stage.title}" requires a validation config.`,
      });
    }

    if (stage.type === 'codigo' && !stage.codeTemplate && !stage.generationStrategy) {
      ctx.addIssue({
        code: 'custom',
        path: ['codeTemplate'],
        message: `Code stage "${stage.title}" requires a codeTemplate or generationStrategy.`,
      });
    }
  });

export type StageConfig = z.infer<typeof stageConfigSchema>;

export const laboratoryConfigSchema = z.object({
  id: z.string().regex(/^lab-\d{2}-[a-z0-9-]+$/, 'id must look like "lab-01-tensors"'),
  number: z.number().int().min(1).max(16),
  slug: z.string().regex(/^\d{2}-[a-z0-9-]+$/, 'slug must look like "01-fundamentos-de-tensores"'),
  title: z.string().min(1),
  description: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  prerequisites: z.array(z.string()),
  concepts: z.array(z.string()),
  category: labCategorySchema,
  memoryBudgetMB: z.number().positive().max(500),
  tags: z.array(z.string()).optional(),
  stages: z.array(stageConfigSchema).min(1),
});
export type LaboratoryConfig = z.infer<typeof laboratoryConfigSchema>;

/* -------------------------------------------------------------------------- */
/* Concept schema                                                             */
/* -------------------------------------------------------------------------- */

export const conceptSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  shortDefinition: z.string().min(1),
  fullDefinition: z.string().min(1),
  mathematicalNotation: z.string().optional(),
  visualAnalogy: z.string().optional(),
  tfjsApi: z.array(z.string()),
  relatedConcepts: z.array(z.string()),
  introducedInLab: z.string(),
  reinforcedInLabs: z.array(z.string()).optional(),
});
export type Concept = z.infer<typeof conceptSchema>;

/* -------------------------------------------------------------------------- */
/* Visualization data contract                                                */
/* -------------------------------------------------------------------------- */

export interface ScatterPoint {
  x: number;
  y: number;
  label?: string;
  class?: string;
}

export interface DecisionBoundary {
  /** Row-major grid of predicted class indices. */
  mesh: number[][];
  /** Extent of the mesh as [xMin, xMax, yMin, yMax]. */
  extent: [number, number, number, number];
  /** Class labels indexed by mesh value. */
  classes: string[];
}

export interface TensorGridData {
  type: 'tensor-grid';
  tensor: TensorSnapshot;
  title?: string;
}

export interface MatrixHeatmapData {
  type: 'matrix-heatmap';
  matrix: number[][];
  rowLabels?: string[];
  columnLabels?: string[];
  title?: string;
}

export interface LineChartSeries {
  label: string;
  data: number[];
  color?: string;
}

export interface LineChartData {
  type: 'line-chart';
  series: LineChartSeries[];
  xLabels?: string[];
  title?: string;
}

export interface ScatterPlotData {
  type: 'scatter-plot';
  points: ScatterPoint[];
  boundary?: DecisionBoundary;
  xLabel?: string;
  yLabel?: string;
  title?: string;
}

export interface ActivationCurveData {
  type: 'activation-curve';
  fn: 'sigmoid' | 'relu' | 'tanh' | 'softmax';
  xRange: [number, number];
  showDerivative?: boolean;
}

export interface MemoryTimelinePoint {
  timestamp: number;
  usedMemoryMB: number;
  tensorCount: number;
}

export interface MemoryTimelineData {
  type: 'memory-timeline';
  snapshots: MemoryTimelinePoint[];
  budgetMB?: number;
  title?: string;
}

export interface DecisionBoundaryData {
  type: 'decision-boundary';
  mesh: number[][];
  points: ScatterPoint[];
  model?: LayersModel;
}

export interface ImageTensorData {
  type: 'image-tensor';
  original: ImageData;
  tensor: TensorSnapshot;
  channels: 'RGB' | 'grayscale';
}

export interface NetworkGraphData {
  type: 'network-graph';
  layers: { size: number; activation?: string }[];
}

export interface Tensor3dData {
  type: 'tensor-3d';
  tensor: TensorSnapshot;
}

export type VisualizationData =
  | TensorGridData
  | MatrixHeatmapData
  | LineChartData
  | ScatterPlotData
  | ActivationCurveData
  | MemoryTimelineData
  | DecisionBoundaryData
  | ImageTensorData
  | NetworkGraphData
  | Tensor3dData;

export type VisualizationDataFor<T extends VisualizationType> = Extract<
  VisualizationData,
  { type: T }
>;

/* -------------------------------------------------------------------------- */
/* Derived helpers (runtime values, safe to import from the Node validator)   */
/* -------------------------------------------------------------------------- */

/**
 * Cross-references that cannot be expressed inside a single Zod object (they
 * span multiple labs). Returns a list of human-readable error strings.
 */
export function validateLaboratoryReferences(
  configs: readonly LaboratoryConfig[],
  knownConceptIds: ReadonlySet<string> = new Set(),
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const byId = new Map(configs.map((config) => [config.id, config]));

  for (const config of configs) {
    for (const prerequisite of config.prerequisites) {
      if (!byId.has(prerequisite)) {
        errors.push(
          `Lab "${config.id}" lists unknown prerequisite "${prerequisite}".`,
        );
      }
    }
    for (const conceptId of config.concepts) {
      if (knownConceptIds.size > 0 && !knownConceptIds.has(conceptId)) {
        warnings.push(
          `Lab "${config.id}" references concept "${conceptId}" that has no definition yet.`,
        );
      }
    }
  }

  return { errors, warnings };
}
