import type { Routes } from '@angular/router';
import { LabRuntimeService } from '@shared/runtime';

/**
 * Lab feature routes.
 *
 * Each implemented laboratory is a lazy-loaded feature that provides its own
 * `LAB_CONFIG`, `LabRuntimeService` and experiment functions (see
 * `labRoute`). Laboratories that have not been converted to a feature yet fall
 * through to the generic `:slug` route, where `LabShellComponent` resolves the
 * config from the slug or shows the not-found state for unknown slugs.
 */
export const LABS_ROUTES: Routes = [
  {
    path: '01-fundamentos-de-tensores',
    loadChildren: () =>
      import('./lab-01-tensors/lab-01-tensors.routes').then((m) => m.LAB_01_TENSORS_ROUTES),
  },
  {
    path: '02-manipulacao-de-tensores',
    loadChildren: () =>
      import('./lab-02-manipulation/lab-02-manipulation.routes').then(
        (m) => m.LAB_02_MANIPULATION_ROUTES,
      ),
  },
  {
    path: '03-operacoes-elemento-a-elemento',
    loadChildren: () =>
      import('./lab-03-elementwise/lab-03-elementwise.routes').then(
        (m) => m.LAB_03_ELEMENTWISE_ROUTES,
      ),
  },
  {
    path: '04-operacoes-de-reducao',
    loadChildren: () =>
      import('./lab-04-reductions/lab-04-reductions.routes').then(
        (m) => m.LAB_04_REDUCTIONS_ROUTES,
      ),
  },
  {
    path: '05-operacoes-matriciais',
    loadChildren: () =>
      import('./lab-05-matrix/lab-05-matrix.routes').then((m) => m.LAB_05_MATRIX_ROUTES),
  },
  {
    path: '06-broadcasting',
    loadChildren: () =>
      import('./lab-06-broadcasting/lab-06-broadcasting.routes').then(
        (m) => m.LAB_06_BROADCASTING_ROUTES,
      ),
  },
  {
    path: '07-algebra-linear-aplicada',
    loadChildren: () =>
      import('./lab-07-linear-algebra/lab-07-linear-algebra.routes').then(
        (m) => m.LAB_07_LINEAR_ALGEBRA_ROUTES,
      ),
  },
  {
    path: ':slug',
    providers: [LabRuntimeService],
    loadComponent: () =>
      import('../lab-shell/lab-shell.component').then((m) => m.LabShellComponent),
  },
];
