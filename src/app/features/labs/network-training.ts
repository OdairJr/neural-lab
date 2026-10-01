import type { ScatterPlotData } from '@domain/content';
import type { NetworkEpochMetric, TrainingWorkerService } from '@core/training';
import {
  DATASET_CLASS_NAMES,
  buildArchitecture,
  confusionMatrix,
  decisionBoundaryMesh,
  generateDataset,
  pointsExtent,
  predictAll,
  type ActivationName,
  type BoundaryMesh,
  type ConfusionMatrix,
  type DatasetName,
  type LabeledPoint,
  type NetworkArchitecture,
} from '@core/utils';
import type { ExperimentFn, ExperimentResult } from '@shared/experiments';
import type { Tensor } from '@tensorflow/tfjs';
import { concatWith, defer, map, of } from 'rxjs';

/** Noise/seed chosen per dataset so the demo clusters stay learnable. */
export const DATASET_SETTINGS: Readonly<Record<DatasetName, { noise: number; seed: number }>> = {
  moons: { noise: 0.1, seed: 7 },
  spiral: { noise: 0.08, seed: 2 },
  circles: { noise: 0.12, seed: 5 },
  xor: { noise: 0.12, seed: 7 },
  blobs: { noise: 0.12, seed: 2 },
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function asNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function asDataset(value: unknown, fallback: DatasetName): DatasetName {
  return value === 'moons' ||
    value === 'spiral' ||
    value === 'circles' ||
    value === 'xor' ||
    value === 'blobs'
    ? value
    : fallback;
}

export function asActivation(value: unknown, fallback: ActivationName): ActivationName {
  return value === 'tanh' || value === 'relu' || value === 'sigmoid' || value === 'linear'
    ? value
    : fallback;
}

/** Generates the labelled points for a dataset using its tuned noise/seed. */
export function datasetPoints(dataset: DatasetName, count = 160): LabeledPoint[] {
  const settings = DATASET_SETTINGS[dataset];
  return generateDataset(dataset, count, settings.noise, settings.seed);
}

/** Replicates a hidden-layer size `layers` times. */
export function hiddenSizes(layers: number, neurons: number): number[] {
  return Array.from({ length: Math.max(0, layers) }, () => neurons);
}

/** Scatter plot with the decision-boundary shading for the current weights. */
export function boundaryScatter(
  metric: Pick<NetworkEpochMetric, 'weights' | 'epoch' | 'loss' | 'accuracy'>,
  architecture: NetworkArchitecture,
  points: readonly LabeledPoint[],
  classNames: readonly string[],
  extent: [number, number, number, number],
  label: string,
  resolution = 20,
): ScatterPlotData {
  const boundary: BoundaryMesh = decisionBoundaryMesh(
    metric.weights,
    architecture,
    extent,
    classNames,
    resolution,
  );
  return {
    type: 'scatter-plot',
    title: `${label} · época ${metric.epoch} · loss = ${metric.loss.toFixed(
      3,
    )} · acurácia = ${(metric.accuracy * 100).toFixed(0)}%`,
    points: points.map((point) => ({
      x: point.x,
      y: point.y,
      label: classNames[point.label] ?? `Classe ${point.label}`,
    })),
    boundary: { mesh: boundary.mesh, extent: boundary.extent, classes: boundary.classes },
    xLabel: 'x1',
    yLabel: 'x2',
  };
}

export interface NetworkExperimentDefaults {
  dataset: DatasetName;
  hiddenLayers: number;
  neurons: number;
  activation: ActivationName;
  learningRate: number;
  epochs: number;
  /** Weight-init seed. */
  seed: number;
  /** Label prefix used in the scatter title. */
  label: string;
  /** Prefix for tensor labels in the "Under the Hood" panel. */
  tensorPrefix: string;
  /** Code shown in "Under the Hood" for the final result. */
  codeSnippet: readonly string[];
}

/**
 * Builds a worker-backed classification training experiment. Parameters are
 * read from the stage form; each streamed epoch updates the decision-boundary
 * scatter plot and the final emission publishes tensors + code.
 */
export function createNetworkExperiment(
  worker: Pick<TrainingWorkerService, 'runNetwork'>,
  defaults: NetworkExperimentDefaults,
): ExperimentFn {
  return (params, runtime) => {
    const dataset = asDataset(params['dataset'], defaults.dataset);
    const hiddenLayers = clamp(
      Math.round(asNumber(params['hidden'], defaults.hiddenLayers)),
      0,
      3,
    );
    const neurons = clamp(Math.round(asNumber(params['neurons'], defaults.neurons)), 2, 24);
    const activation = asActivation(params['activation'], defaults.activation);
    const learningRate = clamp(asNumber(params['lr'], defaults.learningRate), 0.01, 2);
    const epochs = clamp(Math.round(asNumber(params['epochs'], defaults.epochs)), 1, 400);

    const points = datasetPoints(dataset);
    const classNames = DATASET_CLASS_NAMES[dataset];
    const hidden = hiddenSizes(hiddenLayers, neurons);
    const architecture = buildArchitecture(hidden, classNames.length, activation);
    const extent = pointsExtent(points);

    let last: NetworkEpochMetric | null = null;
    const scatterFor = (metric: NetworkEpochMetric): ScatterPlotData =>
      boundaryScatter(metric, architecture, points, classNames, extent, defaults.label);

    return worker
      .runNetwork({
        points,
        classNames,
        hidden,
        hiddenActivation: activation,
        learningRate,
        epochs,
        seed: defaults.seed,
        epochDelayMs: 10,
      })
      .pipe(
        map((metric) => {
          last = metric;
          return { visualizationData: scatterFor(metric) };
        }),
        concatWith(
          defer(() =>
            of(finalResult(runtime, architecture, points, classNames, last, defaults, scatterFor)),
          ),
        ),
      );
  };
}

function finalResult(
  runtime: Parameters<ExperimentFn>[1],
  architecture: NetworkArchitecture,
  points: readonly LabeledPoint[],
  classNames: readonly string[],
  last: NetworkEpochMetric | null,
  defaults: NetworkExperimentDefaults,
  scatterFor: (metric: NetworkEpochMetric) => ScatterPlotData,
): ExperimentResult {
  const tensors: Tensor[] = [];

  if (last) {
    last.weights.weights.forEach((layer, index) => {
      const flat = layer.flat();
      tensors.push(
        runtime.createTensor(
          flat,
          [layer.length, layer[0]?.length ?? 0],
          'float32',
          `${defaults.tensorPrefix}-pesos-${index}`,
        ),
      );
    });
    tensors.push(
      runtime.createTensor([last.loss], [1], 'float32', `${defaults.tensorPrefix}-loss`),
      runtime.createTensor([last.accuracy], [1], 'float32', `${defaults.tensorPrefix}-acuracia`),
    );
  }

  const result: ExperimentResult = {
    tensors,
    codeSnippet: defaults.codeSnippet.join('\n'),
  };

  if (last) {
    result.visualizationData = scatterFor(last);
  }

  return result;
}

/** Confusion matrix of the final weights over the training points. */
export function finalConfusion(
  last: Pick<NetworkEpochMetric, 'weights'>,
  architecture: NetworkArchitecture,
  points: readonly LabeledPoint[],
  classNames: readonly string[],
): ConfusionMatrix {
  const predictions = predictAll(last.weights, architecture, points);
  return confusionMatrix(predictions, points, classNames);
}
