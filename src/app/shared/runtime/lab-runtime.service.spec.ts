import { TestBed } from '@angular/core/testing';
import * as tf from '@tensorflow/tfjs';
import { TfjsMemoryService, TensorSerializerService, TFJS_TOKEN } from '@core/tfjs';
import { LabRuntimeService, type ComputationEvent } from './lab-runtime.service';

describe('LabRuntimeService', () => {
  let service: LabRuntimeService;

  beforeAll(async () => {
    await tf.setBackend('cpu');
    await tf.ready();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LabRuntimeService,
        { provide: TFJS_TOKEN, useValue: tf },
      ],
    });
    // Touch the root services so they are created with the mocked token.
    TestBed.inject(TfjsMemoryService);
    TestBed.inject(TensorSerializerService);
    service = TestBed.inject(LabRuntimeService);
  });

  it('creates, tracks and serializes a tensor', () => {
    const tensor = service.createTensor([1, 2, 3], [3], 'float32', 'A');

    const snapshot = service.getSnapshot('A');
    expect(snapshot?.shape).toEqual([3]);
    expect(snapshot?.values).toEqual([1, 2, 3]);
    expect(tensor.isDisposed).toBe(false);
  });

  it('dispose() releases every tracked tensor', () => {
    const before = tf.memory().numTensors;

    service.createTensor([1, 2], [2], 'float32', 'A');
    service.createTensor([3, 4], [2], 'float32', 'B');
    expect(tf.memory().numTensors).toBe(before + 2);

    service.dispose();

    expect(tf.memory().numTensors).toBe(before);
    expect(service.getSnapshot('A')).toBeUndefined();
  });

  it('stores and retrieves per-stage experiment state', () => {
    service.setExperimentState('experimentacao', { w: 2 });
    expect(service.getExperimentState('experimentacao')).toEqual({ w: 2 });

    service.dispose();
    expect(service.getExperimentState('experimentacao')).toBeUndefined();
  });

  it('publishes computation events to subscribers and the latest signal', () => {
    let received: ComputationEvent | null = null;
    service.computations$.subscribe((value) => {
      received = value;
    });

    const input = service.createTensor([1, 2], [2], 'float32', 'A');
    const published = service.publishComputation('sum', {
      inputs: [input],
      code: 'const result = tf.sum(A);',
    });

    expect(received).not.toBeNull();
    expect(published.operation).toBe('sum');
    expect(published.inputs).toHaveLength(1);
    expect(service.latestComputation()?.operation).toBe('sum');

    service.dispose();
  });
});
