import { TestBed } from '@angular/core/testing';
import * as tf from '@tensorflow/tfjs';
import type { ChallengeValidation, VisualizationData } from '@domain/content';
import { TfjsMemoryService, TensorSerializerService, TFJS_TOKEN } from '@core/tfjs';
import { LabRuntimeService } from '@shared/runtime';
import { validateChallenge, type ChallengeInput } from '@shared/challenges/challenge-validator';
import { lab01TensorsConfig } from '@content/lab-configs/lab-01-tensors';
import { lab02ManipulationConfig } from '@content/lab-configs/lab-02-manipulation';
import { lab03ElementwiseConfig } from '@content/lab-configs/lab-03-elementwise';
import { lab04ReductionsConfig } from '@content/lab-configs/lab-04-reductions';
import { lab05MatrixConfig } from '@content/lab-configs/lab-05-matrix';
import { lab06BroadcastingConfig } from '@content/lab-configs/lab-06-broadcasting';
import { lab07LinearAlgebraConfig } from '@content/lab-configs/lab-07-linear-algebra';
import { createTensorExperiment } from './lab-01-tensors/lab-01-tensors.experiments';
import {
  manipulateExperiment,
  manipulationShape,
} from './lab-02-manipulation/lab-02-manipulation.experiments';
import {
  elementwiseExperiment,
  RECIPE_TOTALS,
} from './lab-03-elementwise/lab-03-elementwise.experiments';
import { reductionsExperiment } from './lab-04-reductions/lab-04-reductions.experiments';
import {
  matrixExperiment,
  matMulShape,
  toMatrix,
} from './lab-05-matrix/lab-05-matrix.experiments';
import {
  broadcastShape,
  broadcastingExperiment,
} from './lab-06-broadcasting/lab-06-broadcasting.experiments';
import {
  dotProduct,
  linearTransformExperiment,
  rotationScaleMatrix,
  transformPoint,
} from './lab-07-linear-algebra/lab-07-linear-algebra.experiments';

function challengeOf(
  stages: readonly { type: string; validation?: ChallengeValidation }[],
): ChallengeValidation {
  const stage = stages.find((candidate) => candidate.type === 'desafio');
  if (!stage?.validation) {
    throw new Error('Challenge stage not found');
  }
  return stage.validation;
}

function expectValidation(
  validation: ChallengeValidation,
  input: ChallengeInput,
  valid: boolean,
): void {
  expect(validateChallenge(validation, input).valid).toBe(valid);
}

