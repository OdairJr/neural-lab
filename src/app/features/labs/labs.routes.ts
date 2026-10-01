import type { Routes } from '@angular/router';

/**
 * Lab feature routes. Individual labs become lazy children here in Phase 1+;
 * a single placeholder currently keeps `/lab/:slug` deep links working.
 */
export const LABS_ROUTES: Routes = [
  {
    path: ':slug',
    loadComponent: () =>
      import('./lab-placeholder.component').then((m) => m.LabPlaceholderComponent),
  },
];
