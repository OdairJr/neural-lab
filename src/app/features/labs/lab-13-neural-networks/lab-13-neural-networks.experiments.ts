import { TrainingWorkerService } from '@core/training';
import type { ExperimentFn } from '@shared/experiments';
import { createNetworkExperiment } from '../network-training';

export const LAB_13_NETWORK = 'lab-13-network';

/**
 * Lab 13 experiment: builds and trains the network in the training Web Worker,
 * streaming the decision boundary per epoch. Defaults match the challenge
 * (> 90% accuracy on moons with a single hidden layer of 8 tanh neurons).
 */
export function createLab13NetworkExperiment(
  worker: Pick<TrainingWorkerService, 'runNetwork'>,
): ExperimentFn {
  return createNetworkExperiment(worker, {
    dataset: 'moons',
    hiddenLayers: 1,
    neurons: 8,
    activation: 'tanh',
    learningRate: 0.5,
    epochs: 200,
    seed: 4,
    label: 'Rede',
    tensorPrefix: 'lab-13',
    codeSnippet: [
      '// Um passo de backpropagation (batch):',
      'const errors = tf.sub(predictions, targets);',
      'const outputDelta = errors;',
      'const hiddenDelta = tf.mul(',
      '  tf.matMul(outputDelta, outputWeights),',
      "  tf.sub(1, tf.square(hiddenActivations)), // tanh'(z)",
      ');',
      'weights = tf.sub(weights, tf.mul(learningRate, gradients));',
    ],
  });
}
