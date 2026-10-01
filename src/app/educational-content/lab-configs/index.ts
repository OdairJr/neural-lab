import { lab01TensorsConfig } from './lab-01-tensors';
import { lab02ManipulationConfig } from './lab-02-manipulation';
import { lab03ElementwiseConfig } from './lab-03-elementwise';
import { lab04ReductionsConfig } from './lab-04-reductions';
import { lab05MatrixConfig } from './lab-05-matrix';
import { lab06BroadcastingConfig } from './lab-06-broadcasting';
import { lab07LinearAlgebraConfig } from './lab-07-linear-algebra';
import { lab08MlFundamentalsConfig } from './lab-08-ml-fundamentals';
import { lab09LinearRegressionConfig } from './lab-09-linear-regression';
import { lab10GradientDescentConfig } from './lab-10-gradient-descent';
import { lab11NeuronConfig } from './lab-11-neuron';
import { lab12ActivationsConfig } from './lab-12-activations';
import { lab13NeuralNetworksConfig } from './lab-13-neural-networks';
import { lab14ClassificationConfig } from './lab-14-classification';
import { lab15ImagesConfig } from './lab-15-images';
import { lab16MemoryConfig } from './lab-16-memory';
import type { LaboratoryConfig } from '@domain/content';

/** Ordered list of every V1 laboratory config, by journey order. */
export const LAB_CONFIGS: readonly LaboratoryConfig[] = [
  lab01TensorsConfig,
  lab02ManipulationConfig,
  lab03ElementwiseConfig,
  lab04ReductionsConfig,
  lab05MatrixConfig,
  lab06BroadcastingConfig,
  lab07LinearAlgebraConfig,
  lab08MlFundamentalsConfig,
  lab09LinearRegressionConfig,
  lab10GradientDescentConfig,
  lab11NeuronConfig,
  lab12ActivationsConfig,
  lab13NeuralNetworksConfig,
  lab14ClassificationConfig,
  lab15ImagesConfig,
  lab16MemoryConfig,
];

/** Finds a full lab config by URL slug. */
export function findLabConfigBySlug(slug: string): LaboratoryConfig | undefined {
  return LAB_CONFIGS.find((config) => config.slug === slug);
}

/** Finds a full lab config by stable id. */
export function findLabConfigById(id: string): LaboratoryConfig | undefined {
  return LAB_CONFIGS.find((config) => config.id === id);
}
