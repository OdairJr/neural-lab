import { TestBed } from '@angular/core/testing';
import * as tf from '@tensorflow/tfjs';
import { TensorSerializerService } from './tensor-serializer.service';
import { TFJS_TOKEN } from './tfjs.token';

describe('TensorSerializerService', () => {
  let service: TensorSerializerService;

  beforeAll(async () => {
    await tf.setBackend('cpu');
    await tf.ready();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: TFJS_TOKEN, useValue: tf }],
    });
    service = TestBed.inject(TensorSerializerService);
  });

  it('serializes a rank-1 tensor with values, shape, dtype and stats', () => {
    const tensor = tf.tensor1d([1, 2, 3]);

    try {
      const snapshot = service.serialize(tensor);

      expect(snapshot.shape).toEqual([3]);
      expect(snapshot.dtype).toBe('float32');
      expect(snapshot.values).toEqual([1, 2, 3]);
      expect(snapshot.size).toBe(3);
      expect(snapshot.truncated).toBe(false);
      expect(snapshot.stats.min).toBe(1);
      expect(snapshot.stats.max).toBe(3);
      expect(snapshot.stats.mean).toBe(2);
      expect(snapshot.stats.std).toBeCloseTo(Math.sqrt(2 / 3), 6);
    } finally {
      tensor.dispose();
    }
  });

  it('serializes a rank-2 tensor preserving row-major order', () => {
    const tensor = tf.tensor2d([
      [1, 2],
      [3, 4],
    ]);

    try {
      const snapshot = service.serialize(tensor);

      expect(snapshot.shape).toEqual([2, 2]);
      expect(snapshot.values).toEqual([1, 2, 3, 4]);
      expect(snapshot.stats.min).toBe(1);
      expect(snapshot.stats.max).toBe(4);
      expect(snapshot.stats.mean).toBe(2.5);
      expect(snapshot.stats.std).toBeCloseTo(Math.sqrt(1.25), 6);
    } finally {
      tensor.dispose();
    }
  });

  it('serializes a rank-3 tensor with the correct shape', () => {
    const tensor = tf.tensor3d([
      [[1], [2]],
      [[3], [4]],
    ]);

    try {
      const snapshot = service.serialize(tensor);

      expect(snapshot.shape).toEqual([2, 2, 1]);
      expect(snapshot.values).toEqual([1, 2, 3, 4]);
      expect(snapshot.dtype).toBe('float32');
    } finally {
      tensor.dispose();
    }
  });

  it('truncates displayed values but keeps the full size and stats', () => {
    const tensor = tf.tensor1d([1, 2, 3, 4, 5]);

    try {
      const snapshot = service.serialize(tensor, 2);

      expect(snapshot.values).toEqual([1, 2]);
      expect(snapshot.size).toBe(5);
      expect(snapshot.truncated).toBe(true);
      expect(snapshot.stats.mean).toBe(3);
    } finally {
      tensor.dispose();
    }
  });

  it('does not leak tensors while serializing', () => {
    const before = tf.memory().numTensors;
    const tensor = tf.tensor1d([1, 2, 3]);

    service.serialize(tensor);

    expect(tf.memory().numTensors).toBe(before + 1);
    tensor.dispose();
    expect(tf.memory().numTensors).toBe(before);
  });

  it('serializes a layers model into a layer/parameter summary', () => {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 2, inputShape: [3] }));

    const snapshot = service.serializeModel(model);

    expect(snapshot.name).toBe(model.name);
    expect(snapshot.layers).toHaveLength(1);
    expect(snapshot.layers[0].className).toBe('Dense');
    expect(snapshot.layers[0].outputShape).toEqual([null, 2]);
    expect(snapshot.layers[0].params).toBe(8);
    expect(snapshot.totalParams).toBe(8);
    expect(snapshot.trainableParams).toBe(8);
  });
});
