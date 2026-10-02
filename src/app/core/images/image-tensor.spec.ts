import * as tf from '@tensorflow/tfjs';
import { ImageLoaderService } from './image-loader.service';
import {
  FROM_PIXELS_CODE,
  GRAYSCALE_WEIGHTS,
  TENSOR3D_CODE,
  buildImageTensor,
  grayscalePixels,
  imageToRgbTensor,
  normalizeImage,
  resizeImage,
  rgbValues,
  toGrayscale,
  toImageData,
  type ImageParameterValue,
} from './image-tensor';

/**
 * A 2×2 image with the four extreme colours:
 *
 *   (0,0) red     (1,0) green
 *   (0,1) blue    (1,1) white
 */
const TINY: ImageParameterValue = {
  name: 'tiny',
  width: 2,
  height: 2,
  data: Uint8ClampedArray.from([
    255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255,
  ]),
};

describe('image tensor helpers', () => {
  beforeAll(async () => {
    await tf.setBackend('cpu');
    await tf.ready();
  });

  it('keeps the luminance weights normalized', () => {
    expect(GRAYSCALE_WEIGHTS.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 6);
  });

  it('flattens RGBA pixels into interleaved RGB values', () => {
    expect(rgbValues(TINY)).toEqual([
      255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255,
    ]);
  });

  it('builds a [h, w, 3] RGB tensor with exact values', () => {
    const tensor = imageToRgbTensor(TINY, tf);

    expect(tensor.shape).toEqual([2, 2, 3]);
    expect(Array.from(tensor.dataSync())).toEqual([
      255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255,
    ]);

    tensor.dispose();
  });

  it('builds through tf.browser.fromPixels and reports that code when available', () => {
    const pixels = tf.tensor3d([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [2, 2, 3], 'int32');
    const spy = vi.spyOn(tf.browser, 'fromPixels').mockReturnValue(pixels);
    try {
      const build = buildImageTensor(TINY, tf);

      expect(spy).toHaveBeenCalledWith(expect.anything(), 3);
      expect(build.code).toBe(FROM_PIXELS_CODE);
      expect(build.tensor.dtype).toBe('float32');
      expect(build.tensor.shape).toEqual([2, 2, 3]);
      expect(Array.from(build.tensor.dataSync())).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      ]);

      build.tensor.dispose();
    } finally {
      spy.mockRestore();
      pixels.dispose();
    }
  });

  it('falls back to tf.tensor3d and reports that code when fromPixels fails', () => {
    const spy = vi.spyOn(tf.browser, 'fromPixels').mockImplementation(() => {
      throw new Error('ImageData unavailable');
    });
    try {
      const build = buildImageTensor(TINY, tf);

      expect(build.code).toBe(TENSOR3D_CODE);
      expect(build.tensor.shape).toEqual([2, 2, 3]);
      expect(Array.from(build.tensor.dataSync())).toEqual([
        255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255,
      ]);

      build.tensor.dispose();
    } finally {
      spy.mockRestore();
    }
  });

  it('converts to grayscale via luminance in [h, w, 1]', () => {
    const rgb = imageToRgbTensor(TINY, tf);
    const gray = toGrayscale(rgb, tf);

    expect(gray.shape).toEqual([2, 2, 1]);
    const values = Array.from(gray.dataSync());
    expect(values[0]).toBeCloseTo(0.299 * 255, 4);
    expect(values[1]).toBeCloseTo(0.587 * 255, 4);
    expect(values[2]).toBeCloseTo(0.114 * 255, 4);
    expect(values[3]).toBeCloseTo(255, 4);

    rgb.dispose();
    gray.dispose();
  });

  it('resizes with resizeBilinear to a square [size, size, 3]', () => {
    const rgb = imageToRgbTensor(TINY, tf);
    const resized = resizeImage(rgb, 4, tf);

    expect(resized.shape).toEqual([4, 4, 3]);

    rgb.dispose();
    resized.dispose();
  });

  it('normalizes pixels into the unit and signed ranges', () => {
    const rgb = imageToRgbTensor(TINY, tf);

    const unit = normalizeImage(rgb, 'unit', tf);
    const unitValues = Array.from(unit.dataSync());
    expect(Math.min(...unitValues)).toBeCloseTo(0, 6);
    expect(Math.max(...unitValues)).toBeCloseTo(1, 6);
    expect(unitValues[0]).toBeCloseTo(1, 6);

    const signed = normalizeImage(rgb, 'signed', tf);
    const signedValues = Array.from(signed.dataSync());
    expect(Math.min(...signedValues)).toBeCloseTo(-1, 6);
    expect(Math.max(...signedValues)).toBeCloseTo(1, 6);
    expect(signedValues[0]).toBeCloseTo(1, 6); // red
    expect(signedValues[1]).toBeCloseTo(-1, 6); // no green

    const none = normalizeImage(rgb, 'none', tf);
    expect(none).toBe(rgb);

    unit.dispose();
    signed.dispose();
    rgb.dispose();
  });

  it('derives grayscale RGBA pixels without mutating the input', () => {
    const before = Array.from(TINY.data);
    const gray = grayscalePixels(TINY);

    expect(Array.from(TINY.data)).toEqual(before);
    expect(gray.length).toBe(16);
    expect(gray[0]).toBe(Math.round(0.299 * 255));
    expect(gray[3]).toBe(255); // alpha preserved
  });

  it('returns an ImageData-compatible value without a DOM constructor', () => {
    const image = toImageData(TINY);

    expect(image.width).toBe(2);
    expect(image.height).toBe(2);
    expect(Array.from(image.data)).toEqual(Array.from(TINY.data));
  });
});

describe('ImageLoaderService.sampleImage', () => {
  it('is deterministic, canvas-free and fully opaque', () => {
    const loader = new ImageLoaderService();
    const first = loader.sampleImage('gradient', 4, 4);
    const second = loader.sampleImage('gradient', 4, 4);

    expect(first).toEqual(second);
    expect(first.width).toBe(4);
    expect(first.height).toBe(4);
    expect(first.data.length).toBe(4 * 4 * 4);
    expect(first.data[0]).toBe(0);
    expect(first.data[3]).toBe(255);
    expect(first.data[first.data.length - 1]).toBe(255);
  });

  it('generates distinct pixels for checker and shape kinds', () => {
    const loader = new ImageLoaderService();

    const checker = loader.sampleImage('checker', 4, 4);
    const shape = loader.sampleImage('shape', 4, 4);

    expect(Array.from(checker.data)).not.toEqual(Array.from(shape.data));
  });
});
