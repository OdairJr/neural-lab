import { inject, Injectable } from '@angular/core';
import type { Tensor, TensorContainer } from '@tensorflow/tfjs';
import { Subscription } from 'rxjs';
import { bytesToMB, mbToBytes } from '@core/utils/units';
import { TFJS_TOKEN } from './tfjs.token';

/** A point-in-time view of TensorFlow.js memory usage. */
export interface TfjsMemorySnapshot {
  timestamp: number;
  numTensors: number;
  numBytes: number;
  numDataBuffers: number;
  unreliable: boolean;
  usedMemoryMB: number;
  peakMemoryMB: number;
}

export interface MemoryWatchOptions {
  /** Poll interval in milliseconds (default 1000). */
  intervalMs?: number;
  /** Usage ratio (of the budget) at which `onWarning` fires (default 0.8). */
  warningRatio?: number;
  /** Usage ratio (of the budget) at which `onCritical` fires (default 0.95). */
  criticalRatio?: number;
}

type MemoryLevel = 'ok' | 'warning' | 'critical';

/**
 * Centralizes TF.js tensor lifecycle management.
 *
 * All lab tensor operations must go through this service so that stray
 * tensors are tracked and disposed predictably, and so memory pressure can be
 * surfaced to the UI before WebGL contexts run out of memory.
 */
@Injectable({ providedIn: 'root' })
export class TfjsMemoryService {
  private readonly tf = inject(TFJS_TOKEN);
  private readonly tracked = new Map<string, Tensor>();
  private peakBytes = 0;

  /**
   * Runs `fn` inside `tf.tidy`, disposing all intermediate tensors it creates
   * except those returned by `fn`.
   */
  tidy<T extends TensorContainer>(fn: () => T, label?: string): T {
    return label ? this.tf.tidy(label, fn) : this.tf.tidy(fn);
  }

  /**
   * Registers a tensor for automatic disposal. Re-tracking the same label
   * disposes the previously tracked tensor first.
   */
  track<T extends Tensor>(tensor: T, label: string): T {
    const previous = this.tracked.get(label);
    if (previous && previous !== tensor && !previous.isDisposed) {
      previous.dispose();
    }
    this.tracked.set(label, tensor);
    return tensor;
  }

  /** Number of tensors currently tracked by this service. */
  getTrackedCount(): number {
    return this.tracked.size;
  }

  /**
   * Disposes every tracked tensor. When `trackedOnly` is false it also
   * disposes TF.js variables that were created outside the tracking registry.
   */
  disposeAll(trackedOnly = true): void {
    for (const tensor of this.tracked.values()) {
      if (!tensor.isDisposed) {
        tensor.dispose();
      }
    }
    this.tracked.clear();

    if (!trackedOnly) {
      this.tf.disposeVariables();
    }
  }

  /** Returns the current TF.js memory snapshot, tracking the peak usage. */
  getMemorySnapshot(): TfjsMemorySnapshot {
    const memory = this.tf.memory();
    this.peakBytes = Math.max(this.peakBytes, memory.numBytes);
    return {
      timestamp: Date.now(),
      numTensors: memory.numTensors,
      numBytes: memory.numBytes,
      numDataBuffers: memory.numDataBuffers,
      unreliable: memory.unreliable ?? false,
      usedMemoryMB: bytesToMB(memory.numBytes),
      peakMemoryMB: bytesToMB(this.peakBytes),
    };
  }

  /**
   * Polls memory usage against `budgetMB`. `onWarning` fires when usage
   * crosses the warning ratio (80% by default) and `onCritical` when it
   * crosses the critical ratio (95% by default). Each callback fires only on
   * a threshold crossing, not on every poll.
   *
   * @returns a `Subscription` that stops watching when unsubscribed.
   */
  watchMemory(
    budgetMB: number,
    onWarning: () => void,
    onCritical: () => void,
    options: MemoryWatchOptions = {},
  ): Subscription {
    const intervalMs = options.intervalMs ?? 1000;
    const warningRatio = options.warningRatio ?? 0.8;
    const criticalRatio = options.criticalRatio ?? 0.95;
    const budgetBytes = mbToBytes(budgetMB);
    let level: MemoryLevel = 'ok';

    const timer = setInterval(() => {
      const { numBytes } = this.tf.memory();
      const ratio = budgetBytes > 0 ? numBytes / budgetBytes : 0;

      if (ratio >= criticalRatio) {
        if (level !== 'critical') {
          level = 'critical';
          onCritical();
        }
        return;
      }

      if (ratio >= warningRatio) {
        if (level === 'ok') {
          level = 'warning';
          onWarning();
        }
        return;
      }

      level = 'ok';
    }, intervalMs);

    return new Subscription(() => clearInterval(timer));
  }
}
