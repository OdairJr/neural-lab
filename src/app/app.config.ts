import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { getTfjs, TFJS_TOKEN, TfjsInitService } from '@core/tfjs';
import { MotionPreferenceService } from '@core/ui';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    { provide: TFJS_TOKEN, useFactory: getTfjs },
    provideAppInitializer(() => inject(TfjsInitService).initialize()),
    // Instantiate the motion preference service so the persisted
    // reduced-motion setting is applied on startup, before the first paint.
    provideAppInitializer(() => {
      inject(MotionPreferenceService);
    }),
  ],
};
