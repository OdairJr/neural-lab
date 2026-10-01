import { InjectionToken } from '@angular/core';
import type { LaboratoryConfig } from '@domain/content';

/**
 * The `LaboratoryConfig` for the currently active lab, provided in the lab's
 * route providers. `null` when the requested slug does not match a lab.
 */
export const LAB_CONFIG = new InjectionToken<LaboratoryConfig | null>('LAB_CONFIG');
