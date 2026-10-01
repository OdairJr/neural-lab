import { Injectable } from '@angular/core';
import { setTfjs, type TfjsModule } from './tfjs.loader';

/** Backend preference order required by the technical architecture spec. */
export const TFJS_BACKEND_PRIORITY = ['webgpu', 'webgl', 'cpu'] as const;

export type TfjsBackend = (typeof TFJS_BACKEND_PRIORITY)[number] | (string & {});

/**
 * Initializes TensorFlow.js at application startup.
 *
 * The module is loaded through a dynamic `import()` so TF.js lives in its own
 * lazy chunk and never inflates the initial bundle. Backend selection follows
 * the `webgpu -> webgl -> cpu` priority and always falls back gracefully so
 * that a missing backend never prevents the application from booting.
 */
@Injectable({ providedIn: 'root' })
export class TfjsInitService {
  private backend: TfjsBackend | null = null;
  private tfjs: TfjsModule | null = null;

  /**
   * Loads TF.js, selects the best available backend and logs the result.
   * Never rejects: on unrecoverable failure it returns `null` and the app
   * continues without TF.js.
   */
  async initialize(): Promise<TfjsBackend | null> {
    try {
      const tfjs = await import('@tensorflow/tfjs');
      setTfjs(tfjs);
      this.tfjs = tfjs;

      const backend = await this.selectBackend(tfjs);
      this.backend = backend;

      const memory = tfjs.memory();
      console.info(
        `[NeuralLab] TensorFlow.js backend: ${backend} (tensors: ${memory.numTensors})`,
      );
      return backend;
    } catch (error) {
      console.error('[NeuralLab] Failed to initialize TensorFlow.js', error);
      return null;
    }
  }

  /** The backend selected during initialization, or `null` if unavailable. */
  getBackend(): TfjsBackend | null {
    return this.backend;
  }

  private async selectBackend(tfjs: TfjsModule): Promise<TfjsBackend> {
    for (const candidate of TFJS_BACKEND_PRIORITY) {
      try {
        const success = await tfjs.setBackend(candidate);
        if (success) {
          await tfjs.ready();
          return candidate;
        }
      } catch (error) {
        console.warn(
          `[NeuralLab] TF.js backend "${candidate}" unavailable, trying next.`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    await tfjs.setBackend('cpu');
    await tfjs.ready();
    return 'cpu';
  }
}
