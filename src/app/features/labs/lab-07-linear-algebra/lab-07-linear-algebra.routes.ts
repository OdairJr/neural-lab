import type { Routes } from '@angular/router';
import { labRoute } from '../lab-route';
import { LAB_07_LINEAR_ALGEBRA_CONFIG } from './lab-07-linear-algebra.config';
import { LAB_07_EXPERIMENTS } from './lab-07-linear-algebra.experiments';

/** Route tree for Laboratory 7: Álgebra Linear Aplicada. */
export const LAB_07_LINEAR_ALGEBRA_ROUTES: Routes = [
  labRoute(LAB_07_LINEAR_ALGEBRA_CONFIG, LAB_07_EXPERIMENTS),
];
