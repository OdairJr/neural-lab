export {
  TRAINING_WORKER_FACTORY,
  TrainingWorkerService,
} from './training-worker.service';
export type {
  DoneMessage,
  EpochMessage,
  GradientDescentConfig,
  TrainRequest,
  TrainingMetric,
  TrainingWorkerInbound,
  TrainingWorkerOutbound,
} from './training-protocol';
