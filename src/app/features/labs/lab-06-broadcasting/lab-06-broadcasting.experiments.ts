import type { ExperimentFn } from '@shared/experiments';

export const LAB_06_BROADCASTING = 'lab-06-broadcasting';

export const CELSIUS_VECTOR = [0, 10, 20, 30];
export const CELSIUS_MATRIX = [
  22, 23, 25, 24, 26, 27, 25, 30, 31, 32, 33, 32, 31, 30, 18, 17, 19, 20, 19, 18, 17,
];
export const MATRIX_SHAPE = [3, 7];
export const CITY_CORRECTIONS = [1, 2, 3];
/** [0, 10, 20, 30] °C converted to °F. */
export const FAHRENHEIT_VECTOR = [32, 50, 68, 86];

/**
 * Pure broadcast shape calculation (right-aligned). Returns `null` when the
 * two shapes are not broadcast-compatible.
 */
export function broadcastShape(
  a: readonly number[],
  b: readonly number[],
): number[] | null {
  const length = Math.max(a.length, b.length);
  const result: number[] = [];
  for (let offset = 1; offset <= length; offset++) {
    const left = a[a.length - offset] ?? 1;
    const right = b[b.length - offset] ?? 1;
    if (left !== right && left !== 1 && right !== 1) {
      return null;
    }
    result.unshift(Math.max(left, right));
  }
  return result;
}

/**
 * Experiment for Lab 6: demonstrates broadcasting in the Celsius → Fahrenheit
 * conversion, both vector+scalar and matrix+vector.
 */
export const broadcastingExperiment: ExperimentFn = (params, runtime) => {
  const mode = typeof params['modo'] === 'string' ? params['modo'] : 'vetor-escalar';
  const tf = runtime.tf;

  if (mode === 'matriz-vetor') {
    const matrix = runtime.createTensor(CELSIUS_MATRIX, MATRIX_SHAPE, 'float32', 'lab-06-matrix');
    const corrections = runtime.createTensor(
      CITY_CORRECTIONS,
      [CITY_CORRECTIONS.length],
      'float32',
      'lab-06-corrections',
    );
    const result = runtime.track(
      runtime.tidy(() => tf.add(matrix, tf.expandDims(corrections, 1))),
      'lab-06-result',
    );
    const snapshot = runtime.getSnapshot('lab-06-result');

    return {
      tensors: [matrix, corrections, result],
      visualizationData: snapshot
        ? {
            type: 'tensor-grid',
            tensor: snapshot,
            title: `[3, 7] + [3, 1] → [${result.shape.join(', ')}]`,
          }
        : undefined,
      codeSnippet: [
        'const matriz = tf.tensor([...], [3, 7]);',
        'const correcao = tf.expandDims(tf.tensor([1, 2, 3]), 1); // [3, 1]',
        'const result = tf.add(matriz, correcao); // broadcast → [3, 7]',
      ].join('\n'),
    };
  }

  const vector = runtime.createTensor(
    CELSIUS_VECTOR,
    [CELSIUS_VECTOR.length],
    'float32',
    'lab-06-vector',
  );
  const result = runtime.track(
    runtime.tidy(() => tf.add(tf.mul(vector, 1.8), 32)),
    'lab-06-result',
  );
  const snapshot = runtime.getSnapshot('lab-06-result');

  return {
    tensors: [vector, result],
    visualizationData: snapshot
      ? {
          type: 'tensor-grid',
          tensor: snapshot,
          title: `[4] × escalar + escalar → [${result.shape.join(', ')}]`,
        }
      : undefined,
    codeSnippet: [
      'const celsius = tf.tensor([0, 10, 20, 30]);',
      'const result = tf.add(tf.mul(celsius, 1.8), 32); // [32, 50, 68, 86]',
    ].join('\n'),
  };
};

/** Experiment functions contributed by Lab 6. */
export const LAB_06_EXPERIMENTS = {
  [LAB_06_BROADCASTING]: broadcastingExperiment,
} satisfies Record<string, ExperimentFn>;
