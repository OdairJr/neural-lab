import type { Tensor } from '@tensorflow/tfjs';
import { parseNumberList } from '@core/utils';
import type { ExperimentFn, SyncExperimentFn } from '@shared/experiments';
import type { LabRuntimeService } from '@shared/runtime';

export const LAB_03_ELEMENTWISE = 'lab-03-elementwise';

/** Recipe quantities: 3 recipes (rows) × 4 ingredients (columns). */
export const RECIPE_QUANTITIES = [2, 3, 1, 1, 4, 0, 2, 0.5, 1, 1, 0.5, 2];
export const RECIPE_QUANTITY_SHAPE = [3, 4];
export const DEFAULT_PRICES = [2, 0.5, 3, 4];
/** Total cost per recipe for the default prices. */
export const RECIPE_TOTALS = [12.5, 16, 12];

const BINARY_OPERATIONS = ['add', 'sub', 'mul', 'div', 'pow'] as const;

function applyBinary(
  runtime: LabRuntimeService,
  operation: string,
  a: Tensor,
  b: Tensor,
): Tensor {
  const tf = runtime.tf;
  switch (operation) {
    case 'add':
      return tf.add(a, b);
    case 'sub':
      return tf.sub(a, b);
    case 'div':
      return tf.div(a, b);
    case 'pow':
      return tf.pow(a, b);
    default:
      return tf.mul(a, b);
  }
}

/**
 * Experiment for Lab 3: combines the recipe quantity matrix with a price vector
 * using an element-wise operation. Binary operations exercise broadcasting
 * ([3, 4] with [4]); `sqrt` is applied element-wise to the quantities.
 */
export const elementwiseExperiment: SyncExperimentFn = (params, runtime) => {
  const operation = typeof params['operacao'] === 'string' ? params['operacao'] : 'mul';
  const parsedPrices = parseNumberList(params['precos']);
  const pricesValid = parsedPrices.length === DEFAULT_PRICES.length;
  const prices = pricesValid ? parsedPrices : DEFAULT_PRICES;
  const note = pricesValid ? '' : ' · preços inválidos, usando os padrões';

  const quantities = runtime.createTensor(
    RECIPE_QUANTITIES,
    RECIPE_QUANTITY_SHAPE,
    'float32',
    'lab-03-quantities',
  );
  const priceTensor = runtime.createTensor(prices, [prices.length], 'float32', 'lab-03-prices');

  const isBinary = (BINARY_OPERATIONS as readonly string[]).includes(operation);
  const result = isBinary
    ? applyBinary(runtime, operation, quantities, priceTensor)
    : runtime.tf.sqrt(quantities);
  const tracked = runtime.track(result, 'lab-03-result');
  const snapshot = runtime.getSnapshot('lab-03-result');

  const code = isBinary
    ? `tf.${operation}(quantidades, precos)`
    : 'tf.sqrt(quantidades)';

  return {
    tensors: [quantities, priceTensor, tracked],
    visualizationData: snapshot
      ? {
          type: 'tensor-grid',
          tensor: snapshot,
          title: `${operation} · [3, 4] → [${tracked.shape.join(', ')}]${note}`,
        }
      : undefined,
    codeSnippet: [
      `const quantidades = tf.tensor([...], [3, 4]);`,
      `const precos = tf.tensor([${prices.join(', ')}]);`,
      `const result = ${code};`,
    ].join('\n'),
  };
};

/** Experiment functions contributed by Lab 3. */
export const LAB_03_EXPERIMENTS = {
  [LAB_03_ELEMENTWISE]: elementwiseExperiment,
} satisfies Record<string, ExperimentFn>;
