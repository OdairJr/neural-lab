import type { Routes } from '@angular/router';
import { labRoute } from '../lab-route';
import { LAB_05_MATRIX_CONFIG } from './lab-05-matrix.config';
import { LAB_05_EXPERIMENTS } from './lab-05-matrix.experiments';

/** Route tree for Laboratory 5: Operações Matriciais. */
export const LAB_05_MATRIX_ROUTES: Routes = [
  labRoute(LAB_05_MATRIX_CONFIG, LAB_05_EXPERIMENTS),
];
