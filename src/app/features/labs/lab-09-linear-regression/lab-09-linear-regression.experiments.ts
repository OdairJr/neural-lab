import { meanSquaredError, mseGradients, predict, type DataPoint } from '@core/utils';
import { REGRESSION_DATASET } from '@content/lab-configs/lab-09-linear-regression';
import type { ExperimentFn, SyncExperimentFn } from '@shared/experiments';

export const LAB_09_LINEAR_FIT = 'lab-09-linear-fit';

export function regressionData(): DataPoint[] {
  return REGRESSION_DATASET.map((point) => ({ x: point.x, y: point.y }));
}

/**
 * Experiment for Lab 9: evaluates a candidate line `ŷ = w·x + b`, plotting the
 * data with the current line and publishing predictions, residuals and the MSE
 * gradients to the "Under the Hood" panel.
 */
export const linearFitExperiment: SyncExperimentFn = (params, runtime) => {
  const w = Number(params['w'] ?? 0);
  const b = Number(params['b'] ?? 0);
  const data = regressionData();
  const xs = data.map((point) => point.x);
  const ys = data.map((point) => point.y);
  const predictions = xs.map((x) => predict(x, w, b));
  const residuals = predictions.map((value, index) => value - ys[index]);
  const mse = meanSquaredError(data, w, b);
  const { dw, db } = mseGradients(data, w, b);

  const predictionTensor = runtime.createTensor(
    predictions,
    [predictions.length],
    'float32',
    'lab-09-predictions',
  );
  const residualTensor = runtime.createTensor(
    residuals,
    [residuals.length],
    'float32',
    'lab-09-residuals',
  );
  const gradientTensor = runtime.createTensor([dw, db], [2], 'float32', 'lab-09-gradient');
  const mseTensor = runtime.createTensor([mse], [1], 'float32', 'lab-09-mse');

  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);

  return {
    tensors: [predictionTensor, residualTensor, gradientTensor, mseTensor],
    visualizationData: {
      type: 'scatter-plot',
      title: `ŷ = ${w}x + ${b} · MSE = ${mse.toFixed(3)} · ∂MSE/∂w = ${dw.toFixed(
        2,
      )} · ∂MSE/∂b = ${db.toFixed(2)}`,
      points: data.map((point) => ({ ...point, label: 'dados' })),
      lines: [
        {
          label: 'reta atual',
          color: '#111827',
          points: [
            { x: xMin, y: predict(xMin, w, b) },
            { x: xMax, y: predict(xMax, w, b) },
          ],
        },
      ],
      xLabel: 'x (tamanho)',
      yLabel: 'y (preço)',
    },
    codeSnippet: [
      `const predictions = tf.add(tf.mul(xs, ${w}), ${b});`,
      'const errors = tf.sub(predictions, ys);',
      'const mse = tf.mean(tf.square(errors));',
      'const dw = tf.mul(tf.mean(tf.mul(errors, xs)), 2);',
      'const db = tf.mul(tf.mean(errors), 2);',
    ].join('\n'),
  };
};

/** Experiment functions contributed by Lab 9. */
export const LAB_09_EXPERIMENTS = {
  [LAB_09_LINEAR_FIT]: linearFitExperiment,
} satisfies Record<string, ExperimentFn>;
