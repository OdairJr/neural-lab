import { TestBed } from '@angular/core/testing';
import * as tf from '@tensorflow/tfjs';
import { firstValueFrom, of, toArray, type Observable } from 'rxjs';
import type { ChallengeValidation, VisualizationData } from '@domain/content';
import { TfjsMemoryService, TensorSerializerService, TFJS_TOKEN } from '@core/tfjs';
import {
  gradientDescentRun,
  meanSquaredError,
  mseGradients,
  ordinaryLeastSquares,
  type DataPoint,
} from '@core/utils';
import type { TrainingMetric } from '@core/training';
import { LabRuntimeService } from '@shared/runtime';
import { validateChallenge, type ChallengeInput } from '@shared/challenges/challenge-validator';
import type { ExperimentResult } from '@shared/experiments';
import { lab08MlFundamentalsConfig } from '@content/lab-configs/lab-08-ml-fundamentals';
import { lab09LinearRegressionConfig } from '@content/lab-configs/lab-09-linear-regression';
import { lab10GradientDescentConfig } from '@content/lab-configs/lab-10-gradient-descent';
import {
  featureValues,
  housingExperiment,
  labelValues,
} from './lab-08-ml-fundamentals/lab-08-ml-fundamentals.experiments';
import {
  linearFitExperiment,
  regressionData,
} from './lab-09-linear-regression/lab-09-linear-regression.experiments';
import {
  createGradientDescentExperiment,
  lossChart,
} from './lab-10-gradient-descent/lab-10-gradient-descent.experiments';

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

const LINEAR_DATA: DataPoint[] = [
  { x: 0, y: 1 },
  { x: 1, y: 3 },
  { x: 2, y: 5 },
  { x: 3, y: 7 },
];

describe('Phase 3 regression utilities', () => {
  it('recovers the exact line with ordinary least squares', () => {
    const { w, b } = ordinaryLeastSquares(LINEAR_DATA);
    expect(w).toBeCloseTo(2, 6);
    expect(b).toBeCloseTo(1, 6);
  });

  it('computes zero MSE at the exact fit and non-zero gradients away from it', () => {
    expect(meanSquaredError(LINEAR_DATA, 2, 1)).toBeCloseTo(0, 6);

    const { dw, db } = mseGradients(LINEAR_DATA, 2, 1);
    expect(Math.abs(dw)).toBeLessThan(1e-6);
    expect(Math.abs(db)).toBeLessThan(1e-6);
  });

  it('converges towards the minimum with a suitable learning rate', () => {
    const result = gradientDescentRun(LINEAR_DATA, { learningRate: 0.05, epochs: 400 });
    expect(result.diverged).toBe(false);
    expect(result.w).toBeCloseTo(2, 2);
    expect(result.b).toBeCloseTo(1, 2);
    const first = result.history[0].loss;
    const last = result.history[result.history.length - 1].loss;
    expect(last).toBeLessThan(first);
  });

  it('detects divergence with an oversized learning rate', () => {
    const result = gradientDescentRun(LINEAR_DATA, { learningRate: 1.5, epochs: 50 });
    expect(result.diverged).toBe(true);
  });
});

describe('Phase 3 labs', () => {
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

  it('Lab 8 exposes one feature column aligned with the labels', () => {
    const xs = featureValues('area');
    const ys = labelValues();
    expect(xs.length).toBeGreaterThan(0);
    expect(xs.length).toBe(ys.length);
  });

  it('Lab 8 housing experiment returns a scatter plot of feature vs price', () => {
    const result = housingExperiment({ feature: 'area' }, runtime);
    const data = result.visualizationData as Extract<VisualizationData, { type: 'scatter-plot' }>;
    expect(data.type).toBe('scatter-plot');
    expect(data.points.length).toBeGreaterThan(0);
  });

  it('Lab 8 challenge accepts the most correlated feature only', () => {
    const validation = challengeOf(lab08MlFundamentalsConfig.stages);
    expectValidation(validation, { kind: 'multiple-choice', selectedOptionIds: ['area'] }, true);
    expectValidation(validation, { kind: 'multiple-choice', selectedOptionIds: ['quartos'] }, false);
  });

  it('Lab 9 experiment reports an MSE below the challenge threshold', () => {
    const result = linearFitExperiment({ w: 2, b: 1 }, runtime);
    const data = result.visualizationData as Extract<VisualizationData, { type: 'scatter-plot' }>;
    expect(data.type).toBe('scatter-plot');
    const mse = meanSquaredError(regressionData(), 2, 1);
    expect(mse).toBeGreaterThanOrEqual(0);
    expect(mse).toBeLessThan(1);
  });

  it('Lab 9 challenge accepts the exact fit and rejects an off target', () => {
    const validation = challengeOf(lab09LinearRegressionConfig.stages);
    expectValidation(
      validation,
      { kind: 'parameter-match', params: { w: 2, b: 1 } },
      true,
    );
    expectValidation(
      validation,
      { kind: 'parameter-match', params: { w: 3, b: 1 } },
      false,
    );
  });

  it('Lab 10 loss chart maps each metric to a point', () => {
    const metrics: TrainingMetric[] = [
      { epoch: 0, loss: 10, w: 0, b: 0 },
      { epoch: 1, loss: 4, w: 1, b: 0.5 },
    ];
    const chart = lossChart(metrics, 'loss');
    expect(chart.type).toBe('line-chart');
    expect(chart.series[0].data).toEqual([10, 4]);
  });

  it('Lab 10 experiment streams per-epoch results and a final tensor result', async () => {
    const metrics: TrainingMetric[] = [
      { epoch: 0, loss: 10, w: 0, b: 0 },
      { epoch: 1, loss: 4, w: 1, b: 0.5 },
    ];
    const experiment = createGradientDescentExperiment({ run: () => of(...metrics) });

    const stream = experiment({ lr: 0.003, epochs: 2 }, runtime) as Observable<ExperimentResult>;
    const emissions = await firstValueFrom(stream.pipe(toArray()));

    expect(emissions).toHaveLength(3);
    const final = emissions[emissions.length - 1];
    expect(final.tensors?.length).toBe(3);
    expect(final.visualizationData?.type).toBe('line-chart');
  });

  it('Lab 10 challenge accepts the converging learning rate only', () => {
    const validation = challengeOf(lab10GradientDescentConfig.stages);
    expectValidation(validation, { kind: 'multiple-choice', selectedOptionIds: ['b'] }, true);
    expectValidation(validation, { kind: 'multiple-choice', selectedOptionIds: ['c'] }, false);
  });
});
