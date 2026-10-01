import { computed, inject, type Signal } from '@angular/core';
import { MotionPreferenceService, prefersReducedMotionSignal } from '@core/ui';

/**
 * Combined reduced-motion signal honouring both the OS media query and the
 * in-app preference. Must be called from an injection context (component
 * field initializer is fine).
 */
export function useReducedMotion(): Signal<boolean> {
  const prefers = prefersReducedMotionSignal();
  const motion = inject(MotionPreferenceService);
  return computed(() => prefers() || motion.reducedMotion());
}
