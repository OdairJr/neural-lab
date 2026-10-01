import { Routes } from '@angular/router';
import { CatalogComponent } from '@features/journey/catalog.component';
import { JourneyComponent } from '@features/journey/journey.component';
import { MainLayoutComponent } from '@features/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'jornada' },
      { path: 'jornada', component: JourneyComponent },
      { path: 'laboratorios', component: CatalogComponent },
      {
        path: 'glossario',
        loadComponent: () =>
          import('@features/glossary/glossary.component').then((m) => m.GlossaryComponent),
      },
      {
        path: 'progresso',
        loadComponent: () =>
          import('@features/journey/progress.component').then((m) => m.ProgressComponent),
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('@features/settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'tfjs-status',
        loadComponent: () =>
          import('@features/tfjs-status/tfjs-status.component').then((m) => m.TfjsStatusComponent),
      },
      {
        path: 'lab',
        loadChildren: () => import('@features/labs/labs.routes').then((m) => m.LABS_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
