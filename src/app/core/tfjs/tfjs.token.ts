import { InjectionToken } from '@angular/core';
import type { TfjsModule } from './tfjs.loader';

/**
 * Injection token for the TensorFlow.js module instance.
 *
 * Providing TF.js through a token keeps consumers testable and mockable
 * (tests can provide a fake `tf` without booting the real backend).
 */
export const TFJS_TOKEN = new InjectionToken<TfjsModule>('TFJS_TOKEN');
