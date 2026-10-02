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
    path: '08-fundamentos-de-machine-learning',
    loadChildren: () =>
      import('./lab-08-ml-fundamentals/lab-08-ml-fundamentals.routes').then(
        (m) => m.LAB_08_ML_FUNDAMENTALS_ROUTES,
      ),
  },
  {
    path: '09-regressao-linear',
    loadChildren: () =>
      import('./lab-09-linear-regression/lab-09-linear-regression.routes').then(
        (m) => m.LAB_09_LINEAR_REGRESSION_ROUTES,
      ),
  },
  {
    path: '10-descida-do-gradiente',
    loadChildren: () =>
      import('./lab-10-gradient-descent/lab-10-gradient-descent.routes').then(
        (m) => m.LAB_10_GRADIENT_DESCENT_ROUTES,
      ),
  },
  {
    path: '11-o-neuronio',
    loadChildren: () =>
      import('./lab-11-neuron/lab-11-neuron.routes').then((m) => m.LAB_11_NEURON_ROUTES),
  },
  {
    path: '12-funcoes-de-ativacao',
    loadChildren: () =>
      import('./lab-12-activations/lab-12-activations.routes').then(
        (m) => m.LAB_12_ACTIVATIONS_ROUTES,
      ),
  },
  {
    path: '13-redes-neurais',
    loadChildren: () =>
      import('./lab-13-neural-networks/lab-13-neural-networks.routes').then(
        (m) => m.LAB_13_NEURAL_NETWORKS_ROUTES,
      ),
  },
  {
    path: '14-classificacao-e-fronteiras-de-decisao',
    loadChildren: () =>
      import('./lab-14-classification/lab-14-classification.routes').then(
        (m) => m.LAB_14_CLASSIFICATION_ROUTES,
      ),
  },
  {
    path: '15-imagens-como-tensores',
    loadChildren: () =>
      import('./lab-15-images/lab-15-images.routes').then((m) => m.LAB_15_IMAGES_ROUTES),
  },
  {
    path: '16-gerenciamento-de-memoria',
    loadChildren: () =>
      import('./lab-16-memory/lab-16-memory.routes').then((m) => m.LAB_16_MEMORY_ROUTES),
  },
  {
    path: ':slug',
    providers: [LabRuntimeService],
    loadComponent: () =>
      import('../lab-shell/lab-shell.component').then((m) => m.LabShellComponent),
  },
];
