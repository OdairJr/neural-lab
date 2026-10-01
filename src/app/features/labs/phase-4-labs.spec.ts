import { TestBed } from '@angular/core/testing';
import * as tf from '@tensorflow/tfjs';
import { firstValueFrom, of, toArray, type Observable } from 'rxjs';
import type { ChallengeValidation, VisualizationData } from '@domain/content';
import { TfjsMemoryService, TensorSerializerService, TFJS_TOKEN } from '@core/tfjs';
import {
  activateScalar,
  activationGradient,
  buildArchitecture,
  classifyPoint,
  confusionMatrix,
  createNetwork,
  decisionBoundaryMesh,
  decisionLine,
  generateDataset,
  neuronForward,
  softmax,
  trainNetwork,
  weightedSum,
  type LabeledPoint,
  type NetworkEpochMetric,
  type NetworkWeights,
} from '@core/utils';
import { LabRuntimeService } from '@shared/runtime';
import { validateChallenge, type ChallengeInput } from '@shared/challenges/challenge-validator';
import { activationSeries, sampleRange } from '@shared/visualizations';
import type { ExperimentResult } from '@shared/experiments';
import { lab11NeuronConfig } from '@content/lab-configs/lab-11-neuron';
import { lab12ActivationsConfig } from '@content/lab-configs/lab-12-activations';
import { lab13NeuralNetworksConfig } from '@content/lab-configs/lab-13-neural-networks';
import { lab14ClassificationConfig } from '@content/lab-configs/lab-14-classification';
import { neuronExperiment } from './lab-11-neuron/lab-11-neuron.experiments';
import { activationExperiment } from './lab-12-activations/lab-12-activations.experiments';
import { createLab13NetworkExperiment } from './lab-13-neural-networks/lab-13-neural-networks.experiments';
import { createLab14ClassificationExperiment } from './lab-14-classification/lab-14-classification.experiments';
import { boundaryScatter, finalConfusion } from './network-training';

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

function makeMetric(epoch: number, weights: NetworkWeights, loss = 0.5, accuracy = 0.5): NetworkEpochMetric {
  return { epoch, loss, accuracy, weights };
}

describe('Phase 4 neuron and activation math', () => {
  it('computes the weighted sum with bias', () => {
    expect(weightedSum([2, 3], [0.5, -1], 1)).toBeCloseTo(-1, 10);
  });

  it('applies the activation to the weighted sum', () => {
    const step = neuronForward([1, 1], [1, 1], -1, 'sigmoid');
    expect(step.z).toBeCloseTo(1, 10);
    expect(step.output).toBeCloseTo(1 / (1 + Math.exp(-1)), 10);
  });

  it('builds a decision line that satisfies w1 x + w2 y + b = 0', () => {
    for (const point of decisionLine(2, -1, 1, -5, 5)) {
      expect(2 * point.x - point.y + 1).toBeCloseTo(0, 10);
    }
  });

  it('matches the sigmoid/relu/tanh definitions and derivatives', () => {
    expect(activateScalar('sigmoid', 0)).toBeCloseTo(0.5, 10);
    expect(activateScalar('relu', -3)).toBe(0);
    expect(activateScalar('tanh', 0)).toBe(0);
    expect(activationGradient('sigmoid', 0, 0.5)).toBeCloseTo(0.25, 10);
    expect(activationGradient('relu', -1, 0)).toBe(0);
    expect(activationGradient('tanh', 0, 0)).toBeCloseTo(1, 10);
  });

  it('normalizes softmax into probabilities that sum to 1', () => {
    const values = softmax([1, 2, 3]);
    expect(values.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 10);
    expect(values[2]).toBeGreaterThan(values[0]);
  });
});

