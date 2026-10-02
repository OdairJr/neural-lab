import type { Tensor, Tensor3D } from '@tensorflow/tfjs';
import type { TfjsModule } from '@core/tfjs';

/**
 * Decoded image parameter value passed from the experiment stage to the lab
 * experiment. Pixels are stored row-major as RGBA bytes (4 bytes per pixel),
 * matching the layout of the DOM `ImageData.data` buffer.
 *
 * It lives in the core layer (a leaf) so both `core` and `shared` code can use
 * it; `@domain/content` re-exports it as a type-only import for content
 * authors.
 */
export interface ImageParameterValue {
  /** Original file name (or a label for a built-in sample image). */
  name: string;
  width: number;
  height: number;
  /** Row-major RGBA pixels, 4 bytes per pixel. */
  data: Uint8ClampedArray;
}

/** Structural image shape accepted by the pure helpers and the visualization. */
export interface ImageLike {
  width: number;
  height: number;
  data: Uint8ClampedArray | readonly number[];
}

/** Supported channel layouts for an image tensor. */
export type ImageChannels = 'RGB' | 'grayscale';

/** Supported normalization modes for image pixels. */
export type ImageNormalization = 'none' | 'unit' | 'signed';

/** Luminance coefficients (ITU-R BT.601) used by the grayscale conversion. */
export const GRAYSCALE_WEIGHTS = [0.299, 0.587, 0.114] as const;

function channel(data: ImageLike['data'], index: number): number {
  return data[index] ?? 0;
}

/** Flattens an RGBA image into interleaved RGB values (alpha dropped). */
export function rgbValues(image: ImageLike): number[] {
  const values: number[] = [];
  const pixels = image.width * image.height;
  for (let index = 0; index < pixels; index++) {
    const offset = index * 4;
    values.push(
      channel(image.data, offset),
      channel(image.data, offset + 1),
      channel(image.data, offset + 2),
    );
  }
  return values;
}

/** TF.js expression for the browser path that actually builds the tensor. */
export const FROM_PIXELS_CODE = 'tf.browser.fromPixels(image).toFloat()';

/** TF.js expression for the DOM-free fallback path. */
export const TENSOR3D_CODE =
  'tf.tensor3d(rgbValues(image), [image.height, image.width, 3], "float32")';

/** Result of building an RGB tensor, including the expression that ran. */
export interface ImageTensorBuild {
  tensor: Tensor3D;
  /** The TF.js expression that produced `tensor` (browser path or fallback). */
  code: string;
}

/**
 * Builds a rank-3 `[height, width, 3]` float32 tensor from a decoded image.
 *
 * The browser path converts a real DOM `ImageData` with
 * `tf.browser.fromPixels(...)` — the API the lab teaches — and casts the
 * resulting int32 pixels to float32. When the DOM `ImageData` constructor or
 * `fromPixels` itself is unavailable (e.g. jsdom), it falls back to
 * `tf.tensor3d(...)` built from the decoded pixels. The returned `code` states
 * which path ran. The alpha channel is discarded; values stay in `[0, 255]`.
 */
export function buildImageTensor(image: ImageLike, tf: TfjsModule): ImageTensorBuild {
  try {
    const imageData = toImageData(image);
    const tensor = tf.tidy(() => tf.browser.fromPixels(imageData, 3).toFloat() as Tensor3D);
    return { tensor, code: FROM_PIXELS_CODE };
  } catch (error) {
    // A missing `ImageData`/`fromPixels` (jsdom, SSR) is an expected fallback;
    // a real browser failing here is not, so surface it for diagnosis.
    if (typeof ImageData === 'function') {
      console.warn(
        '[NeuralLab] tf.browser.fromPixels failed; falling back to tf.tensor3d.',
        error,
      );
    }
    return {
      tensor: tf.tensor3d(rgbValues(image), [image.height, image.width, 3], 'float32'),
      code: TENSOR3D_CODE,
    };
  }
}

/**
 * Builds a rank-3 `[height, width, 3]` float32 tensor from a decoded image.
 * Thin wrapper over {@link buildImageTensor} for callers that only need the
 * tensor (the experiment uses the `code` to report what actually ran).
 */
export function imageToRgbTensor(image: ImageLike, tf: TfjsModule): Tensor3D {
  return buildImageTensor(image, tf).tensor;
}

/**
 * Converts an RGB tensor to grayscale using luminance
 * `0.299·R + 0.587·G + 0.114·B`. The result keeps rank 3 with a single
 * channel (`[height, width, 1]`) so it stays compatible with the rest of the
 * image pipeline and `resizeBilinear`.
 */
export function toGrayscale(tensor: Tensor3D, tf: TfjsModule): Tensor3D {
  return tf.tidy(() => {
    const weights = tf.tensor1d([...GRAYSCALE_WEIGHTS], 'float32');
    return tf.sum(tf.mul(tensor, weights), 2, true) as Tensor3D;
  });
}

/**
 * Bilinearly resizes an image tensor to `size × size`. TensorFlow.js expects
 * `resizeBilinear(images, [newHeight, newWidth])`; the target is square here.
 */
export function resizeImage(tensor: Tensor3D, size: number, tf: TfjsModule): Tensor3D {
  return tf.tidy(() => tf.image.resizeBilinear(tensor, [size, size])) as Tensor3D;
}

/**
 * Normalizes pixel values:
 * - `none`: keep `[0, 255]`;
 * - `unit`: divide by 255 → `[0, 1]`;
 * - `signed`: `(x / 255 - 0.5) · 2` → `[-1, 1]` (MobileNet-style).
 */
export function normalizeImage(
  tensor: Tensor,
  mode: ImageNormalization,
  tf: TfjsModule,
): Tensor {
  switch (mode) {
    case 'unit':
      return tf.tidy(() => tf.div(tensor, 255));
    case 'signed':
      return tf.tidy(() => tf.mul(tf.sub(tf.div(tensor, 255), 0.5), 2));
    default:
      return tensor;
  }
}

/**
 * Returns a real DOM `ImageData` when the environment provides one, otherwise a
 * structurally-compatible object. jsdom (unit tests) has no `ImageData`
 * constructor, while every browser the app targets does.
 */
export function toImageData(image: ImageLike): ImageData {
  // Copy into a fresh `Uint8ClampedArray<ArrayBuffer>` so the value is accepted
  // by the `ImageData` constructor and never aliases the caller's buffer.
  const data = Uint8ClampedArray.from(image.data);

  if (typeof ImageData === 'function') {
    try {
      return new ImageData(data, image.width, image.height);
    } catch {
      // Fall through to the structural fallback (e.g. detached buffers).
    }
  }

  return { width: image.width, height: image.height, data } as unknown as ImageData;
}

/** Derives the grayscale (luminance) RGBA pixels without mutating the input. */
export function grayscalePixels(image: ImageLike): Uint8ClampedArray {
  const output = new Uint8ClampedArray(image.width * image.height * 4);
  const pixels = image.width * image.height;
  for (let index = 0; index < pixels; index++) {
    const offset = index * 4;
    const luminance = Math.round(
      GRAYSCALE_WEIGHTS[0] * channel(image.data, offset) +
        GRAYSCALE_WEIGHTS[1] * channel(image.data, offset + 1) +
        GRAYSCALE_WEIGHTS[2] * channel(image.data, offset + 2),
    );
    output[offset] = luminance;
    output[offset + 1] = luminance;
    output[offset + 2] = luminance;
    output[offset + 3] = channel(image.data, offset + 3) || 255;
  }
  return output;
}
