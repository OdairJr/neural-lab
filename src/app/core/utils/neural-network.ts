/**
 * Pure neuron and neural-network math shared by the Phase 4 labs (11-14), the
 * training Web Worker and the unit tests. Like `regression.ts`, everything here
 * is side-effect free and free of TF.js so it can run on any thread.
 *
 * A network is represented as plain nested arrays so the exact same training
 * code runs in the worker, in the main-thread fallback and in tests.
 */

export type ActivationName = 'sigmoid' | 'relu' | 'tanh' | 'linear' | 'softmax';

/** Numerically stable logistic sigmoid. */
export function sigmoid(x: number): number {
  if (x >= 0) {
    return 1 / (1 + Math.exp(-x));
  }
  const z = Math.exp(x);
  return z / (1 + z);
}

/** Rectified linear unit. */
export function relu(x: number): number {
  return x > 0 ? x : 0;
}

/** Applies a scalar activation (softmax is vector-valued and handled separately). */
export function activateScalar(name: ActivationName, x: number): number {
  switch (name) {
    case 'sigmoid':
      return sigmoid(x);
    case 'relu':
      return relu(x);
    case 'tanh':
      return Math.tanh(x);
    case 'linear':
      return x;
    case 'softmax':
      return Math.exp(x);
  }
}

/** Derivative of a scalar activation given its pre-activation `z` and output `a`. */
export function activationGradient(name: ActivationName, z: number, a: number): number {
  switch (name) {
    case 'sigmoid':
      return a * (1 - a);
    case 'relu':
      return z > 0 ? 1 : 0;
    case 'tanh':
      return 1 - a * a;
    case 'linear':
      return 1;
    case 'softmax':
      return a * (1 - a);
  }
}

/** Normalizes a vector of logits into a probability distribution. */
export function softmax(values: readonly number[]): number[] {
  const max = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - max));
  const sum = exps.reduce((total, value) => total + value, 0);
  if (sum === 0) {
    return exps.map(() => 1 / Math.max(1, values.length));
  }
  return exps.map((value) => value / sum);
}

/* -------------------------------------------------------------------------- */
/* A single neuron                                                            */
/* -------------------------------------------------------------------------- */

export interface NeuronStep {
  /** Weighted sum `z = Σ wᵢ·xᵢ + b`. */
  z: number;
  /** Activation output `a = f(z)`. */
  output: number;
}

/** Weighted sum of the inputs plus the bias. */
export function weightedSum(
  inputs: readonly number[],
  weights: readonly number[],
  bias: number,
): number {
  let sum = bias;
  for (let index = 0; index < inputs.length; index++) {
    sum += inputs[index] * (weights[index] ?? 0);
  }
  return sum;
}

/** Forward pass of a single neuron: weighted sum followed by activation. */
export function neuronForward(
  inputs: readonly number[],
  weights: readonly number[],
  bias: number,
  activation: ActivationName = 'sigmoid',
): NeuronStep {
  const z = weightedSum(inputs, weights, bias);
  return { z, output: activateScalar(activation, z) };
}

/**
 * Two endpoints of the decision line `w1·x + w2·y + b = 0` for a 2D neuron.
 * Falls back to a vertical segment when the line is (near) vertical.
 */
export function decisionLine(
  w1: number,
  w2: number,
  b: number,
  xMin: number,
  xMax: number,
): { x: number; y: number }[] {
  if (Math.abs(w2) < 1e-9) {
    const x = Math.abs(w1) < 1e-9 ? 0 : -b / w1;
    return [
      { x, y: -10 },
      { x, y: 10 },
    ];
  }
  const yAt = (x: number): number => -(w1 * x + b) / w2;
  return [
    { x: xMin, y: yAt(xMin) },
    { x: xMax, y: yAt(xMax) },
  ];
}

/* -------------------------------------------------------------------------- */
/* Datasets                                                                   */
/* -------------------------------------------------------------------------- */

export interface LabeledPoint {
  x: number;
  y: number;
  label: number;
}

export type DatasetName = 'moons' | 'spiral' | 'circles' | 'xor' | 'blobs';

