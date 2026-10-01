import type { Routes } from '@angular/router';
import { labRoute } from '../lab-route';
import { LAB_11_NEURON_CONFIG } from './lab-11-neuron.config';
import { LAB_11_EXPERIMENTS } from './lab-11-neuron.experiments';

/** Route tree for Laboratory 11: O Neurônio. */
export const LAB_11_NEURON_ROUTES: Routes = [
  labRoute(LAB_11_NEURON_CONFIG, LAB_11_EXPERIMENTS),
];
