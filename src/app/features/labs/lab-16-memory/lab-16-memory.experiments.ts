import type { Tensor } from '@tensorflow/tfjs';
import type { MemoryTimelineData, MemoryTimelinePoint } from '@domain/content';
import type { TfjsMemorySnapshot } from '@core/tfjs';
import { clamp } from '@core/utils';
import type { ExperimentFn, ExperimentResult } from '@shared/experiments';
import type { LabRuntimeService } from '@shared/runtime';
import { concatMap, finalize, map, range, timer } from 'rxjs';

export const LAB_16_MEMORY = 'lab-16-memory';

/** Delay between rounds: small enough that tests/streams finish quickly. */
const ROUND_DELAY_MS = 5;
/** Matches `lab16MemoryConfig.memoryBudgetMB`. */
const MEMORY_BUDGET_MB = 50;

/** Monotonic id so tensor labels from one stream can never clash with another. */
let streamCounter = 0;

type MemoryStrategy = 'leak' | 'tidy';

const CODE: Readonly<Record<MemoryStrategy, string>> = {
  leak: [
    '// ❌ Cada tensor criado no loop continua vivo.',
    'for (let i = 0; i < N; i++) {',
    '  tf.tensor(new Float32Array(size));',
    '}',
    '// tf.memory().numTensors cresce a cada rodada.',
  ].join('\n'),
  tidy: [
    '// ✅ tf.tidy libera tudo que não for retornado.',
    'tf.tidy(() => {',
    '  for (let i = 0; i < N; i++) {',
    '    tf.tensor(new Float32Array(size));',
    '  }',
    '  return [];',
    '});',
    '// tf.memory().numTensors fica estável.',
  ].join('\n'),
};

function asStrategy(value: unknown): MemoryStrategy {
  return value === 'tidy' ? 'tidy' : 'leak';
}

function asNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Publishes the real before/after memory figures to the "Under the Hood"
 * panel as two short-lived `[numTensors, usedMemoryMB]` tensors.
 * `publishComputation` serializes them synchronously and the surrounding
 * `tidy` disposes them immediately, so the panel never keeps memory alive.
 */
function publishMemory(
  runtime: LabRuntimeService,
  before: TfjsMemorySnapshot,
  after: TfjsMemorySnapshot,
  code: string,
): void {
  runtime.tidy(() => {
    const beforeTensor = runtime.tf.tensor1d([before.numTensors, before.usedMemoryMB], 'float32');
    const afterTensor = runtime.tf.tensor1d([after.numTensors, after.usedMemoryMB], 'float32');
    runtime.publishComputation(LAB_16_MEMORY, {
      inputs: [beforeTensor],
      output: afterTensor,
      code,
    });
    return [];
  }, 'lab-16-memory-publish');
}

/**
 * Lab 16 experiment: streams one `memory-timeline` update per round so the
 * visualization is live.
 *
 * - `leak`: creates and tracks the tensors, keeping them alive → real
 *   `tf.memory()` grows.
 * - `tidy`: creates the same tensors inside `runtime.tidy` → released each
 *   round, memory stays flat.
 *
 * The tensors created by this experiment are disposed when the stream is torn
 * down (parameter change or stage destroy), so switching strategies recovers
 * memory. `runtime.dispose()` is intentionally never called (it would clear the
 * whole lab).
 */
export const memoryExperiment: ExperimentFn = (params, runtime) => {
  const strategy = asStrategy(params['strategy']);
  const rounds = clamp(Math.round(asNumber(params['rounds'], 10)), 1, 30);
  const tensorsPerRound = clamp(Math.round(asNumber(params['tensorsPerRound'], 50)), 1, 500);
  const size = clamp(Math.round(asNumber(params['size'], 1000)), 1, 5000);

  const snapshots: MemoryTimelinePoint[] = [];
  const scratch: Tensor[] = [];
  const streamId = ++streamCounter;

  const runRound = (): ExperimentResult => {
    const before = runtime.getMemorySnapshot();

    if (strategy === 'tidy') {
      runtime.tidy(() => {
        for (let index = 0; index < tensorsPerRound; index++) {
          runtime.tf.tensor(new Float32Array(size).fill(index), [size], 'float32');
        }
        return [];
      }, 'lab-16-tidy');
    } else {
      for (let index = 0; index < tensorsPerRound; index++) {
        scratch.push(
          runtime.createTensor(
            new Float32Array(size).fill(index),
            [size],
            'float32',
            `lab-16-leak-${streamId}-${scratch.length}`,
          ),
        );
      }
    }

    const after = runtime.getMemorySnapshot();
    snapshots.push({
      timestamp: after.timestamp,
      usedMemoryMB: after.usedMemoryMB,
      tensorCount: after.numTensors,
    });

    publishMemory(runtime, before, after, CODE[strategy]);

    const data: MemoryTimelineData = {
      type: 'memory-timeline',
      snapshots: snapshots.map((point) => ({ ...point })),
      budgetMB: MEMORY_BUDGET_MB,
      title:
        strategy === 'leak'
          ? 'Vazamento: sem dispose, a memória sobe'
          : 'Com tf.tidy: a memória fica estável',
    };

    return { visualizationData: data, codeSnippet: CODE[strategy] };
  };

  return range(0, rounds).pipe(
    concatMap(() => timer(ROUND_DELAY_MS).pipe(map(() => runRound()))),
    finalize(() => {
      for (const tensor of scratch) {
        if (!tensor.isDisposed) {
          tensor.dispose();
        }
      }
      scratch.length = 0;
    }),
  );
};
