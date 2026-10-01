import type { DataPoint, GradientDescentStep } from '../utils/regression';

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

export type TrainingWorkerInbound = TrainRequest;
export type TrainingWorkerOutbound = EpochMessage | DoneMessage;