describe('Phase 4 network training', () => {
  it('reaches > 90% accuracy on moons with one hidden layer', () => {
    const points = generateDataset('moons', 160, 0.1, 7);
    const result = trainNetwork({
      points,
      classNames: ['a', 'b'],
      hidden: [8],
      hiddenActivation: 'tanh',
      learningRate: 0.5,
      epochs: 200,
      seed: 4,
    });
    expect(result.accuracy).toBeGreaterThan(0.9);
  });

  it('fails XOR with a linear model and solves it with a hidden layer', () => {
    const points = generateDataset('xor', 160, 0.12, 7);
    const linear = trainNetwork({
      points,
      classNames: ['a', 'b'],
      hidden: [],
      hiddenActivation: 'tanh',
      learningRate: 0.5,
      epochs: 200,
      seed: 1,
    });
    expect(linear.accuracy).toBeLessThan(0.75);

    const nonlinear = trainNetwork({
      points,
      classNames: ['a', 'b'],
      hidden: [2],
      hiddenActivation: 'tanh',
      learningRate: 0.5,
      epochs: 200,
      seed: 1,
    });
    expect(nonlinear.accuracy).toBeGreaterThan(0.9);
  });

  it('classifies multiclass blobs with a softmax output', () => {
    const points = generateDataset('blobs', 150, 0.12, 2);
    const result = trainNetwork({
      points,
      classNames: ['a', 'b', 'c'],
      hidden: [8],
      hiddenActivation: 'tanh',
      learningRate: 0.5,
      epochs: 150,
      seed: 9,
    });
    expect(result.architecture.outputActivation).toBe('softmax');
    expect(result.accuracy).toBeGreaterThan(0.9);
  });

  it('maps the boundary mesh to the network predictions', () => {
    const architecture = buildArchitecture([4], 2, 'tanh');
    const weights = createNetwork(architecture, 1);
    const extent: [number, number, number, number] = [-2, 2, -2, 2];
    const boundary = decisionBoundaryMesh(weights, architecture, extent, ['a', 'b'], 6);
    expect(boundary.mesh).toHaveLength(6);
    expect(boundary.mesh[0]).toHaveLength(6);
    expect(boundary.mesh[0][0]).toBe(classifyPoint(weights, architecture, -1.5, -1.5));
  });

  it('computes a confusion matrix over predictions', () => {
    const points: LabeledPoint[] = [
      { x: 0, y: 0, label: 0 },
      { x: 1, y: 1, label: 1 },
      { x: 2, y: 2, label: 1 },
    ];
    const result = confusionMatrix([0, 1, 0], points, ['a', 'b']);
    expect(result.matrix[0][0]).toBe(1);
    expect(result.matrix[1][0]).toBe(1);
    expect(result.matrix[1][1]).toBe(1);
  });
});

