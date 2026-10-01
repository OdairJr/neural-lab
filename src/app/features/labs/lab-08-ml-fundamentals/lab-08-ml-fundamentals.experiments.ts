import { pearsonCorrelation } from '@core/utils';
import { HOUSING_DATASET, type HousingRow } from '@content/lab-configs/lab-08-ml-fundamentals';
import type { ExperimentFn, SyncExperimentFn } from '@shared/experiments';

export const LAB_08_HOUSING = 'lab-08-housing';

export const FEATURE_LABELS: Readonly<Record<string, string>> = {
  area: 'área (m²)',
  quartos: 'quartos',
  idade: 'idade (anos)',
  distancia: 'distância do centro (km)',
};

/** Extracts a feature column from the housing dataset. */
export function featureValues(feature: string, dataset: readonly HousingRow[] = HOUSING_DATASET): number[] {
  switch (feature) {
    case 'quartos':
      return dataset.map((row) => row.quartos);
    case 'idade':
      return dataset.map((row) => row.idade);
    case 'distancia':
      return dataset.map((row) => row.distancia);
    default:
      return dataset.map((row) => row.area);
  }
}

/** Extracts the price (label) column from the housing dataset. */
export function labelValues(dataset: readonly HousingRow[] = HOUSING_DATASET): number[] {
  return dataset.map((row) => row.preco);
}

/**
 * Experiment for Lab 8: plots the selected housing feature against the price
 * and reports the Pearson correlation so learners can compare features.
 */
export const housingExperiment: SyncExperimentFn = (params, runtime) => {
  const feature = typeof params['feature'] === 'string' ? params['feature'] : 'area';
  const xs = featureValues(feature);
  const ys = labelValues();
  const correlation = pearsonCorrelation(xs, ys);
  const label = FEATURE_LABELS[feature] ?? feature;

  const featureTensor = runtime.createTensor(xs, [xs.length], 'float32', 'lab-08-feature');
  const priceTensor = runtime.createTensor(ys, [ys.length], 'float32', 'lab-08-price');

  return {
    tensors: [featureTensor, priceTensor],
    visualizationData: {
      type: 'scatter-plot',
      title: `${label} × preço — correlação de Pearson ${correlation.toFixed(3)}`,
      points: xs.map((x, index) => ({ x, y: ys[index], label: 'casas' })),
      xLabel: label,
      yLabel: 'preço (mil R$)',
    },
    codeSnippet: [
      `const x = tf.tensor1d(${JSON.stringify(xs)});`,
      `const y = tf.tensor1d(${JSON.stringify(ys)});`,
      '// A correlação mede a força da relação linear entre x e y.',
    ].join('\n'),
  };
};

/** Experiment functions contributed by Lab 8. */
export const LAB_08_EXPERIMENTS = {
  [LAB_08_HOUSING]: housingExperiment,
} satisfies Record<string, ExperimentFn>;
