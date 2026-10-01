import type { Tensor } from '@tensorflow/tfjs';
import type { ExperimentFn } from '@shared/experiments';
import type { LabRuntimeService } from '@shared/runtime';

export const LAB_04_REDUCTIONS = 'lab-04-reductions';

/** Temperatures: 3 cities (rows) × 7 days (columns). */
export const TEMPERATURES = [
  22, 23, 25, 24, 26, 27, 25, 30, 31, 32, 33, 32, 31, 30, 18, 17, 19, 20, 19, 18, 17,
];
export const TEMPERATURE_SHAPE = [3, 7];
export const CITY_LABELS = ['São Paulo', 'Rio de Janeiro', 'Curitiba'];
export const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function reduce(runtime: LabRuntimeService, operation: string, tensor: Tensor, axis: number): Tensor {
  const tf = runtime.tf;
  switch (operation) {
    case 'sum':
      return tf.sum(tensor, axis);
    case 'min':
      return tf.min(tensor, axis);
    case 'max':
      return tf.max(tensor, axis);
    default:
      return tf.mean(tensor, axis);
  }
}

function labelsFor(length: number): string[] {
  if (length === DAY_LABELS.length) {
    return [...DAY_LABELS];
  }
  if (length === CITY_LABELS.length) {
    return [...CITY_LABELS];
  }
  return Array.from({ length }, (_, index) => String(index));
}

/**
 * Experiment for Lab 4: reduces the city×day temperature matrix along the
 * selected axis and plots the resulting vector as a line chart.
 */
export const reductionsExperiment: ExperimentFn = (params, runtime) => {
  const operation = typeof params['reducao'] === 'string' ? params['reducao'] : 'mean';
  const axis = Number(params['axis'] ?? 0);

  const temperatures = runtime.createTensor(
    TEMPERATURES,
    TEMPERATURE_SHAPE,
    'float32',
    'lab-04-temperatures',
  );
  const reduced = runtime.track(reduce(runtime, operation, temperatures, axis), 'lab-04-result');
  const snapshot = runtime.getSnapshot('lab-04-result');
  const values = snapshot?.values ?? [];

  return {
    tensors: [temperatures, reduced],
    visualizationData: {
      type: 'line-chart',
      title: `${operation} · axis ${axis} → shape [${reduced.shape.join(', ')}]`,
      series: [{ label: `${operation}`, data: values }],
      xLabels: labelsFor(values.length),
    },
    codeSnippet: [
      `const t = tf.tensor([...], [3, 7]);`,
      `const result = tf.${operation}(t, ${axis});`,
    ].join('\n'),
  };
};

/** Experiment functions contributed by Lab 4. */
export const LAB_04_EXPERIMENTS = {
  [LAB_04_REDUCTIONS]: reductionsExperiment,
} satisfies Record<string, ExperimentFn>;
