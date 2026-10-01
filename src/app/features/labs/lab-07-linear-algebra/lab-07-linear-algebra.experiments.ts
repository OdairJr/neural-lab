import type { ExperimentFn, SyncExperimentFn } from '@shared/experiments';

export const LAB_07_LINEAR_TRANSFORM = 'lab-07-linear-transform';

export interface Point2D {
  x: number;
  y: number;
}

/** The set of points transformed by the experiment. */
export const ORIGINAL_POINTS: readonly Point2D[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
  { x: 1, y: 1 },
];

/**
 * Rotation (degrees) followed by uniform scale, as a 2×2 row-major matrix in
 * the **row-vector** convention, so that `p' = p · M` matches
 * `tf.matMul(points, M)` when points are stored as rows.
 */
export function rotationScaleMatrix(
  angleDegrees: number,
  scale: number,
): [number, number, number, number] {
  const radians = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return [scale * cos, scale * sin, -scale * sin, scale * cos];
}

/** Dot product of two vectors. */
export function dotProduct(a: readonly number[], b: readonly number[]): number {
  return a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
}

/** Applies a row-major 2×2 matrix (row-vector convention) to a point. */
export function transformPoint(
  point: Point2D,
  matrix: readonly [number, number, number, number],
): Point2D {
  const [a, b, c, d] = matrix;
  return {
    x: a * point.x + c * point.y,
    y: b * point.x + d * point.y,
  };
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}

/**
 * Experiment for Lab 7: applies a rotation + scale matrix to a set of 2D points
 * and plots the original and transformed points side by side on a scatter plot.
 */
export const linearTransformExperiment: SyncExperimentFn = (params, runtime) => {
  const angle = Number(params['angulo'] ?? 0);
  const scale = Number(params['escala'] ?? 1);
  const tf = runtime.tf;

  const points = runtime.createTensor(
    ORIGINAL_POINTS.flatMap((point) => [point.x, point.y]),
    [ORIGINAL_POINTS.length, 2],
    'float32',
    'lab-07-points',
  );
  const matrix = runtime.createTensor(rotationScaleMatrix(angle, scale), [2, 2], 'float32', 'lab-07-matrix');
  const transformed = runtime.track(tf.matMul(points, matrix), 'lab-07-transformed');
  const transformedValues = runtime.getSnapshot('lab-07-transformed')?.values ?? [];

  const transformedPoints = Array.from(
    { length: transformedValues.length / 2 },
    (_, index) => ({
      x: round(transformedValues[index * 2]),
      y: round(transformedValues[index * 2 + 1]),
      label: 'conjunto B',
    }),
  );

  const matrixSnapshot = runtime.getSnapshot('lab-07-matrix');
  const determinant = (matrixSnapshot?.values[0] ?? 1) * (matrixSnapshot?.values[3] ?? 1)
    - (matrixSnapshot?.values[1] ?? 0) * (matrixSnapshot?.values[2] ?? 0);

  return {
    tensors: [points, matrix, transformed],
    visualizationData: {
      type: 'scatter-plot',
      title: `M = escala ${scale} · rotação ${angle}° · det = ${round(determinant)}`,
      points: [
        ...ORIGINAL_POINTS.map((point) => ({ ...point, label: 'conjunto A' })),
        ...transformedPoints,
      ],
      xLabel: 'x',
      yLabel: 'y',
    },
    codeSnippet: [
      'const pontos = tf.tensor([...], [5, 2]);',
      `const M = tf.tensor([${rotationScaleMatrix(angle, scale).join(', ')}], [2, 2]);`,
      'const result = tf.matMul(pontos, M);',
    ].join('\n'),
  };
};

/** Experiment functions contributed by Lab 7. */
export const LAB_07_EXPERIMENTS = {
  [LAB_07_LINEAR_TRANSFORM]: linearTransformExperiment,
} satisfies Record<string, ExperimentFn>;
