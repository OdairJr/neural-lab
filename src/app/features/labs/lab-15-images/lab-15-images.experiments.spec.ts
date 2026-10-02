import { TestBed } from '@angular/core/testing';
import * as tf from '@tensorflow/tfjs';
import type { VisualizationData } from '@domain/content';
import { ImageLoaderService } from '@core/images';
import { TfjsMemoryService, TensorSerializerService, TFJS_TOKEN } from '@core/tfjs';
import { LabRuntimeService } from '@shared/runtime';
import type { ExperimentResult, SyncExperimentFn } from '@shared/experiments';
import { imagesExperiment } from './lab-15-images.experiments';

type ImageTensorVisualization = Extract<VisualizationData, { type: 'image-tensor' }>;

describe('Lab 15 image experiment', () => {
  let runtime: LabRuntimeService;
  const image = new ImageLoaderService().sampleImage('gradient', 8, 8);

  beforeAll(async () => {
    await tf.setBackend('cpu');
    await tf.ready();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LabRuntimeService, { provide: TFJS_TOKEN, useValue: tf }],
    });
    TestBed.inject(TfjsMemoryService);
    TestBed.inject(TensorSerializerService);
    runtime = TestBed.inject(LabRuntimeService);
  });

  afterEach(() => {
    runtime.dispose();
  });

  function run(params: Record<string, unknown>): ExperimentResult {
    return (imagesExperiment as SyncExperimentFn)({ image, ...params }, runtime);
  }

  function imageData(result: ExperimentResult): ImageTensorVisualization {
    return result.visualizationData as ImageTensorVisualization;
  }

  it('produces an RGB tensor with the source shape and 0–255 values', () => {
    const result = run({ channels: 'rgb', size: 8, normalization: 'none' });
    const data = imageData(result);

    expect(data.type).toBe('image-tensor');
    expect(data.channels).toBe('RGB');
    expect(data.tensor.shape).toEqual([8, 8, 3]);
    expect(data.tensor.stats.min).toBeGreaterThanOrEqual(0);
    expect(data.tensor.stats.max).toBeLessThanOrEqual(255);
    expect(result.tensors).toHaveLength(3);
  });

  it('resizes to the requested square size', () => {
    const data = imageData(run({ channels: 'rgb', size: 16, normalization: 'unit' }));

    expect(data.tensor.shape).toEqual([16, 16, 3]);
    expect(data.tensor.size).toBe(16 * 16 * 3);
  });

  it('produces a single-channel grayscale tensor', () => {
    const data = imageData(run({ channels: 'grayscale', size: 8, normalization: 'none' }));

    expect(data.channels).toBe('grayscale');
    expect(data.tensor.shape).toEqual([8, 8, 1]);
  });

  it('normalizes to [0, 1] and [-1, 1]', () => {
    const unit = imageData(run({ channels: 'rgb', size: 8, normalization: 'unit' }));
    expect(unit.tensor.stats.min).toBeGreaterThanOrEqual(0);
    expect(unit.tensor.stats.max).toBeLessThanOrEqual(1);

    const signed = imageData(run({ channels: 'rgb', size: 8, normalization: 'signed' }));
    expect(signed.tensor.stats.min).toBeGreaterThanOrEqual(-1);
    expect(signed.tensor.stats.max).toBeLessThanOrEqual(1);
    expect(signed.tensor.stats.min).toBeLessThan(0);
  });

  it('releases every tracked tensor when the lab runtime is disposed', () => {
    const baseline = tf.memory().numTensors;

    run({ channels: 'rgb', size: 16, normalization: 'unit' });
    expect(tf.memory().numTensors).toBeGreaterThan(baseline);

    runtime.dispose();
    expect(tf.memory().numTensors).toBe(baseline);
  });

  it('reports the tf.browser.fromPixels path when it actually runs', () => {
    const fake = tf.tensor3d(new Array(8 * 8 * 3).fill(0), [8, 8, 3], 'int32');
    const spy = vi.spyOn(tf.browser, 'fromPixels').mockReturnValue(fake);
    try {
      const result = run({ channels: 'rgb', size: 8, normalization: 'none' });

      expect(runtime.latestComputation()?.code).toBe('tf.browser.fromPixels(image).toFloat()');
      expect(result.codeSnippet).toContain(
        'const pixels = tf.browser.fromPixels(image).toFloat()',
      );
      expect(result.codeSnippet).toContain('tf.image.resizeBilinear');
      expect(result.codeSnippet).toContain('div(255)');
    } finally {
      spy.mockRestore();
      fake.dispose();
    }
  });

  it('reports the tf.tensor3d fallback when the DOM pixel path is unavailable', () => {
    const spy = vi.spyOn(tf.browser, 'fromPixels').mockImplementation(() => {
      throw new Error('ImageData unavailable');
    });
    try {
      const result = run({ channels: 'rgb', size: 8, normalization: 'none' });

      expect(runtime.latestComputation()?.code).toContain('tf.tensor3d(rgbValues(image)');
      expect(result.codeSnippet).toContain('const pixels = tf.tensor3d(rgbValues(image)');
    } finally {
      spy.mockRestore();
    }
  });

  it('falls back gracefully when no image is provided', () => {
    const result = (imagesExperiment as SyncExperimentFn)({}, runtime);

    expect(result.visualizationData).toBeUndefined();
    expect(result.codeSnippet).toContain('Envie uma imagem');
  });
});
