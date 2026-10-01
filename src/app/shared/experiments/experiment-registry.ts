import { inject, Injectable, provideEnvironmentInitializer } from '@angular/core';
import type { EnvironmentProviders } from '@angular/core';
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

/**
 * Route-level provider that registers a set of experiment functions when the
 * owning lab feature is loaded. Keeping registration behind a lazy route means
 * a lab's experiment code is only downloaded when that lab is visited.
 */
export function provideExperiments(
  functions: Readonly<Record<string, ExperimentFn>>,
): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    const registry = inject(ExperimentRegistry);
    for (const [id, fn] of Object.entries(functions)) {
      registry.register(id, fn);
    }
  });
}
