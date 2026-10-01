import type { Routes } from '@angular/router';
import { labRoute } from '../lab-route';
import { LAB_01_TENSORS_CONFIG } from './lab-01-tensors.config';
import { LAB_01_EXPERIMENTS } from './lab-01-tensors.experiments';

/** Route tree for Laboratory 1: Fundamentos de Tensores. */
export const LAB_01_TENSORS_ROUTES: Routes = [
  labRoute(LAB_01_TENSORS_CONFIG, LAB_01_EXPERIMENTS),
];