export const DATASET_CLASS_NAMES: Readonly<Record<DatasetName, readonly string[]>> = {
  moons: ['Vermelho', 'Azul'],
  spiral: ['Vermelho', 'Azul'],
  circles: ['Interno', 'Externo'],
  xor: ['Diagonal 1', 'Diagonal 2'],
  blobs: ['Classe 1', 'Classe 2', 'Classe 3'],
};

/** Small, deterministic PRNG (mulberry32) so datasets/training are reproducible. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generates one of the synthetic 2D classification datasets. */
export function generateDataset(
  name: DatasetName,
  count = 120,
  noise = 0.1,
  seed = 7,
): LabeledPoint[] {
  const random = createRandom(seed);
  const jitter = (): number => (random() * 2 - 1) * noise;
  const points: LabeledPoint[] = [];

  if (name === 'xor') {
    const centers: { x: number; y: number; label: number }[] = [
      { x: -0.7, y: -0.7, label: 0 },
      { x: 0.7, y: 0.7, label: 0 },
      { x: -0.7, y: 0.7, label: 1 },
      { x: 0.7, y: -0.7, label: 1 },
    ];
    const perCenter = Math.max(1, Math.floor(count / centers.length));
    for (const center of centers) {
      for (let index = 0; index < perCenter; index++) {
        points.push({
          x: center.x + jitter(),
          y: center.y + jitter(),
          label: center.label,
        });
      }
    }
    return points;
  }

  if (name === 'circles') {
    const half = Math.max(1, Math.floor(count / 2));
    for (let index = 0; index < half; index++) {
      const angle = (index / half) * Math.PI * 2;
      points.push({
        x: Math.cos(angle) * 0.35 + jitter(),
        y: Math.sin(angle) * 0.35 + jitter(),
        label: 0,
      });
      const outerAngle = angle + 0.4;
      points.push({
        x: Math.cos(outerAngle) * 0.95 + jitter(),
        y: Math.sin(outerAngle) * 0.95 + jitter(),
        label: 1,
      });
    }
    return points;
  }

  if (name === 'spiral') {
    const perClass = Math.max(1, Math.floor(count / 2));
    for (let index = 0; index < perClass; index++) {
      const ratio = perClass === 1 ? 0 : index / (perClass - 1);
      const t = 1.75 * Math.PI * ratio;
      points.push({
        x: ratio * Math.cos(t) + jitter(),
        y: ratio * Math.sin(t) + jitter(),
        label: 0,
      });
      points.push({
        x: ratio * Math.cos(t + Math.PI) + jitter(),
        y: ratio * Math.sin(t + Math.PI) + jitter(),
        label: 1,
      });
    }
    return points;
  }

  if (name === 'blobs') {
    const centers: { x: number; y: number }[] = [
      { x: -1.2, y: -0.8 },
      { x: 1.2, y: -0.8 },
      { x: 0, y: 1.2 },
    ];
    const perClass = Math.max(1, Math.floor(count / centers.length));
    centers.forEach((center, label) => {
      for (let index = 0; index < perClass; index++) {
        points.push({
          x: center.x + jitter() * 1.5,
          y: center.y + jitter() * 1.5,
          label,
        });
      }
    });
    return points;
  }

  const perClass = Math.max(1, Math.floor(count / 2));
  for (let index = 0; index < perClass; index++) {
    const ratio = perClass === 1 ? 0 : index / (perClass - 1);
    const t = Math.PI * ratio;
    points.push({ x: Math.cos(t) - 0.5 + jitter(), y: Math.sin(t) - 0.25 + jitter(), label: 0 });
    points.push({
      x: 1 - Math.cos(t) - 0.5 + jitter(),
      y: 0.5 - Math.sin(t) - 0.25 + jitter(),
      label: 1,
    });
  }
  return points;
}

/* -------------------------------------------------------------------------- */
/* Multilayer network                                                        */
/* -------------------------------------------------------------------------- */

export interface NetworkArchitecture {
  inputSize: number;
  /** Sizes of the hidden layers, from input to output. */
  hidden: number[];
  hiddenActivation: ActivationName;
  /** Activation applied to the output layer. */
  outputActivation: ActivationName;
  outputSize: number;
}

