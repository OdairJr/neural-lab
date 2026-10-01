import type { Route } from '@angular/router';
import type { LaboratoryConfig } from '@domain/content';
import { LAB_CONFIG } from '@features/lab-shell';
import { provideExperiments, type ExperimentFn } from '@shared/experiments';
import { LabRuntimeService } from '@shared/runtime';

/**
 * Builds the route for a single laboratory feature. The route provides the
 * lab's `LAB_CONFIG`, a fresh `LabRuntimeService` (disposed when the user
 * leaves) and lazily registers the lab's experiment functions, then loads the
 * universal lab shell.
 */
export function labRoute(
  config: LaboratoryConfig,
  experiments: Readonly<Record<string, ExperimentFn>>,
): Route {
  return {
    path: '',
    providers: [
      LabRuntimeService,
      { provide: LAB_CONFIG, useValue: config },
      provideExperiments(experiments),
    ],
    loadComponent: () =>
      import('@features/lab-shell/lab-shell.component').then((m) => m.LabShellComponent),
  };
}
