import { Injectable } from '@angular/core';
import type { Tensor } from '@tensorflow/tfjs';
import type { VisualizationData } from '@domain/content';
import type { LabRuntimeService } from '../runtime/lab-runtime.service';

/** Output of a lab-provided experiment function. */
export interface ExperimentResult {
  /** Tensors to publish to the "Under the Hood" panel. */
  tensors?: Tensor[];
  /** Plain data consumed by the visualization component. */
  visualizationData?: VisualizationData;
  /** TF.js code snippet shown in the panel/code view. */
  codeSnippet?: string;
}

/**
 * A lab experiment implementation. It receives the current parameter values
 * and the lab runtime, and must create every tensor through `runtime.tidy()`
 * or `runtime.track()`.
 */
export type ExperimentFn = (
  params: Record<string, unknown>,
  runtime: LabRuntimeService,
) => ExperimentResult;

/**
 * Registry of experiment functions keyed by `ExperimentConfig.experimentFnId`.
 * Lab features register their implementations; the generic
 * `ExperimentStageComponent` resolves them at render time.
 */
@Injectable({ providedIn: 'root' })
export class ExperimentRegistry {
  private readonly functions = new Map<string, ExperimentFn>();

  register(id: string, fn: ExperimentFn): void {
    this.functions.set(id, fn);
  }

  get(id: string): ExperimentFn | undefined {
    return this.functions.get(id);
  }

  has(id: string): boolean {
    return this.functions.has(id);
  }

  /** Removes every registered function (used by tests). */
  clear(): void {
    this.functions.clear();
  }
}