export interface NetworkWeights {
  /** `weights[layer][neuron][input]`. */
  weights: number[][][];
  /** `biases[layer][neuron]`. */
  biases: number[][];
}

export interface NetworkForward {
  /** `activations[0]` is the input, the last entry is the output. */
  activations: number[][];
  /** Pre-activations for every layer except the input. */
  preActivations: number[][];
}

/** Builds the architecture implied by the hidden sizes and class count. */
export function buildArchitecture(
  hidden: readonly number[],
  classCount: number,
  hiddenActivation: ActivationName,
): NetworkArchitecture {
  return {
    inputSize: 2,
    hidden: [...hidden],
    hiddenActivation,
    outputActivation: classCount > 2 ? 'softmax' : 'sigmoid',
    outputSize: classCount > 2 ? classCount : 1,
  };
}

/** Creates a randomly initialized network with Glorot-uniform weights. */
export function createNetwork(architecture: NetworkArchitecture, seed = 1): NetworkWeights {
  const random = createRandom(seed);
  const sizes = [
    architecture.inputSize,
    ...architecture.hidden,
    architecture.outputSize,
  ];
  const weights: number[][][] = [];
  const biases: number[][] = [];

  for (let layer = 0; layer < sizes.length - 1; layer++) {
    const nIn = sizes[layer];
    const nOut = sizes[layer + 1];
    const limit = Math.sqrt(6 / (nIn + nOut));
    const layerWeights: number[][] = [];
    for (let neuron = 0; neuron < nOut; neuron++) {
      const row: number[] = [];
      for (let input = 0; input < nIn; input++) {
        row.push((random() * 2 - 1) * limit);
      }
      layerWeights.push(row);
    }
    weights.push(layerWeights);
    biases.push(new Array(nOut).fill(0));
  }

  return { weights, biases };
}

/** Forward pass of the network for a single input vector. */
export function forwardNetwork(
  weights: NetworkWeights,
  architecture: NetworkArchitecture,
  input: readonly number[],
): NetworkForward {
  const activations: number[][] = [input.slice()];
  const preActivations: number[][] = [];
  let current = input.slice();

  for (let layer = 0; layer < weights.weights.length; layer++) {
    const isOutput = layer === weights.weights.length - 1;
    const activation = isOutput ? architecture.outputActivation : architecture.hiddenActivation;
    const z = weights.weights[layer].map((row, neuron) =>
      weightedSum(current, row, weights.biases[layer][neuron]),
    );
    const output = activation === 'softmax' ? softmax(z) : z.map((value) => activateScalar(activation, value));
    preActivations.push(z);
    activations.push(output);
    current = output;
  }

  return { activations, preActivations };
}

function toTargets(label: number, outputSize: number): number[] {
  if (outputSize === 1) {
    return [label];
  }
  const target = new Array(outputSize).fill(0);
  target[label] = 1;
  return target;
}

function sampleLoss(output: readonly number[], label: number, outputSize: number): number {
  if (outputSize === 1) {
    const p = Math.min(1 - 1e-12, Math.max(1e-12, output[0]));
    return -(label * Math.log(p) + (1 - label) * Math.log(1 - p));
  }
  const p = Math.min(1 - 1e-12, Math.max(1e-12, output[label] ?? 1e-12));
  return -Math.log(p);
}

/** Predicted class index (argmax for softmax, threshold for sigmoid). */
export function classifyPoint(
  weights: NetworkWeights,
  architecture: NetworkArchitecture,
  x: number,
  y: number,
): number {
  const { activations } = forwardNetwork(weights, architecture, [x, y]);
  const output = activations[activations.length - 1];
  if (output.length === 1) {
    return output[0] >= 0.5 ? 1 : 0;
  }
  let best = 0;
  for (let index = 1; index < output.length; index++) {
    if (output[index] > output[best]) {
      best = index;
    }
  }
  return best;
}

export interface TrainingMetrics {
  loss: number;
  accuracy: number;
}

