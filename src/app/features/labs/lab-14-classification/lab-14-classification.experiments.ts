import { TrainingWorkerService } from '@core/training';
import type { ExperimentFn } from '@shared/experiments';
import { createNetworkExperiment } from '../network-training';

export const LAB_14_CLASSIFICATION = 'lab-14-classification';

/**
 * Lab 14 experiment: trains the classifier in the worker and streams the
 * decision boundary. With `hidden = 0` the linear model stalls at ~50% on XOR;
 * a single hidden layer of 2 tanh neurons solves it.
 */
export function createLab14ClassificationExperiment(
  worker: Pick<TrainingWorkerService, 'runNetwork'>,
): ExperimentFn {
  return createNetworkExperiment(worker, {
    dataset: 'xor',
    hiddenLayers: 1,
    neurons: 2,
    activation: 'tanh',
    learningRate: 0.5,
    epochs: 120,
    seed: 1,
    label: 'Fronteira',
    tensorPrefix: 'lab-14',
    codeSnippet: [
      '// Saída multiclasse usa softmax + one-hot nos rótulos:',
      'const oneHot = tf.oneHot(labels, numClasses);',
      'const probabilities = tf.softmax(logits);',
      '// Matriz de confusão: linhas = classe real, colunas = previsto.',
      'const predicted = tf.argMax(probabilities, 1);',
    ],
  });
}
