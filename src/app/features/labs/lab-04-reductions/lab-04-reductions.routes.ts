import type { Routes } from '@angular/router';
import { labRoute } from '../lab-route';
import { LAB_04_REDUCTIONS_CONFIG } from './lab-04-reductions.config';
import { LAB_04_EXPERIMENTS } from './lab-04-reductions.experiments';

/** Route tree for Laboratory 4: Operações de Redução. */
export const LAB_04_REDUCTIONS_ROUTES: Routes = [
  labRoute(LAB_04_REDUCTIONS_CONFIG, LAB_04_EXPERIMENTS),
];
