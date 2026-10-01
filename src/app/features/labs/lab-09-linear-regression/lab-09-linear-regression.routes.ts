import type { Routes } from '@angular/router';
import { labRoute } from '../lab-route';
import { LAB_09_LINEAR_REGRESSION_CONFIG } from './lab-09-linear-regression.config';
import { LAB_09_EXPERIMENTS } from './lab-09-linear-regression.experiments';

/** Route tree for Laboratory 9: Regressão Linear. */
export const LAB_09_LINEAR_REGRESSION_ROUTES: Routes = [
  labRoute(LAB_09_LINEAR_REGRESSION_CONFIG, LAB_09_EXPERIMENTS),
];
