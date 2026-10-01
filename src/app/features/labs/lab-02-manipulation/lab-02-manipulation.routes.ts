import type { Routes } from '@angular/router';
import { labRoute } from '../lab-route';
import { LAB_02_MANIPULATION_CONFIG } from './lab-02-manipulation.config';
import { LAB_02_EXPERIMENTS } from './lab-02-manipulation.experiments';

/** Route tree for Laboratory 2: Manipulação de Tensores. */
export const LAB_02_MANIPULATION_ROUTES: Routes = [
  labRoute(LAB_02_MANIPULATION_CONFIG, LAB_02_EXPERIMENTS),
];
