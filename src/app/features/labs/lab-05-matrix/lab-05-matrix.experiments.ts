import type { Tensor } from '@tensorflow/tfjs';
import type { ExperimentFn, SyncExperimentFn } from '@shared/experiments';

export const LAB_05_MATRIX = 'lab-05-matrix';

/** Quantities: 3 products (rows) × 5 regions (columns). */
export const QUANTITIES = [10, 12, 14, 16, 18, 20, 18, 16, 14, 12, 5, 7, 9, 11, 13];
export const QUANTITY_SHAPE = [3, 5];
export const PRICES = [2, 3, 2.5, 4, 1.5];
export const PRICE_SHAPE = [5, 1];
/** Revenue per product for the default data. */
export const REVENUE = [182, 208, 117];

/** Shape of a matrix product, or `null` when the dimensions are incompatible. */
export function matMulShape(
  a: readonly number[],
  b: readonly number[],
): number[] | null {
  if (a.length !== 2 || b.length !== 2 || a[1] !== b[0]) {
    return null;
  }
  return [a[0], b[1]];
}

/** Converts a flat tensor into a row-major matrix (promoting rank 1 to [1, n]). */
export function toMatrix(values: readonly number[], shape: readonly number[]): number[][] {
  if (shape.length >= 2) {
    const columns = shape[shape.length - 1];
    const rows = values.length / (columns || 1);
    return Array.from({ length: rows }, (_, row) =>
      values.slice(row * columns, (row + 1) * columns),
    );
  }
  return [[...values]];
}

/**
 * Experiment for Lab 5: computes `matMul(quantities, prices)` or the transpose
 * of the quantities matrix. When `forcarErro` is enabled it deliberately builds
 * an incompatible price matrix and explains the shape rule instead of throwing.
 */
export const matrixExperiment: SyncExperimentFn = (params, runtime) => {
  const operation = typeof params['operacao'] === 'string' ? params['operacao'] : 'matMul';
  const forceError = params['forcarErro'] === true;

  const quantities = runtime.createTensor(QUANTITIES, QUANTITY_SHAPE, 'float32', 'lab-05-a');

  let result: Tensor;
  let code: string;
  let note = '';
  let priceTensor: Tensor | undefined;

  if (operation === 'transpose') {
    result = runtime.tf.transpose(quantities);
    code = 'tf.transpose(quantidades)';
  } else {
    const prices = forceError ? PRICES.slice(0, 4) : PRICES;
    const priceShape = forceError ? [4, 1] : PRICE_SHAPE;
    priceTensor = runtime.createTensor(prices, priceShape, 'float32', 'lab-05-b');
    try {
      result = runtime.tf.matMul(quantities, priceTensor);
      code = 'tf.matMul(quantidades, precos)';
    } catch {
      result = quantities;
      note = ' · shape incompatível: [3, 5] × [4, 1] — a 2ª dimensão de A deve ser igual à 1ª de B';
      code = 'tf.matMul(quantidades, precos) // erro de shape';
    }
  }

  const tracked = runtime.track(result, 'lab-05-result');
  const snapshot = runtime.getSnapshot('lab-05-result');
  const matrix = toMatrix(snapshot?.values ?? [], tracked.shape);

  const tensors = priceTensor ? [quantities, priceTensor, tracked] : [quantities, tracked];

  return {
    tensors,
    visualizationData: snapshot
      ? {
          type: 'matrix-heatmap',
          matrix,
          title: `${code} → shape [${tracked.shape.join(', ')}]${note}`,
        }
      : undefined,
    codeSnippet: `const result = ${code};`,
  };
};

/** Experiment functions contributed by Lab 5. */
export const LAB_05_EXPERIMENTS = {
  [LAB_05_MATRIX]: matrixExperiment,
} satisfies Record<string, ExperimentFn>;
