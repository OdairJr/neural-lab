import type { Routes } from '@angular/router';
import { labRoute } from '../lab-route';
import { LAB_16_MEMORY_CONFIG } from './lab-16-memory.config';
import { LAB_16_MEMORY, memoryExperiment } from './lab-16-memory.experiments';

/** Route tree for Laboratory 16: Gerenciamento de Memória. */
export const LAB_16_MEMORY_ROUTES: Routes = [
  labRoute(LAB_16_MEMORY_CONFIG, {
    [LAB_16_MEMORY]: memoryExperiment,
  }),
];