/** Evaluates cross-entropy loss and accuracy on the given labelled points. */
export function evaluateNetwork(
  weights: NetworkWeights,
  architecture: NetworkArchitecture,
  points: readonly LabeledPoint[],
): TrainingMetrics {
  if (points.length === 0) {
    return { loss: 0, accuracy: 0 };
  }
  let loss = 0;
  let correct = 0;
  for (const point of points) {
    const { activations } = forwardNetwork(weights, architecture, [point.x, point.y]);
    const output = activations[activations.length - 1];
    loss += sampleLoss(output, point.label, architecture.outputSize);
    const predicted = architecture.outputSize === 1 ? (output[0] >= 0.5 ? 1 : 0) : argmax(output);
    if (predicted === point.label) {
      correct++;
    }
  }
  return { loss: loss / points.length, accuracy: correct / points.length };
}

function argmax(values: readonly number[]): number {
  let best = 0;
  for (let index = 1; index < values.length; index++) {
    if (values[index] > values[best]) {
      best = index;
    }
  }
  return best;
}

export interface NetworkTrainingConfig {
  points: LabeledPoint[];
  classNames: readonly string[];
  hidden: number[];
  hiddenActivation: ActivationName;
  learningRate: number;
  epochs: number;
  seed?: number;
}

export interface NetworkEpochMetric {
  epoch: number;
  loss: number;
  accuracy: number;
  /** Full weight snapshot after the epoch, for boundary/weight visualizations. */
  weights: NetworkWeights;
}

export interface NetworkTrainingResult {
  history: NetworkEpochMetric[];
  weights: NetworkWeights;
  architecture: NetworkArchitecture;
  loss: number;
  accuracy: number;
}

/**
 * Trains a fully-connected network with full-batch gradient descent and
 * cross-entropy loss. Returns one metric (with a weight snapshot) per epoch.
 */
export function trainNetwork(config: NetworkTrainingConfig): NetworkTrainingResult {
  const architecture = buildArchitecture(
    config.hidden,
    config.classNames.length,
    config.hiddenActivation,
  );
  const weights = createNetwork(architecture, config.seed ?? 1);
  const history: NetworkEpochMetric[] = [];
  const points = config.points;
  const epochs = Math.max(1, config.epochs);

  for (let epoch = 0; epoch <= epochs; epoch++) {
    const metrics = evaluateNetwork(weights, architecture, points);
    history.push({
      epoch,
      loss: metrics.loss,
      accuracy: metrics.accuracy,
      weights: cloneWeights(weights),
    });

    if (epoch === epochs || points.length === 0) {
      continue;
    }
    updateWeights(weights, architecture, points, config.learningRate);
  }

  const last = history[history.length - 1];
  return {
    history,
    weights,
    architecture,
    loss: last?.loss ?? 0,
    accuracy: last?.accuracy ?? 0,
  };
}

function updateWeights(
  weights: NetworkWeights,
  architecture: NetworkArchitecture,
  points: readonly LabeledPoint[],
  learningRate: number,
): void {
  const layerCount = weights.weights.length;
  const gradWeights: number[][][] = weights.weights.map((layer) =>
    layer.map((row) => new Array(row.length).fill(0)),
  );
  const gradBiases: number[][] = weights.biases.map((layer) => new Array(layer.length).fill(0));

  for (const point of points) {
    const { activations, preActivations } = forwardNetwork(weights, architecture, [point.x, point.y]);
    const deltas: number[][] = new Array(layerCount);

    // Output layer: sigmoid/softmax with cross-entropy yields `p - y`.
    const output = activations[layerCount];
    const targets = toTargets(point.label, architecture.outputSize);
    deltas[layerCount - 1] = output.map((value, index) => value - targets[index]);

    for (let layer = layerCount - 2; layer >= 0; layer--) {
      const nextWeights = weights.weights[layer + 1];
      const nextDelta = deltas[layer + 1];
      const activation = activations[layer + 1];
      const z = preActivations[layer];
      const delta = new Array(z.length).fill(0);
      for (let next = 0; next < nextWeights.length; next++) {
        for (let input = 0; input < z.length; input++) {
          delta[input] += nextWeights[next][input] * nextDelta[next];
        }
      }
      for (let input = 0; input < z.length; input++) {
        delta[input] *= activationGradient(architecture.hiddenActivation, z[input], activation[input]);
      }
      deltas[layer] = delta;
    }

    for (let layer = 0; layer < layerCount; layer++) {
      const previous = activations[layer];
      const delta = deltas[layer];
      for (let neuron = 0; neuron < delta.length; neuron++) {
        for (let input = 0; input < previous.length; input++) {
          gradWeights[layer][neuron][input] += delta[neuron] * previous[input];
        }
        gradBiases[layer][neuron] += delta[neuron];
      }
    }
  }

  const scale = learningRate / Math.max(1, points.length);
  for (let layer = 0; layer < layerCount; layer++) {
    for (let neuron = 0; neuron < weights.weights[layer].length; neuron++) {
      for (let input = 0; input < weights.weights[layer][neuron].length; input++) {
        weights.weights[layer][neuron][input] -= scale * gradWeights[layer][neuron][input];
      }
      weights.biases[layer][neuron] -= scale * gradBiases[layer][neuron];
    }
  }
}

