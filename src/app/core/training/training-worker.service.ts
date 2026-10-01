import { inject, Injectable, InjectionToken, type OnDestroy } from '@angular/core';
import { Observable, type Subscriber } from 'rxjs';
import { gradientDescentRun } from '../utils/regression';
import { trainNetwork } from '../utils/neural-network';
import type {
  GradientDescentConfig,
  NetworkEpochMetric,
  NetworkTrainingRequestConfig,
  TrainNetworkRequest,
  TrainRequest,
  TrainingMetric,
  TrainingWorkerOutbound,
} from './training-protocol';

/**
 * Factory used to create the training Worker. It is an injection token so unit
 * tests can substitute a fake worker and so the service can degrade gracefully
 * when Web Workers are unavailable.
 *
 * The `new Worker(new URL('./training.worker', import.meta.url))` expression is
 * recognised by the Angular application builder, which bundles the worker as a
 * separate module entry point.
 */
export const TRAINING_WORKER_FACTORY = new InjectionToken<() => Worker>(
  'TRAINING_WORKER_FACTORY',
  {
    providedIn: 'root',
    factory: () => () =>
      new Worker(new URL('./training.worker', import.meta.url), { type: 'module' }),
  },
);

/**
 * Runs multi-epoch gradient descent off the main thread and streams one
 * `TrainingMetric` per epoch. Falls back to computing on the main thread when
 * Workers are unsupported (or when the worker fails to start).
 */
@Injectable({ providedIn: 'root' })
export class TrainingWorkerService implements OnDestroy {
  private readonly workerFactory = inject(TRAINING_WORKER_FACTORY);
  private activeWorker: Worker | null = null;

  /**
   * Starts a training run and returns a cold observable of epoch metrics. The
   * observable completes after the final epoch; unsubscribing terminates the
   * worker.
   */
  run(config: GradientDescentConfig): Observable<TrainingMetric> {
    return new Observable<TrainingMetric>((subscriber) => {
      const worker = this.tryCreateWorker();
      if (worker) {
        return this.runOnWorker(worker, config, subscriber);
      }
      return this.runOnMainThread(config, subscriber);
    });
  }

  /**
   * Starts a classification training run and returns a cold observable of
   * per-epoch metrics. Uses the same worker and main-thread fallback strategy
   * as the regression run so Lab 10 is unaffected.
   */
  runNetwork(config: NetworkTrainingRequestConfig): Observable<NetworkEpochMetric> {
    return new Observable<NetworkEpochMetric>((subscriber) => {
      const worker = this.tryCreateWorker();
      if (worker) {
        return this.runNetworkOnWorker(worker, config, subscriber);
      }
      return this.runNetworkOnMainThread(config, subscriber);
    });
  }

  /** Terminates any in-flight worker. */
  cancel(): void {
    this.activeWorker?.terminate();
    this.activeWorker = null;
  }

  ngOnDestroy(): void {
    this.cancel();
  }

  private tryCreateWorker(): Worker | null {
    if (typeof Worker === 'undefined') {
      return null;
    }
    try {
      const worker = this.workerFactory();
      this.activeWorker = worker;
      return worker;
    } catch {
      return null;
    }
  }

  private runOnWorker(
    worker: Worker,
    config: GradientDescentConfig,
    subscriber: Subscriber<TrainingMetric>,
  ): () => void {
    const cleanup = (): void => {
      worker.terminate();
      if (this.activeWorker === worker) {
        this.activeWorker = null;
      }
    };

    worker.onmessage = (event: MessageEvent<TrainingWorkerOutbound>) => {
      const message = event.data;
      if (message.type === 'epoch') {
        if (!subscriber.closed) {
          subscriber.next(message.metric);
        }
      } else if (message.type === 'done') {
        if (!subscriber.closed) {
          subscriber.complete();
        }
        cleanup();
      }
    };
    worker.onerror = () => {
      if (!subscriber.closed) {
        subscriber.error(new Error('Falha ao executar o treino no worker.'));
      }
      cleanup();
    };

    const request: TrainRequest = { type: 'train', config };
    worker.postMessage(request);

    return cleanup;
  }

  private runNetworkOnWorker(
    worker: Worker,
    config: NetworkTrainingRequestConfig,
    subscriber: Subscriber<NetworkEpochMetric>,
  ): () => void {
    const cleanup = (): void => {
      worker.terminate();
      if (this.activeWorker === worker) {
        this.activeWorker = null;
      }
    };

    worker.onmessage = (event: MessageEvent<TrainingWorkerOutbound>) => {
      const message = event.data;
      if (message.type === 'network-epoch') {
        if (!subscriber.closed) {
          subscriber.next(message.metric);
        }
      } else if (message.type === 'network-done') {
        if (!subscriber.closed) {
          subscriber.complete();
        }
        cleanup();
      }
    };
    worker.onerror = () => {
      if (!subscriber.closed) {
        subscriber.error(new Error('Falha ao executar o treino da rede no worker.'));
      }
      cleanup();
    };

    const request: TrainNetworkRequest = { type: 'train-network', config };
    worker.postMessage(request);

    return cleanup;
  }

  private runNetworkOnMainThread(
    config: NetworkTrainingRequestConfig,
    subscriber: Subscriber<NetworkEpochMetric>,
  ): () => void {
    const result = trainNetwork(config);
    let index = 0;
    let cancelled = false;

    const tick = (): void => {
      if (cancelled || subscriber.closed) {
        return;
      }
      if (index < result.history.length) {
        subscriber.next(result.history[index++]);
        setTimeout(tick, 0);
      } else {
        subscriber.complete();
      }
    };
    tick();

    return () => {
      cancelled = true;
    };
  }

  private runOnMainThread(
    config: GradientDescentConfig,
    subscriber: Subscriber<TrainingMetric>,
  ): () => void {
    const result = gradientDescentRun(config.data, {
      learningRate: config.learningRate,
      epochs: config.epochs,
      initialW: config.initialW,
      initialB: config.initialB,
      divergeThreshold: config.divergeThreshold,
    });

    let index = 0;
    let cancelled = false;

    const tick = (): void => {
      if (cancelled || subscriber.closed) {
        return;
      }
      if (index < result.history.length) {
        subscriber.next(result.history[index++]);
        setTimeout(tick, 0);
      } else {
        subscriber.complete();
      }
    };
    tick();

    return () => {
      cancelled = true;
    };
  }
}
