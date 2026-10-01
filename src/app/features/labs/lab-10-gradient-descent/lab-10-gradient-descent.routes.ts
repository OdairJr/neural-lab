import { inject } from '@angular/core';
import type { Routes } from '@angular/router';
import { TrainingWorkerService } from '@core/training';
import { labRoute } from '../lab-route';
import { LAB_10_GRADIENT_DESCENT_CONFIG } from './lab-10-gradient-descent.config';
import {
  LAB_10_GRADIENT_DESCENT,
  createGradientDescentExperiment,
} from './lab-10-gradient-descent.experiments';

/** Route tree for Laboratory 10: Descida do Gradiente. */
export const LAB_10_GRADIENT_DESCENT_ROUTES: Routes = [
  labRoute(LAB_10_GRADIENT_DESCENT_CONFIG, () => ({
    [LAB_10_GRADIENT_DESCENT]: createGradientDescentExperiment(inject(TrainingWorkerService)),
  })),
];
