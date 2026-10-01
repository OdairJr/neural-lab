import { inject } from '@angular/core';
import type { Routes } from '@angular/router';
import { TrainingWorkerService } from '@core/training';
import { labRoute } from '../lab-route';
import { LAB_13_NEURAL_NETWORKS_CONFIG } from './lab-13-neural-networks.config';
import {
  LAB_13_NETWORK,
  createLab13NetworkExperiment,
} from './lab-13-neural-networks.experiments';

/** Route tree for Laboratory 13: Redes Neurais. */
export const LAB_13_NEURAL_NETWORKS_ROUTES: Routes = [
  labRoute(LAB_13_NEURAL_NETWORKS_CONFIG, () => ({
    [LAB_13_NETWORK]: createLab13NetworkExperiment(inject(TrainingWorkerService)),
  })),
];