describe('Phase 4 labs', () => {
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

  it('Lab 11 experiment returns a scatter plot with a decision line and tensors', () => {
    const result = neuronExperiment({ w1: 1, w2: 1, b: -1 }, runtime);
    const data = result.visualizationData as Extract<VisualizationData, { type: 'scatter-plot' }>;
    expect(data.type).toBe('scatter-plot');
    expect(data.lines?.[0].points).toHaveLength(2);
    expect(data.boundary?.mesh.length).toBeGreaterThan(0);
    expect(result.tensors?.length).toBe(3);
  });

  it('Lab 11 challenge accepts only the separating weights', () => {
    const validation = challengeOf(lab11NeuronConfig.stages);
    expectValidation(validation, { kind: 'parameter-match', params: { w1: 1, w2: 1, b: -1 } }, true);
    expectValidation(validation, { kind: 'parameter-match', params: { w1: 1, w2: 1, b: 0 } }, false);
  });

  it('Lab 12 experiment returns an activation curve for the chosen function', () => {
    const result = activationExperiment({ fn: 'relu', derivative: true }, runtime);
    const data = result.visualizationData as Extract<
      VisualizationData,
      { type: 'activation-curve' }
    >;
    expect(data.type).toBe('activation-curve');
    expect(data.fn).toBe('relu');
    expect(data.showDerivative).toBe(true);
    expect(result.tensors?.length).toBe(3);
  });

  it('Lab 12 sampled derivatives match the pure series helper', () => {
    const xs = sampleRange(-2, 2, 9);
    const { derivatives } = activationSeries('sigmoid', xs);
    expect(derivatives[4]).toBeCloseTo(0.25, 6);
  });

  it('Lab 12 challenge accepts only the hidden-ReLU/output-sigmoid combination', () => {
    const validation = challengeOf(lab12ActivationsConfig.stages);
    expectValidation(validation, { kind: 'multiple-choice', selectedOptionIds: ['a'] }, true);
    expectValidation(validation, { kind: 'multiple-choice', selectedOptionIds: ['b'] }, false);
  });

  it('Lab 13 experiment streams per-epoch boundaries and a final tensor result', async () => {
    const architecture = buildArchitecture([2], 2, 'tanh');
    const weights = createNetwork(architecture, 1);
    const metrics = [makeMetric(0, weights, 0.7, 0.5), makeMetric(1, weights, 0.3, 0.9)];
    const experiment = createLab13NetworkExperiment({ runNetwork: () => of(...metrics) });

    const stream = experiment(
      { dataset: 'moons', hidden: 1, neurons: 2, activation: 'tanh' },
      runtime,
    ) as Observable<ExperimentResult>;
    const emissions = await firstValueFrom(stream.pipe(toArray()));

    expect(emissions).toHaveLength(3);
    expect(emissions[0].visualizationData?.type).toBe('scatter-plot');
    const final = emissions[emissions.length - 1];
    expect(final.tensors?.length).toBeGreaterThan(0);
    expect(final.codeSnippet).toContain('backpropagation');
  });

  it('Lab 13 challenge accepts the single hidden layer of 8 tanh neurons', () => {
    const validation = challengeOf(lab13NeuralNetworksConfig.stages);
    expectValidation(validation, { kind: 'multiple-choice', selectedOptionIds: ['a'] }, true);
    expectValidation(validation, { kind: 'multiple-choice', selectedOptionIds: ['b'] }, false);
  });

  it('Lab 14 defaults solve XOR while zero hidden layers do not', async () => {
    const points = generateDataset('xor', 160, 0.12, 7);
    const architecture = buildArchitecture([2], 2, 'tanh');
    const weights = createNetwork(architecture, 1);
    const experiment = createLab14ClassificationExperiment({
      runNetwork: () => of(makeMetric(0, weights, 0.1, 1)),
    });
    const stream = experiment(
      { dataset: 'xor', hidden: 1, neurons: 2, epochs: 120 },
      runtime,
    ) as Observable<ExperimentResult>;
    const emissions = await firstValueFrom(stream.pipe(toArray()));
    const final = emissions[emissions.length - 1];
    expect(final.visualizationData?.type).toBe('scatter-plot');

    const summary = finalConfusion({ weights }, architecture, points, ['Classe 0', 'Classe 1']);
    expect(summary.matrix).toHaveLength(2);
  });

  it('Lab 14 challenge accepts only the minimal XOR network', () => {
    const validation = challengeOf(lab14ClassificationConfig.stages);
    expectValidation(validation, { kind: 'multiple-choice', selectedOptionIds: ['a'] }, true);
    expectValidation(validation, { kind: 'multiple-choice', selectedOptionIds: ['c'] }, false);
  });

  it('boundaryScatter titles carry the epoch loss and accuracy', () => {
    const architecture = buildArchitecture([2], 2, 'tanh');
    const weights = createNetwork(architecture, 1);
    const points = generateDataset('xor', 40, 0.1, 7);
    const scatter = boundaryScatter(
      makeMetric(3, weights, 0.25, 0.8),
      architecture,
      points,
      ['a', 'b'],
      [-1, 1, -1, 1],
      'Teste',
    );
    expect(scatter.title).toContain('época 3');
    expect(scatter.title).toContain('80%');
  });
});