describe('Phase 2 lab experiments', () => {
  let runtime: LabRuntimeService;

  beforeAll(async () => {
    await tf.setBackend('cpu');
    await tf.ready();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LabRuntimeService, { provide: TFJS_TOKEN, useValue: tf }],
    });
    TestBed.inject(TfjsMemoryService);
    TestBed.inject(TensorSerializerService);
    runtime = TestBed.inject(LabRuntimeService);
  });

  afterEach(() => {
    runtime.dispose();
  });

  describe('Lab 1 — tensor fundamentals', () => {
    it('creates a tensor with the requested shape, dtype and values', () => {
      const result = createTensorExperiment(
        { values: '1, 2, 3, 4, 5, 6', shape: '2, 3', dtype: 'float32' },
        runtime,
      );
      const data = result.visualizationData as Extract<VisualizationData, { type: 'tensor-grid' }>;

      expect(data.type).toBe('tensor-grid');
      expect(data.tensor.shape).toEqual([2, 3]);
      expect(data.tensor.values).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('falls back to a rank-1 tensor when the shape does not fit', () => {
      const result = createTensorExperiment(
        { values: '1, 2, 3', shape: '2, 2', dtype: 'float32' },
        runtime,
      );
      const data = result.visualizationData as Extract<VisualizationData, { type: 'tensor-grid' }>;

      expect(data.tensor.shape).toEqual([3]);
    });

    it('validates the shape multiple-choice challenge', () => {
      const validation = challengeOf(lab01TensorsConfig.stages);
      expectValidation(
        validation,
        { kind: 'multiple-choice', selectedOptionIds: ['b'] },
        true,
      );
      expectValidation(
        validation,
        { kind: 'multiple-choice', selectedOptionIds: ['c'] },
        false,
      );
    });
  });

  describe('Lab 2 — tensor manipulation', () => {
    it('computes shapes faithfully for every operation', () => {
      expect(manipulationShape('reshape', [2, 3], 0, [3, 2])).toEqual([3, 2]);
      expect(manipulationShape('flatten', [2, 3], 0)).toEqual([6]);
      expect(manipulationShape('expandDims', [2, 3], 0)).toEqual([1, 2, 3]);
      expect(manipulationShape('squeeze', [1, 2, 3], 0)).toEqual([2, 3]);
      expect(manipulationShape('squeeze', [2, 3], 0)).toEqual([2, 3]);
    });

    it('reshapes the fixed tensor and publishes the new shape', () => {
      const result = manipulateExperiment(
        { operacao: 'reshape', shape: '3, 2', axis: 0 },
        runtime,
      );
      const data = result.visualizationData as Extract<VisualizationData, { type: 'tensor-grid' }>;

      expect(data.tensor.shape).toEqual([3, 2]);
      expect(data.tensor.values).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('squeezes a size-1 dimension', () => {
      const result = manipulateExperiment(
        { operacao: 'squeeze', shape: '2, 3', axis: 0 },
        runtime,
      );
      const data = result.visualizationData as Extract<VisualizationData, { type: 'tensor-grid' }>;

      expect(data.tensor.shape).toEqual([2, 3]);
    });

    it('validates the transpose permutation challenge', () => {
      const validation = challengeOf(lab02ManipulationConfig.stages);
      expectValidation(
        validation,
        { kind: 'parameter-match', params: { eixo0: 2, eixo1: 0, eixo2: 1 } },
        true,
      );
      expectValidation(
        validation,
        { kind: 'parameter-match', params: { eixo0: 1, eixo1: 2, eixo2: 0 } },
        false,
      );
    });
  });

  describe('Lab 3 — element-wise operations', () => {
    it('multiplies quantities by prices with broadcasting', () => {
      const result = elementwiseExperiment(
        { operacao: 'mul', precos: '2, 0.5, 3, 4' },
        runtime,
      );
      const data = result.visualizationData as Extract<VisualizationData, { type: 'tensor-grid' }>;

      expect(data.tensor.shape).toEqual([3, 4]);
      expect(data.tensor.values).toEqual([4, 1.5, 3, 4, 8, 0, 6, 2, 2, 0.5, 1.5, 8]);
    });

    it('applies unary sqrt to the quantities', () => {
      const result = elementwiseExperiment({ operacao: 'sqrt', precos: '' }, runtime);
      const data = result.visualizationData as Extract<VisualizationData, { type: 'tensor-grid' }>;

      expect(data.tensor.shape).toEqual([3, 4]);
      expect(data.tensor.values[0]).toBeCloseTo(Math.sqrt(2), 5);
    });

    it('validates the total-cost challenge and rejects wrong values', () => {
      const validation = challengeOf(lab03ElementwiseConfig.stages);
      expectValidation(
        validation,
        { kind: 'tensor-value', shape: [3], values: [...RECIPE_TOTALS] },
        true,
      );
      expectValidation(
        validation,
        { kind: 'tensor-value', shape: [3], values: [1, 2, 3] },
        false,
      );
    });
  });

  describe('Lab 4 — reductions', () => {
    it('computes the mean across cities (axis 0)', () => {
      const result = reductionsExperiment({ reducao: 'mean', axis: 0 }, runtime);
      const data = result.visualizationData as Extract<VisualizationData, { type: 'line-chart' }>;

      expect(data.series[0].data).toHaveLength(7);
      expect(data.series[0].data[0]).toBeCloseTo((22 + 30 + 18) / 3, 4);
    });

    it('computes the max across days (axis 1)', () => {
      const result = reductionsExperiment({ reducao: 'max', axis: 1 }, runtime);
      const data = result.visualizationData as Extract<VisualizationData, { type: 'line-chart' }>;

      expect(data.series[0].data).toEqual([27, 33, 20]);
      expect(data.xLabels).toEqual(['São Paulo', 'Rio de Janeiro', 'Curitiba']);
    });

    it('validates the highest-variance challenge', () => {
      const validation = challengeOf(lab04ReductionsConfig.stages);
      expectValidation(validation, { kind: 'multiple-choice', selectedOptionIds: ['sp'] }, true);
      expectValidation(validation, { kind: 'multiple-choice', selectedOptionIds: ['rio'] }, false);
    });
  });

  describe('Lab 5 — matrix operations', () => {
    it('checks matMul compatibility', () => {
      expect(matMulShape([3, 5], [5, 1])).toEqual([3, 1]);
      expect(matMulShape([3, 5], [4, 1])).toBeNull();
    });

    it('converts a flat tensor into a row-major matrix', () => {
      expect(toMatrix([1, 2, 3, 4, 5, 6], [2, 3])).toEqual([
        [1, 2, 3],
        [4, 5, 6],
      ]);
    });

    it('computes the revenue matrix', () => {
      const result = matrixExperiment({ operacao: 'matMul', forcarErro: false }, runtime);
      const data = result.visualizationData as Extract<VisualizationData, { type: 'matrix-heatmap' }>;

      expect(data.matrix).toEqual([[182], [208], [117]]);
    });

    it('explains the shape rule instead of throwing when incompatible', () => {
      const result = matrixExperiment({ operacao: 'matMul', forcarErro: true }, runtime);
      const data = result.visualizationData as Extract<VisualizationData, { type: 'matrix-heatmap' }>;

      expect(data.title).toContain('shape incompatível');
    });

    it('validates the revenue challenge', () => {
      const validation = challengeOf(lab05MatrixConfig.stages);
      expectValidation(
        validation,
        { kind: 'tensor-value', shape: [3, 1], values: [182, 208, 117] },
        true,
      );
      expectValidation(
        validation,
        { kind: 'tensor-value', shape: [3, 1], values: [182, 208, 1] },
        false,
      );
    });
  });

  describe('Lab 6 — broadcasting', () => {
    it('aligns shapes from the right', () => {
      expect(broadcastShape([3, 1], [1, 4])).toEqual([3, 4]);
      expect(broadcastShape([5], [3, 5])).toEqual([3, 5]);
      expect(broadcastShape([2, 3], [3, 2])).toBeNull();
      expect(broadcastShape([4, 2], [3, 2])).toBeNull();
    });

    it('converts Celsius to Fahrenheit with vector + scalar', () => {
      const result = broadcastingExperiment({ modo: 'vetor-escalar' }, runtime);
      const data = result.visualizationData as Extract<VisualizationData, { type: 'tensor-grid' }>;

      expect(data.tensor.values).toEqual([32, 50, 68, 86]);
    });

    it('broadcasts a [3, 1] correction over a [3, 7] matrix', () => {
      const result = broadcastingExperiment({ modo: 'matriz-vetor' }, runtime);
      const data = result.visualizationData as Extract<VisualizationData, { type: 'tensor-grid' }>;

      expect(data.tensor.shape).toEqual([3, 7]);
      expect(data.tensor.values[0]).toBeCloseTo(23, 5);
    });

    it('validates the output-shape challenge', () => {
      const validation = challengeOf(lab06BroadcastingConfig.stages);
      expectValidation(validation, { kind: 'multiple-choice', selectedOptionIds: ['a'] }, true);
      expectValidation(validation, { kind: 'multiple-choice', selectedOptionIds: ['c'] }, false);
    });
  });

  describe('Lab 7 — applied linear algebra', () => {
    it('builds the rotation + scale matrix', () => {
      const [a, b, c, d] = rotationScaleMatrix(90, 1);
      expect(a).toBeCloseTo(0, 6);
      expect(b).toBeCloseTo(1, 6);
      expect(c).toBeCloseTo(-1, 6);
      expect(d).toBeCloseTo(0, 6);
    });

    it('computes the dot product', () => {
      expect(dotProduct([1, 0], [0, 1])).toBe(0);
      expect(dotProduct([1, 2], [3, 4])).toBe(11);
    });

    it('transforms a point with a matrix', () => {
      const rotated = transformPoint({ x: 1, y: 0 }, rotationScaleMatrix(90, 1));
      expect(rotated.x).toBeCloseTo(0, 6);
      expect(rotated.y).toBeCloseTo(1, 6);
    });

    it('publishes original and transformed scatter points', () => {
      const result = linearTransformExperiment({ angulo: 90, escala: 1 }, runtime);
      const data = result.visualizationData as Extract<VisualizationData, { type: 'scatter-plot' }>;

      expect(data.points).toHaveLength(10);
      const transformed = data.points.at(-1);
      expect(transformed?.x).toBeCloseTo(-1, 3);
      expect(transformed?.y).toBeCloseTo(1, 3);
    });

    it('validates the transformation challenge', () => {
      const validation = challengeOf(lab07LinearAlgebraConfig.stages);
      expectValidation(
        validation,
        { kind: 'parameter-match', params: { angulo: 90, escala: 1 } },
        true,
      );
      expectValidation(
        validation,
        { kind: 'parameter-match', params: { angulo: 180, escala: 1 } },
        false,
      );
    });
  });
});
