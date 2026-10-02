import type { Routes } from '@angular/router';
import { labRoute } from '../lab-route';
import { LAB_15_IMAGES_CONFIG } from './lab-15-images.config';
import { LAB_15_IMAGES, imagesExperiment } from './lab-15-images.experiments';

/** Route tree for Laboratory 15: Imagens como Tensores. */
export const LAB_15_IMAGES_ROUTES: Routes = [
  labRoute(LAB_15_IMAGES_CONFIG, {
    [LAB_15_IMAGES]: imagesExperiment,
  }),
];
