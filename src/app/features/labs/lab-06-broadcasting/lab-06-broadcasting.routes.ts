import type { Routes } from '@angular/router';
import { labRoute } from '../lab-route';
import { LAB_06_BROADCASTING_CONFIG } from './lab-06-broadcasting.config';
import { LAB_06_EXPERIMENTS } from './lab-06-broadcasting.experiments';

/** Route tree for Laboratory 6: Broadcasting. */
export const LAB_06_BROADCASTING_ROUTES: Routes = [
  labRoute(LAB_06_BROADCASTING_CONFIG, LAB_06_EXPERIMENTS),
];
