import {
  buildArchitecture,
  classifyPoint,
  confusionMatrix,
  createNetwork,
  decisionBoundaryMesh,
  decisionLine,
  evaluateNetwork,
  generateDataset,
  neuronForward,
  softmax,
  trainNetwork,
  weightedSum,
} from './neural-network';

describe('neuron math', () => {
  it('computes the weighted sum with bias', () => {
    expect(weightedSum([1, 2], [0.5, -1], 0.25)).toBeCloseTo(-1.25, 10);
  });

  it('applies the activation to the weighted sum', () => {
    const step = neuronForward([1, 1], [1, 1], -1, 'sigmoid');
    expect(step.z).toBeCloseTo(1, 10);
    expect(step.output).toBeCloseTo(1 / (1 + Math.exp(-1)), 10);
  });

  it('builds a decision line that satisfies w1 x + w2 y + b = 0', () => {
    const line = decisionLine(2, -1, 1, -5, 5);
    for (const point of line) {
      expect(2 * point.x - 1 * point.y + 1).toBeCloseTo(0, 10);
    }
  });
});

describe('softmax', () => {
  it('normalizes logits into a probability distribution', () => {
    const values = softmax([1, 2, 3]);
    expect(values.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 10);
    expect(values[2]).toBeGreaterThan(values[0]);
  });
});

describe('datasets', () => {
  it('generates deterministic points with the expected classes', () => {
    const points = generateDataset('moons', 40, 0.1, 3);
    expect(points).toHaveLength(40);
    const labels = new Set(points.map((point) => point.label));
    expect(labels).toEqual(new Set([0, 1]));
  });

  it('generates a three-class blob dataset for multiclass training', () => {
    const points = generateDataset('blobs', 60, 0.1, 1);
    expect(new Set(points.map((point) => point.label))).toEqual(new Set([0, 1, 2]));
  });
});

describe('training a network', () => {
  it('reaches high accuracy on the moons dataset with one hidden layer', () => {
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
    expect(result.history[0].loss).toBeGreaterThan(result.loss);
  });

  it('is deterministic for a fixed seed', () => {
    const points = generateDataset('moons', 60, 0.1, 7);
    const options = {
      points,
      classNames: ['a', 'b'],
      hidden: [4],
      hiddenActivation: 'tanh' as const,
      learningRate: 0.5,
      epochs: 20,
      seed: 5,
    };
    const first = trainNetwork(options);
    const second = trainNetwork(options);
    expect(first.loss).toBeCloseTo(second.loss, 12);
  });

  it('fails to solve XOR with a linear model but succeeds with a hidden layer', () => {
    const points = generateDataset('xor', 120, 0.15, 11);
    const linear = trainNetwork({
      points,
      classNames: ['a', 'b'],
      hidden: [],
      hiddenActivation: 'tanh',
      learningRate: 0.5,
      epochs: 200,
      seed: 3,
    });
    expect(linear.accuracy).toBeLessThan(0.75);

    const nonlinear = trainNetwork({
      points,
      classNames: ['a', 'b'],
      hidden: [4],
      hiddenActivation: 'tanh',
      learningRate: 0.5,
      epochs: 400,
      seed: 3,
    });
    expect(nonlinear.accuracy).toBeGreaterThan(0.9);
  });

  it('classifies multiclass blobs with softmax output', () => {
    const points = generateDataset('blobs', 150, 0.12, 2);
    const result = trainNetwork({
      points,
      classNames: ['a', 'b', 'c'],
      hidden: [8],
      hiddenActivation: 'tanh',
      learningRate: 0.5,
      epochs: 200,
      seed: 9,
    });
    expect(result.architecture.outputActivation).toBe('softmax');
    expect(result.accuracy).toBeGreaterThan(0.9);
  });

  it('produces a boundary mesh matching the network predictions', () => {
    const points = generateDataset('moons', 80, 0.1, 7);
    const architecture = buildArchitecture([4], 2, 'tanh');
    const weights = createNetwork(architecture, 1);
    const extent = [-2, 2, -2, 2] as [number, number, number, number];
    const boundary = decisionBoundaryMesh(weights, architecture, extent, ['a', 'b'], 6);

    expect(boundary.mesh).toHaveLength(6);
    expect(boundary.mesh[0]).toHaveLength(6);
    const sample = classifyPoint(weights, architecture, -1.5, -1.5);
    expect(boundary.mesh[0][0]).toBe(sample);
    expect(points).toHaveLength(80);
  });
});

describe('evaluation helpers', () => {
  it('computes a confusion matrix over predictions', () => {
    const points = [
      { x: 0, y: 0, label: 0 },
      { x: 1, y: 1, label: 1 },
      { x: 2, y: 2, label: 1 },
    ];
    const result = confusionMatrix([0, 1, 0], points, ['a', 'b']);
    expect(result.matrix[0][0]).toBe(1);
    expect(result.matrix[1][0]).toBe(1);
    expect(result.matrix[1][1]).toBe(1);
  });

  it('reports accuracy through evaluateNetwork', () => {
    const architecture = buildArchitecture([], 2, 'tanh');
    const weights = createNetwork(architecture, 1);
    const metrics = evaluateNetwork(weights, architecture, [{ x: 0, y: 0, label: 0 }]);
    expect(metrics.accuracy).toBeGreaterThanOrEqual(0);
    expect(metrics.accuracy).toBeLessThanOrEqual(1);
  });
});
