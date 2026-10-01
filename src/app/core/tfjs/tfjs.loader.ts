/**
 * Type alias for the TensorFlow.js module. Uses a type-only dynamic import
 * expression so that the (large) TF.js bundle is never pulled into the
 * initial application chunk: it is loaded lazily by `TfjsInitService`.
 */
export type TfjsModule = typeof import('@tensorflow/tfjs');

let tfjs: TfjsModule | null = null;

/** Stores the loaded TensorFlow.js module for later injection. */
export function setTfjs(instance: TfjsModule): void {
  tfjs = instance;
}

/** Returns the loaded TensorFlow.js module or throws when not initialized. */
export function getTfjs(): TfjsModule {
  if (tfjs === null) {
    throw new Error(
      'TensorFlow.js has not been initialized yet. Ensure TfjsInitService runs via provideAppInitializer before TF.js is used.',
    );
  }
  return tfjs;
}

/** Whether TensorFlow.js has finished loading. */
export function isTfjsLoaded(): boolean {
  return tfjs !== null;
}