function cloneWeights(weights: NetworkWeights): NetworkWeights {
  return {
    weights: weights.weights.map((layer) => layer.map((row) => [...row])),
    biases: weights.biases.map((layer) => [...layer]),
  };
}

/* -------------------------------------------------------------------------- */
/* Decision boundaries and evaluation                                         */
/* -------------------------------------------------------------------------- */

export interface BoundaryMesh {
  /** Row-major class indices; row 0 is the lowest y. */
  mesh: number[][];
  extent: [number, number, number, number];
  classes: string[];
}

/**
 * Samples the network prediction over a grid. The mesh is row-major with row 0
 * at `yMin` so it lines up with the scatter-plot boundary rendering.
 */
export function decisionBoundaryMesh(
  weights: NetworkWeights,
  architecture: NetworkArchitecture,
  extent: [number, number, number, number],
  classes: readonly string[],
  resolution = 20,
): BoundaryMesh {
  const [xMin, xMax, yMin, yMax] = extent;
  const mesh: number[][] = [];
  for (let row = 0; row < resolution; row++) {
    const y = yMin + ((row + 0.5) / resolution) * (yMax - yMin);
    const line: number[] = [];
    for (let column = 0; column < resolution; column++) {
      const x = xMin + ((column + 0.5) / resolution) * (xMax - xMin);
      line.push(classifyPoint(weights, architecture, x, y));
    }
    mesh.push(line);
  }
  return { mesh, extent, classes: [...classes] };
}

/** Computes the extent that tightly surrounds a set of labelled points. */
export function pointsExtent(
  points: readonly LabeledPoint[],
  padding = 0.35,
): [number, number, number, number] {
  if (points.length === 0) {
    return [-1, 1, -1, 1];
  }
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return [
    Math.min(...xs) - padding,
    Math.max(...xs) + padding,
    Math.min(...ys) - padding,
    Math.max(...ys) + padding,
  ];
}

export interface ConfusionMatrix {
  matrix: number[][];
  labels: string[];
}

/** Confusion matrix `[actual][predicted]` over the given points. */
export function confusionMatrix(
  predictions: readonly number[],
  points: readonly LabeledPoint[],
  classNames: readonly string[],
): ConfusionMatrix {
  const size = Math.max(classNames.length, 2);
  const matrix = Array.from({ length: size }, () => new Array(size).fill(0));
  points.forEach((point, index) => {
    const predicted = predictions[index] ?? 0;
    if (matrix[point.label]) {
      matrix[point.label][predicted] += 1;
    }
  });
  return { matrix, labels: [...classNames] };
}

/** Predicts the class index for every point. */
export function predictAll(
  weights: NetworkWeights,
  architecture: NetworkArchitecture,
  points: readonly LabeledPoint[],
): number[] {
  return points.map((point) => classifyPoint(weights, architecture, point.x, point.y));
}

/** Mean squared error between a neuron output and a target (Lab 11). */
export function meanSquaredErrorValue(predicted: readonly number[], target: readonly number[]): number {
  if (predicted.length === 0) {
    return 0;
  }
  let sum = 0;
  for (let index = 0; index < predicted.length; index++) {
    const error = predicted[index] - (target[index] ?? 0);
    sum += error * error;
  }
  return sum / predicted.length;
}
