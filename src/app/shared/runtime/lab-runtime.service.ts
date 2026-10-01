import { inject, Injectable, signal, type OnDestroy } from '@angular/core';
import type { DataType, Tensor, TensorContainer, TensorLike } from '@tensorflow/tfjs';
import { Observable, Subject } from 'rxjs';
import {
  TensorSerializerService,
  TfjsMemoryService,
  TFJS_TOKEN,
  type TensorSnapshot,
  type TfjsMemorySnapshot,
  type TfjsModule,
} from '@core/tfjs';

/** A single tensor operation published for the "Under the Hood" panel. */
export interface ComputationEvent {
  operation: string;
  inputs: TensorSnapshot[];
  output?: TensorSnapshot;
  code?: string;
  timestamp: number;
}

export interface PublishComputationOptions {
  inputs?: Tensor[];
  output?: Tensor;
  code?: string;
}

let tensorCounter = 0;

/**
 * Per-lab runtime managing tensor lifecycle, experiment state and the
 * computation stream consumed by the "Under the Hood" panel.
 *
 * It is intentionally **not** `providedIn: 'root'`: the lab route providers
 * create one instance per lab visit so Angular destroys it (and calls
 * `dispose()`) as soon as the user navigates away, releasing every tensor.
 */
@Injectable()
export class LabRuntimeService implements OnDestroy {
  private readonly tfModule = inject(TFJS_TOKEN);
  private readonly memory = inject(TfjsMemoryService);
  private readonly serializer = inject(TensorSerializerService);

  private readonly tensors = new Map<string, Tensor>();
  private readonly experimentState = new Map<string, unknown>();
  private readonly computations = new Subject<ComputationEvent>();

  readonly latestComputation = signal<ComputationEvent | null>(null);

  /** The TF.js module instance for this lab. */
  get tf(): TfjsModule {
    return this.tfModule;
  }

  /** Read-only stream of computation events for the panel. */
  get computations$(): Observable<ComputationEvent> {
    return this.computations.asObservable();
  }

  /** Runs `fn` inside `tf.tidy`, disposing intermediates except its return. */
  tidy<T extends TensorContainer>(fn: () => T, label?: string): T {
    return this.memory.tidy(fn, label);
  }

  /** Registers a tensor for automatic disposal when the lab is left. */
  track<T extends Tensor>(tensor: T, label: string): T {
    this.tensors.set(label, tensor);
    return this.memory.track(tensor, label);
  }

  /** Creates and tracks a tensor. */
  createTensor(
    data: TensorLike,
    shape?: number[],
    dtype?: DataType,
    label?: string,
  ): Tensor {
    const tensor = this.tfModule.tensor(data, shape, dtype);
    return this.track(tensor, label ?? `tensor-${++tensorCounter}`);
  }

  /** Serializes a tracked tensor for the "Under the Hood" panel. */
  getSnapshot(label: string): TensorSnapshot | undefined {
    const tensor = this.tensors.get(label);
    return tensor ? this.serializer.serialize(tensor) : undefined;
  }

  /** Current TF.js memory usage. */
  getMemorySnapshot(): TfjsMemorySnapshot {
    return this.memory.getMemorySnapshot();
  }

  /** Publishes a computation event, serializing any provided tensors. */
  publishComputation(
    operation: string,
    options: PublishComputationOptions = {},
  ): ComputationEvent {
    const event: ComputationEvent = {
      operation,
      inputs: (options.inputs ?? []).map((tensor) => this.serializer.serialize(tensor)),
      output: options.output ? this.serializer.serialize(options.output) : undefined,
      code: options.code,
      timestamp: Date.now(),
    };
    this.latestComputation.set(event);
    this.computations.next(event);
    return event;
  }

  /** Stores the parameter state of an experiment stage. */
  setExperimentState(stageType: string, state: unknown): void {
    this.experimentState.set(stageType, state);
  }

  /** Returns the stored parameter state of an experiment stage. */
  getExperimentState(stageType: string): unknown {
    return this.experimentState.get(stageType);
  }

  /** Disposes every tracked tensor and clears all lab-scoped state. */
  dispose(): void {
    this.memory.disposeAll();
    this.tensors.clear();
    this.experimentState.clear();
    this.latestComputation.set(null);
    this.computations.complete();
  }

  ngOnDestroy(): void {
    this.dispose();
  }
}
