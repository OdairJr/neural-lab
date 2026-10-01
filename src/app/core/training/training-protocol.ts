import type { DataPoint, GradientDescentStep } from '../utils/regression';
import type {
  NetworkEpochMetric,
  NetworkTrainingConfig,
} from '../utils/neural-network';

export type { NetworkEpochMetric, NetworkTrainingConfig } from '../utils/neural-network';

/** Configuration sent from the main thread to the training worker. */
export interface GradientDescentConfig {
  data: DataPoint[];
  learningRate: number;
  epochs: number;
  initialW?: number;
  initialB?: number;
  /** Optional delay between epoch messages so the chart can animate. */
  epochDelayMs?: number;
  divergeThreshold?: number;
}

/** Per-epoch metric streamed back to the main thread. */
export type TrainingMetric = GradientDescentStep;

export interface TrainRequest {
  type: 'train';
  config: GradientDescentConfig;
}

export interface EpochMessage {
  type: 'epoch';
  metric: TrainingMetric;
}

export interface DoneMessage {
  type: 'done';
  diverged: boolean;
  epochsRun: number;
  w: number;
  b: number;
  loss: number;
}

/**
 * Configuration for a classification training run. Kept separate from the
 * regression config so the original Lab 10 protocol stays backward compatible.
 */
export interface NetworkTrainingRequestConfig extends NetworkTrainingConfig {
  /** Optional delay between epoch messages so the boundary can animate. */
  epochDelayMs?: number;
}

export interface TrainNetworkRequest {
  type: 'train-network';
  config: NetworkTrainingRequestConfig;
}

export interface NetworkEpochMessage {
  type: 'network-epoch';
  metric: NetworkEpochMetric;
}

export interface NetworkDoneMessage {
  type: 'network-done';
  epochsRun: number;
  loss: number;
  accuracy: number;
}

export type TrainingWorkerInbound = TrainRequest | TrainNetworkRequest;
export type TrainingWorkerOutbound =
  | EpochMessage
  | DoneMessage
  | NetworkEpochMessage
  | NetworkDoneMessage;
