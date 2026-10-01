import { inject, Injectable, provideEnvironmentInitializer } from '@angular/core';
import type { EnvironmentProviders } from '@angular/core';
import type { Tensor } from '@tensorflow/tfjs';
import type { Observable } from 'rxjs';
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
 *
 * Returning an `Observable` keeps a long-running experiment (e.g. worker-based
 * training) streaming results to the stage instead of blocking the first run.
 */
export type ExperimentFn = (
  params: Record<string, unknown>,
  runtime: LabRuntimeService,
) => ExperimentResult | Observable<ExperimentResult>;

/**
 * An experiment that completes synchronously. Labs with deterministic,
 * parameter-driven experiments (no streaming) declare this narrower type so
 * callers, including tests, get the concrete `ExperimentResult` back.
 */
export type SyncExperimentFn = (
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

/**
 * Experiment functions for a lab, either as a static record or as a factory
 * evaluated inside the route's injection context (so it can inject services
 * such as `TrainingWorkerService`).
 */
export type ExperimentProvider =
  | Readonly<Record<string, ExperimentFn>>
  | (() => Readonly<Record<string, ExperimentFn>>);

/**
 * Route-level provider that registers a set of experiment functions when the
 * owning lab feature is loaded. Keeping registration behind a lazy route means
 * a lab's experiment code is only downloaded when that lab is visited.
 */
export function provideExperiments(experiments: ExperimentProvider): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    const registry = inject(ExperimentRegistry);
    const functions = typeof experiments === 'function' ? experiments() : experiments;
    for (const [id, fn] of Object.entries(functions)) {
      registry.register(id, fn);
    }
  });
}
