import type { Routes } from '@angular/router';
import { labRoute } from '../lab-route';
import { LAB_03_ELEMENTWISE_CONFIG } from './lab-03-elementwise.config';
import { LAB_03_EXPERIMENTS } from './lab-03-elementwise.experiments';

/** Route tree for Laboratory 3: Operações Elemento a Elemento. */
export const LAB_03_ELEMENTWISE_ROUTES: Routes = [
  labRoute(LAB_03_ELEMENTWISE_CONFIG, LAB_03_EXPERIMENTS),
];
