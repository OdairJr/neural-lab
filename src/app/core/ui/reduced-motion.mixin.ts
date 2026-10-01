import { signal, type Signal, type WritableSignal } from '@angular/core';

export interface ReducedMotionHost {
  readonly prefersReducedMotion: Signal<boolean>;
}

// TypeScript requires mixin base constraints to accept `any[]` rest args.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = object> = new (...args: any[]) => T;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

let sharedSignal: WritableSignal<boolean> | null = null;

function reducedMotionSignal(): Signal<boolean> {
  if (sharedSignal === null) {
    const query =
      typeof window !== 'undefined' ? window.matchMedia?.(REDUCED_MOTION_QUERY) : null;
    sharedSignal = signal(query?.matches ?? false);
    query?.addEventListener('change', (event) => sharedSignal?.set(event.matches));
  }
  return sharedSignal.asReadonly();
}

/**
 * Mixin that exposes a reactive `prefersReducedMotion` signal reflecting the
 * `(prefers-reduced-motion: reduce)` media query. Apply it to animated
 * components so motion can be disabled without duplicating the logic.
 */
export function ReducedMotionMixin<TBase extends Constructor>(Base: TBase) {
  class ReducedMotionMixinClass extends Base implements ReducedMotionHost {
    readonly prefersReducedMotion = reducedMotionSignal();

    // Angular's compiler requires every mixin constructor to declare a single
    // rest parameter typed as `any[]`; the value is forwarded to the base.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }
  }

  return ReducedMotionMixinClass;
}
