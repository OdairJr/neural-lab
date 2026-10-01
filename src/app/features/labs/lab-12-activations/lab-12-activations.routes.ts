import type { Routes } from '@angular/router';
import { labRoute } from '../lab-route';
import { LAB_12_ACTIVATIONS_CONFIG } from './lab-12-activations.config';
import { LAB_12_EXPERIMENTS } from './lab-12-activations.experiments';

/** Route tree for Laboratory 12: Funções de Ativação. */
export const LAB_12_ACTIVATIONS_ROUTES: Routes = [
  labRoute(LAB_12_ACTIVATIONS_CONFIG, LAB_12_EXPERIMENTS),
];
