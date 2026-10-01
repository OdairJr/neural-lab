export type ActivationFunction = 'sigmoid' | 'relu' | 'tanh' | 'softmax';

/** Evaluates a single-variable activation function (softmax is unnormalized). */
export function activationValue(fn: ActivationFunction, x: number): number {
  switch (fn) {
    case 'sigmoid':
      return 1 / (1 + Math.exp(-x));
    case 'relu':
      return Math.max(0, x);
    case 'tanh':
      return Math.tanh(x);
    case 'softmax':
      // Single-logit softmax is defined up to normalization; the series
      // helper normalizes across the sampled points.
      return Math.exp(x);
  }
}

/** Evaluates the derivative of a single-variable activation function. */
export function activationDerivative(fn: ActivationFunction, x: number): number {
  switch (fn) {
    case 'sigmoid': {
      const sigmoid = activationValue('sigmoid', x);
      return sigmoid * (1 - sigmoid);
    }
    case 'relu':
      return x > 0 ? 1 : 0;
    case 'tanh': {
      const tanh = Math.tanh(x);
      return 1 - tanh * tanh;
    }
    case 'softmax': {
      const softmax = Math.exp(x);
      return softmax;
    }
  }
}

export interface ActivationSeries {
  values: number[];
  derivatives: number[];
}

/**
 * Samples an activation function (and derivative) over the given x values.
 * For softmax the sampled values are normalized so they sum to 1.
 */
export function activationSeries(fn: ActivationFunction, xs: readonly number[]): ActivationSeries {
  const raw = xs.map((x) => activationValue(fn, x));
  const sum = raw.reduce((total, value) => total + value, 0);

  if (fn === 'softmax') {
    const values = sum === 0 ? raw : raw.map((value) => value / sum);
    return { values, derivatives: values };
  }

  return { values: raw, derivatives: xs.map((x) => activationDerivative(fn, x)) };
}

/** Generates `count` evenly spaced x values within [min, max]. */
export function sampleRange(min: number, max: number, count = 61): number[] {
  if (count < 2) {
    return [min];
  }
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, index) => min + step * index);
}
