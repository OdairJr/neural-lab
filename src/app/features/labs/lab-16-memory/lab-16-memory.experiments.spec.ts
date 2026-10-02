import { TestBed } from '@angular/core/testing';
import * as tf from '@tensorflow/tfjs';
import { firstValueFrom, take, toArray, type Observable } from 'rxjs';
import type { VisualizationData } from '@domain/content';
import { TfjsMemoryService, TensorSerializerService, TFJS_TOKEN } from '@core/tfjs';
import { LabRuntimeService, type ComputationEvent } from '@shared/runtime';
import type { ExperimentResult } from '@shared/experiments';
import { memoryExperiment } from './lab-16-memory.experiments';

type MemoryTimelineVisualization = Extract<VisualizationData, { type: 'memory-timeline' }>;

function timeline(result: ExperimentResult): MemoryTimelineVisualization {
  return result.visualizationData as MemoryTimelineVisualization;
}

describe('Lab 16 memory experiment', () => {
  let runtime: LabRuntimeService;

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

  function stream(params: Record<string, unknown>): Observable<ExperimentResult> {
    return memoryExperiment(params, runtime) as Observable<ExperimentResult>;
  }

  it('streams one accumulating snapshot per round', async () => {
    const emissions = await firstValueFrom(
      stream({ strategy: 'leak', rounds: 5, tensorsPerRound: 10, size: 100 }).pipe(toArray()),
    );

    expect(emissions).toHaveLength(5);
    for (const [index, emission] of emissions.entries()) {
      expect(timeline(emission).snapshots).toHaveLength(index + 1);
    }
    expect(timeline(emissions[0]).budgetMB).toBe(50);
  });

  it('leaks: the live tensor count grows across rounds', async () => {
    const emissions = await firstValueFrom(
      stream({ strategy: 'leak', rounds: 6, tensorsPerRound: 20, size: 100 }).pipe(toArray()),
    );

    const snapshots = timeline(emissions[emissions.length - 1]).snapshots;
    expect(snapshots).toHaveLength(6);
    expect(snapshots[snapshots.length - 1].tensorCount).toBeGreaterThan(snapshots[0].tensorCount);
  });

  it('tidy: the live tensor count stays flat across rounds', async () => {
    const emissions = await firstValueFrom(
      stream({ strategy: 'tidy', rounds: 6, tensorsPerRound: 20, size: 100 }).pipe(toArray()),
    );

    const snapshots = timeline(emissions[emissions.length - 1]).snapshots;
    expect(snapshots).toHaveLength(6);
    expect(snapshots[snapshots.length - 1].tensorCount).toBe(snapshots[0].tensorCount);
  });

  it('publishes real memory before/after for every leaking round', async () => {
    const events: ComputationEvent[] = [];
    const subscription = runtime.computations$.subscribe((event) => events.push(event));
    try {
      const emissions = await firstValueFrom(
        stream({ strategy: 'leak', rounds: 4, tensorsPerRound: 10, size: 100 }).pipe(toArray()),
      );
      expect(emissions).toHaveLength(4);
    } finally {
      subscription.unsubscribe();
    }

    expect(events).toHaveLength(4);
    for (const event of events) {
      expect(event.operation).toBe('lab-16-memory');
      expect(event.inputs).toHaveLength(1);
      expect(event.output).toBeDefined();
      // Output tensor count must exceed the before count for a leaking round.
      expect(event.output!.values[0]).toBeGreaterThan(event.inputs[0].values[0]);
      expect(event.code).toContain('tf.memory()');
    }
  });

  it('publishes equal before/after tensor counts for the tidy strategy', async () => {
    const events: ComputationEvent[] = [];
    const subscription = runtime.computations$.subscribe((event) => events.push(event));
    try {
      await firstValueFrom(
        stream({ strategy: 'tidy', rounds: 4, tensorsPerRound: 10, size: 100 }).pipe(toArray()),
      );
    } finally {
      subscription.unsubscribe();
    }

    expect(events).toHaveLength(4);
    for (const event of events) {
      expect(event.output?.values[0]).toBe(event.inputs[0].values[0]);
    }
  });

  it('disposes its scratch tensors when the stream is torn down', async () => {
    const baseline = tf.memory().numTensors;

    const emissions = await firstValueFrom(
      stream({ strategy: 'leak', rounds: 10, tensorsPerRound: 25, size: 100 }).pipe(
        take(3),
        toArray(),
      ),
    );

    expect(emissions).toHaveLength(3);
    // `take(3)` completed the subscription, so `finalize` released the tensors.
    expect(tf.memory().numTensors).toBe(baseline);
  });

  it('recovers memory when switching from a leak to the tidy strategy', async () => {
    const baseline = tf.memory().numTensors;

    await firstValueFrom(
      stream({ strategy: 'leak', rounds: 10, tensorsPerRound: 25, size: 100 }).pipe(
        take(4),
        toArray(),
      ),
    );
    expect(tf.memory().numTensors).toBe(baseline);

    const tidy = await firstValueFrom(
      stream({ strategy: 'tidy', rounds: 4, tensorsPerRound: 25, size: 100 }).pipe(toArray()),
    );
    const flat = timeline(tidy[tidy.length - 1]).snapshots;
    expect(flat[flat.length - 1].tensorCount).toBe(flat[0].tensorCount);
  });
});
