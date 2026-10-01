import type { ExperimentFn, SyncExperimentFn } from '@shared/experiments';
import {
  activationSeries,
  sampleRange,
  type ActivationFunction,
} from '@shared/visualizations';

export const LAB_12_ACTIVATION = 'lab-12-activation';

const FUNCTIONS: readonly ActivationFunction[] = ['sigmoid', 'relu', 'tanh', 'softmax'];

const DERIVATIVE_FORMULAS: Readonly<Record<ActivationFunction, string>> = {
  sigmoid: "σ'(z) = σ(z)·(1 - σ(z))",
  relu: "ReLU'(z) = z > 0 ? 1 : 0",
  tanh: "tanh'(z) = 1 - tanh(z)²",
  softmax: '∂softmax/∂z é a matriz Jacobiana (cada saída depende de todos os logits)',
};

function asActivation(value: unknown): ActivationFunction {
  return FUNCTIONS.includes(value as ActivationFunction)
    ? (value as ActivationFunction)
    : 'sigmoid';
}

/**
 * Experiment for Lab 12: samples the selected activation (and its derivative)
 * and publishes the values to the "Under the Hood" panel so learners can check
 * the formulas and spot the saturation zones.
 */
export const activationExperiment: SyncExperimentFn = (params, runtime) => {
  const fn = asActivation(params['fn']);
  const showDerivative = Boolean(params['derivative']);
  const xs = sampleRange(-6, 6, 13);
  const { values, derivatives } = activationSeries(fn, xs);
  const centerIndex = Math.floor(xs.length / 2);
  const centerX = xs[centerIndex];
  const centerValue = values[centerIndex];

  const xTensor = runtime.createTensor(xs, [xs.length], 'float32', 'lab-12-x');
  const valueTensor = runtime.createTensor(values, [values.length], 'float32', 'lab-12-fx');
  const derivativeTensor = runtime.createTensor(
    derivatives,
    [derivatives.length],
    'float32',
    'lab-12-dfx',
  );

  return {
    tensors: [xTensor, valueTensor, derivativeTensor],
    visualizationData: {
      type: 'activation-curve',
      fn,
      xRange: [-6, 6],
      showDerivative,
    },
    codeSnippet: [
      `const z = tf.scalar(${Number(centerX.toFixed(2))});`,
      `const a = tf.${fn}(z);`,
      `// f(z) = ${centerValue.toFixed(4)}`,
      `// ${DERIVATIVE_FORMULAS[fn]}`,
    ].join('\n'),
  };
};

/** Experiment functions contributed by Lab 12. */
export const LAB_12_EXPERIMENTS = {
  [LAB_12_ACTIVATION]: activationExperiment,
} satisfies Record<string, ExperimentFn>;
