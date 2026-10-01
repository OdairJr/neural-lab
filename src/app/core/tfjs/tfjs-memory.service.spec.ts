import { TestBed } from '@angular/core/testing';
import * as tf from '@tensorflow/tfjs';
import { TfjsMemoryService } from './tfjs-memory.service';
import { TFJS_TOKEN } from './tfjs.token';

describe('TfjsMemoryService', () => {
  let service: TfjsMemoryService;

  beforeAll(async () => {
    await tf.setBackend('cpu');
    await tf.ready();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: TFJS_TOKEN, useValue: tf }],
    });
    service = TestBed.inject(TfjsMemoryService);
  });

  it('disposes a create/dispose cycle of tracked tensors without leaking', () => {
    const before = tf.memory().numTensors;

    for (let i = 0; i < 50; i++) {
      const tensor = service.track(tf.tensor1d([i, i + 1, i + 2]), `tensor-${i}`);
      expect(tensor.isDisposed).toBe(false);
    }

    expect(service.getTrackedCount()).toBe(50);
    expect(tf.memory().numTensors).toBe(before + 50);

    service.disposeAll();

    expect(service.getTrackedCount()).toBe(0);
    expect(tf.memory().numTensors).toBe(before);
  });

  it('disposes the previously tracked tensor when a label is reused', () => {
    const first = service.track(tf.scalar(1), 'reused');
    const second = service.track(tf.scalar(2), 'reused');

    expect(first.isDisposed).toBe(true);
    expect(second.isDisposed).toBe(false);
    expect(service.getTrackedCount()).toBe(1);

    service.disposeAll();
  });

  it('runs work inside tidy and disposes intermediate tensors', () => {
    const before = tf.memory().numTensors;

    const result = service.tidy(() => {
      const a = tf.tensor1d([1, 2, 3]);
      const b = tf.tensor1d([4, 5, 6]);
      return a.add(b).sum().dataSync()[0];
    }, 'sum-op');

    expect(result).toBe(21);
    expect(tf.memory().numTensors).toBe(before);
  });

  it('reports a memory snapshot including peak usage', () => {
    const snapshot = service.getMemorySnapshot();

    expect(snapshot.numTensors).toBe(tf.memory().numTensors);
    expect(snapshot.usedMemoryMB).toBeGreaterThanOrEqual(0);
    expect(snapshot.peakMemoryMB).toBeGreaterThanOrEqual(snapshot.usedMemoryMB);
    expect(snapshot.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it('watchMemory fires warning and critical once per threshold crossing', () => {
    vi.useFakeTimers();

    try {
      const memory = {
        numTensors: 0,
        numBytes: 0,
        numDataBuffers: 0,
        unreliable: false,
      };
      const fakeTf = { memory: () => memory } as unknown as typeof tf;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: TFJS_TOKEN, useValue: fakeTf }],
      });
      const memoryService = TestBed.inject(TfjsMemoryService);

      const onWarning = vi.fn();
      const onCritical = vi.fn();
      const subscription = memoryService.watchMemory(1, onWarning, onCritical, {
        intervalMs: 10,
      });

      memory.numBytes = 0.85 * 1024 * 1024;
      vi.advanceTimersByTime(10);
      expect(onWarning).toHaveBeenCalledTimes(1);
      expect(onCritical).not.toHaveBeenCalled();

      memory.numBytes = 1.2 * 1024 * 1024;
      vi.advanceTimersByTime(10);
      expect(onCritical).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(50);
      expect(onCritical).toHaveBeenCalledTimes(1);

      subscription.unsubscribe();
      vi.advanceTimersByTime(50);
      expect(onCritical).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
