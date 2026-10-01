/**
 * Training Web Worker: runs batch gradient descent off the main thread and
 * streams one metric per epoch. The math lives in `../utils/regression` so the
 * main-thread fallback and the unit tests exercise exactly the same code.
 *
 * This file is bundled as a module Worker through the
 * `new Worker(new URL('./training.worker', import.meta.url))` pattern in
 * `training-worker.service.ts`.
 */

import { gradientDescentRun } from '../utils/regression';
import { trainNetwork } from '../utils/neural-network';
import type {
  TrainingWorkerInbound,
  TrainingWorkerOutbound,
} from './training-protocol';

interface WorkerScope {
  postMessage: (message: TrainingWorkerOutbound) => void;
  addEventListener: (
    type: 'message',
    listener: (event: MessageEvent<TrainingWorkerInbound>) => void,
  ) => void;
}

const scope = self as unknown as WorkerScope;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

scope.addEventListener('message', (event) => {
  const message = event.data;
  if (message?.type === 'train') {
    runRegression(message.config);
  } else if (message?.type === 'train-network') {
    runNetwork(message.config);
  }
});

function runRegression(config: Extract<TrainingWorkerInbound, { type: 'train' }>['config']): void {
  const delay = Math.max(0, config.epochDelayMs ?? 0);
  const result = gradientDescentRun(config.data, {
    learningRate: config.learningRate,
    epochs: config.epochs,
    initialW: config.initialW,
    initialB: config.initialB,
    divergeThreshold: config.divergeThreshold,
  });

  void (async () => {
    for (const metric of result.history) {
      scope.postMessage({ type: 'epoch', metric });
      if (delay > 0) {
        await sleep(delay);
      }
    }
    scope.postMessage({
      type: 'done',
      diverged: result.diverged,
      epochsRun: result.epochsRun,
      w: result.w,
      b: result.b,
      loss: result.loss,
    });
  })();
}

function runNetwork(
  config: Extract<TrainingWorkerInbound, { type: 'train-network' }>['config'],
): void {
  const delay = Math.max(0, config.epochDelayMs ?? 0);
  const result = trainNetwork(config);

  void (async () => {
    for (const metric of result.history) {
      scope.postMessage({ type: 'network-epoch', metric });
      if (delay > 0) {
        await sleep(delay);
      }
    }
    scope.postMessage({
      type: 'network-done',
      epochsRun: result.history.length - 1,
      loss: result.loss,
      accuracy: result.accuracy,
    });
  })();
}
