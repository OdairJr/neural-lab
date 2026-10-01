import { inject } from '@angular/core';
import type { Routes } from '@angular/router';
import { TrainingWorkerService } from '@core/training';
import { labRoute } from '../lab-route';
import { LAB_14_CLASSIFICATION_CONFIG } from './lab-14-classification.config';
import {
  LAB_14_CLASSIFICATION,
  createLab14ClassificationExperiment,
} from './lab-14-classification.experiments';

/** Route tree for Laboratory 14: Classificação e Fronteiras de Decisão. */
export const LAB_14_CLASSIFICATION_ROUTES: Routes = [
  labRoute(LAB_14_CLASSIFICATION_CONFIG, () => ({
    [LAB_14_CLASSIFICATION]: createLab14ClassificationExperiment(inject(TrainingWorkerService)),
  })),
];
