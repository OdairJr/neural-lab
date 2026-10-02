import { Injectable } from '@angular/core';
import type { ImageParameterValue } from './image-tensor';

/** Built-in deterministic sample images used as the default experiment input. */
export type SampleImageKind = 'gradient' | 'checker' | 'shape';

/**
 * Decodes images into `ImageParameterValue`s for the `image` experiment
 * parameter type, and generates deterministic built-in sample images.
 *
 * `loadFile` only touches the DOM inside the method (never in the
 * constructor), and `sampleImage` is pure — so the service can be injected and
 * the sample generator unit-tested without a canvas.
 */
@Injectable({ providedIn: 'root' })
export class ImageLoaderService {
  /** Decodes a user-selected file into row-major RGBA pixels. */
  async loadFile(file: File): Promise<ImageParameterValue> {
    const { source, release } = await this.decode(file);
    try {
      const width = source.width;
      const height = source.height;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas 2D context unavailable.');
      }
      context.drawImage(source, 0, 0, width, height);
      const { data } = context.getImageData(0, 0, width, height);
      return { name: file.name || 'imagem', width, height, data };
    } finally {
      release();
    }
  }

  /**
   * Produces a deterministic RGBA sample image without any DOM/canvas access so
   * it works under jsdom and always yields the same pixels.
   */
  sampleImage(kind: SampleImageKind = 'gradient', width = 16, height = 16): ImageParameterValue {
    const data = new Uint8ClampedArray(width * height * 4);
    const maxX = Math.max(width - 1, 1);
    const maxY = Math.max(height - 1, 1);
    const cx = (width - 1) / 2;
    const cy = (height - 1) / 2;
    const radius = Math.min(width, height) / 3;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * 4;
        let red: number;
        let green: number;
        let blue: number;

        switch (kind) {
          case 'checker': {
            const value = (x + y) % 2 === 0 ? 255 : 24;
            red = value;
            green = value;
            blue = value;
            break;
          }
          case 'shape': {
            const inside = (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
            red = inside ? 239 : 24;
            green = inside ? 68 : 41;
            blue = inside ? 68 : 59;
            break;
          }
          default: {
            red = Math.round((x / maxX) * 255);
            green = Math.round((y / maxY) * 255);
            blue = 128;
          }
        }

        data[offset] = red;
        data[offset + 1] = green;
        data[offset + 2] = blue;
        data[offset + 3] = 255;
      }
    }

    return { name: `exemplo-${kind}`, width, height, data };
  }

  private async decode(
    file: File,
  ): Promise<{ source: ImageBitmap | HTMLImageElement; release: () => void }> {
    if (typeof createImageBitmap === 'function') {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, release: () => bitmap.close() };
    }

    const url = URL.createObjectURL(file);
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Falha ao carregar a imagem.'));
      image.src = url;
    });
    return {
      source: image,
      release: () => URL.revokeObjectURL(url),
    };
  }
}
