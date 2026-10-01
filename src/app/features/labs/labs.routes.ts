import type { Routes } from '@angular/router';
import { LabRuntimeService } from '@shared/runtime';

/**
 * Lab feature routes.
 *
 * Until the per-lab features land, `/lab/:slug` lazily loads the universal
 * `LabShellComponent`, which resolves the matching `LaboratoryConfig` from the
 * content stubs. `LabRuntimeService` is provided here so it is destroyed (and
 * tensors disposed) when the user navigates to another lab.
 *
 * Per-lab features will additionally provide `LAB_CONFIG` from `lab-shell`.
 */
export const LABS_ROUTES: Routes = [
  {
    path: ':slug',
    providers: [LabRuntimeService],
    loadComponent: () =>
      import('../lab-shell/lab-shell.component').then((m) => m.LabShellComponent),
  },
];
