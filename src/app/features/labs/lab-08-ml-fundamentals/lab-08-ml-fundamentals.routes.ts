import type { Routes } from '@angular/router';
import { labRoute } from '../lab-route';
import { LAB_08_ML_FUNDAMENTALS_CONFIG } from './lab-08-ml-fundamentals.config';
import { LAB_08_EXPERIMENTS } from './lab-08-ml-fundamentals.experiments';

/** Route tree for Laboratory 8: Fundamentos de Machine Learning. */
export const LAB_08_ML_FUNDAMENTALS_ROUTES: Routes = [
  labRoute(LAB_08_ML_FUNDAMENTALS_CONFIG, LAB_08_EXPERIMENTS),
];
