import type { ImageParameterValue, ImageTensorData, VisualizationData } from '@domain/content';
import {
  TENSOR3D_CODE,
  buildImageTensor,
  normalizeImage,
  resizeImage,
  toGrayscale,
  toImageData,
  type ImageNormalization,
} from '@core/images';
import { clamp } from '@core/utils';
import type { SyncExperimentFn } from '@shared/experiments';

export const LAB_15_IMAGES = 'lab-15-images';

/**
 * Builds the panel/code snippet around the expression that actually produced
 * the RGB tensor, so the shown code matches what ran (browser `fromPixels` or
 * the `tf.tensor3d` fallback when no DOM is available).
 */
function codeSnippet(sourceCode: string): string {
  return [
    "import * as tf from '@tensorflow/tfjs';",
    `const pixels = ${sourceCode}; // [altura, largura, 3]`,
    'const resized = tf.image.resizeBilinear(pixels, [224, 224]); // entrada da rede',
    'const unit = resized.div(255);              // [0, 1]',
    'const signed = unit.sub(0.5).mul(2);        // [-1, 1]',
  ].join('\n');
}

function asNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asNormalization(value: unknown): ImageNormalization {
  return value === 'unit' || value === 'signed' ? value : 'none';
}

/**
 * Lab 15 experiment: image → RGB tensor → resize → (optional) grayscale →
 * normalization. Publishes the intermediate RGB/grayscale tensors and the
 * processed tensor to the "Under the Hood" panel and returns the `image-tensor`
 * visualization data.
 *
 * Every tensor is created inside `runtime.tidy` and tracked with a stable label
 * so re-running the experiment disposes the previous generation.
 */
export const imagesExperiment: SyncExperimentFn = (params, runtime) => {
  const tf = runtime.tf;
  const image = params['image'] as ImageParameterValue | undefined;
  if (!image) {
    return { codeSnippet: '// Envie uma imagem para inspecionar o tensor.' };
  }

  const grayscale = params['channels'] === 'grayscale';
  const size = clamp(Math.round(asNumber(params['size'], image.height)), 1, 512);
  const normalization = asNormalization(params['normalization']);

  let sourceCode = TENSOR3D_CODE;
  const pipeline = runtime.tidy(() => {
    const build = buildImageTensor(image, tf);
    sourceCode = build.code;
    const rgb = build.tensor;
    const resized =
      size === image.height && size === image.width ? rgb : resizeImage(rgb, size, tf);
    const grayscaleTensor = toGrayscale(resized, tf);
    const normalized = normalizeImage(grayscale ? grayscaleTensor : resized, normalization, tf);
    return { rgb, grayscale: grayscaleTensor, normalized };
  }, 'lab-15-images');

  const rgbTensor = runtime.track(pipeline.rgb, 'lab-15-rgb');
  const grayscaleTensor = runtime.track(pipeline.grayscale, 'lab-15-grayscale');
  const normalizedTensor = runtime.track(pipeline.normalized, 'lab-15-normalized');

  const snapshot = runtime.getSnapshot('lab-15-normalized');

  runtime.publishComputation('lab-15-images', {
    inputs: [rgbTensor, grayscaleTensor],
    output: normalizedTensor,
    code: sourceCode,
  });

  const visualizationData: ImageTensorData | undefined = snapshot
    ? {
        type: 'image-tensor',
        original: toImageData(image),
        tensor: snapshot,
        channels: grayscale ? 'grayscale' : 'RGB',
      }
    : undefined;

  return {
    tensors: [rgbTensor, grayscaleTensor, normalizedTensor],
    visualizationData: visualizationData as VisualizationData | undefined,
    codeSnippet: codeSnippet(sourceCode),
  };
};
