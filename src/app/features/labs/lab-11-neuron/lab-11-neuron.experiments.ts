import {
  buildArchitecture,
  decisionBoundaryMesh,
  decisionLine,
  neuronForward,
  pointsExtent,
  type LabeledPoint,
  type NetworkWeights,
} from '@core/utils';
import { NEURON_CLUSTERS } from '@content/lab-configs/lab-11-neuron';
import type { ExperimentFn, SyncExperimentFn } from '@shared/experiments';

export const LAB_11_NEURON = 'lab-11-neuron';

/** The two clusters exposed as labelled points for the reusable helpers. */
export function neuronPoints(): LabeledPoint[] {
  return NEURON_CLUSTERS.map((point) => ({ ...point }));
}

function sigmoidNeuronWeights(w1: number, w2: number, b: number): NetworkWeights {
  return { weights: [[[w1, w2]]], biases: [[b]] };
}

/**
 * Experiment for Lab 11: evaluates a single sigmoid neuron on two 2D clusters.
 * Plots the points, the decision line and the shaded half-planes, and publishes
 * the weighted sum and activation of every point to the "Under the Hood" panel.
 */
export const neuronExperiment: SyncExperimentFn = (params, runtime) => {
  const w1 = Number(params['w1'] ?? 0);
  const w2 = Number(params['w2'] ?? 0);
  const b = Number(params['b'] ?? 0);
  const points = neuronPoints();

  const steps = points.map((point) => neuronForward([point.x, point.y], [w1, w2], b, 'sigmoid'));
  const predictions = steps.map((step) => (step.output >= 0.5 ? 1 : 0));
  const correct = predictions.filter((prediction, index) => prediction === points[index].label).length;
  const accuracy = points.length === 0 ? 0 : correct / points.length;

  const architecture = buildArchitecture([], 2, 'sigmoid');
  const weights = sigmoidNeuronWeights(w1, w2, b);
  const extent = pointsExtent(points);
  const boundary = decisionBoundaryMesh(weights, architecture, extent, ['Classe 0', 'Classe 1'], 20);
  const [xMin, xMax] = extent;
  const line = decisionLine(w1, w2, b, xMin, xMax);

  const weightTensor = runtime.createTensor([w1, w2, b], [3], 'float32', 'lab-11-pesos');
  const sumTensor = runtime.createTensor(
    steps.map((step) => step.z),
    [steps.length],
    'float32',
    'lab-11-soma-ponderada',
  );
  const activationTensor = runtime.createTensor(
    steps.map((step) => step.output),
    [steps.length],
    'float32',
    'lab-11-ativacao',
  );

  return {
    tensors: [weightTensor, sumTensor, activationTensor],
    visualizationData: {
      type: 'scatter-plot',
      title: `z = ${w1}·x1 + ${w2}·x2 + ${b} · acurácia = ${(accuracy * 100).toFixed(0)}%`,
      points: points.map((point) => ({
        x: point.x,
        y: point.y,
        label: point.label === 1 ? 'Classe 1' : 'Classe 0',
      })),
      lines: [{ label: 'fronteira (z = 0)', color: '#111827', points: line }],
      boundary: {
        mesh: boundary.mesh,
        extent: boundary.extent,
        classes: boundary.classes,
      },
      xLabel: 'x1',
      yLabel: 'x2',
    },
    codeSnippet: [
      `const z = tf.add(tf.add(tf.mul(x1, ${w1}), tf.mul(x2, ${w2})), ${b});`,
      'const a = tf.sigmoid(z);',
      'const classe = a.greaterEqual(0.5);',
    ].join('\n'),
  };
};

/** Experiment functions contributed by Lab 11. */
export const LAB_11_EXPERIMENTS = {
  [LAB_11_NEURON]: neuronExperiment,
} satisfies Record<string, ExperimentFn>;
