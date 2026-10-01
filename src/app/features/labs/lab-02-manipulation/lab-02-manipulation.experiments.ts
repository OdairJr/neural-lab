import type { Tensor } from '@tensorflow/tfjs';
import { parseShape, shapeSize } from '@core/utils';
import type { ExperimentFn } from '@shared/experiments';
import type { LabRuntimeService } from '@shared/runtime';

export const LAB_02_RESHAPE = 'lab-02-reshape';

const BASE_VALUES = [1, 2, 3, 4, 5, 6];

/** Normalizes a (possibly negative) axis against a rank. */
export function normalizeAxis(axis: number, rank: number): number {
  const normalized = axis < 0 ? rank + axis : axis;
  return Math.max(0, Math.min(rank, Math.trunc(normalized)));
}

/** The input shape used by each manipulation, chosen so the result is rank 1-3. */
export function manipulationBaseShape(operation: string): number[] {
  return operation === 'squeeze' ? [1, 2, 3] : [2, 3];
}

/**
 * Pure shape calculation for the manipulation operations. Mirrors the shape
 * semantics of the corresponding TF.js call and is used both to normalize the
 * experiment and to unit-test the expected shapes.
 */
export function manipulationShape(
  operation: string,
  baseShape: readonly number[],
  axis: number,
  requestedShape?: readonly number[],
): number[] {
  const size = shapeSize(baseShape);
  switch (operation) {
    case 'flatten':
      return [size];
    case 'expandDims': {
      const position = normalizeAxis(axis, baseShape.length);
      return [...baseShape.slice(0, position), 1, ...baseShape.slice(position)];
    }
    case 'squeeze': {
      const position = normalizeAxis(axis, baseShape.length - 1);
      if (baseShape[position] !== 1) {
        return [...baseShape];
      }
      return baseShape.filter((_, index) => index !== position);
    }
    default: {
      if (requestedShape && shapeSize(requestedShape) === size) {
        return [...requestedShape];
      }
      return [...baseShape];
    }
  }
}

function applyOperation(
  runtime: LabRuntimeService,
  operation: string,
  base: Tensor,
  axis: number,
  requestedShape?: readonly number[],
): { result: Tensor; code: string } {
  const tf = runtime.tf;
  switch (operation) {
    case 'flatten':
      return { result: tf.reshape(base, [-1]), code: 'tf.reshape(t, [-1])' };
    case 'expandDims':
      return { result: tf.expandDims(base, axis), code: `tf.expandDims(t, ${axis})` };
    case 'squeeze':
      return { result: tf.squeeze(base, [axis]), code: `tf.squeeze(t, ${axis})` };
    default: {
      const targetShape = requestedShape
        ? [...requestedShape]
        : [shapeSize(base.shape)];
      return {
        result: tf.reshape(base, targetShape),
        code: `tf.reshape(t, [${targetShape.join(', ')}])`,
      };
    }
  }
}

/**
 * Experiment for Lab 2: applies reshape/flatten/expandDims/squeeze to a fixed
 * tensor and publishes the resulting shape. Invalid squeeze/reshape requests
 * fall back to a safe result instead of throwing.
 */
export const manipulateExperiment: ExperimentFn = (params, runtime) => {
  const operation = typeof params['operacao'] === 'string' ? params['operacao'] : 'reshape';
  const axis = Number(params['axis'] ?? 0);
  const requestedShape = parseShape(params['shape']);

  const baseShape = manipulationBaseShape(operation);
  const base = runtime.createTensor(BASE_VALUES, baseShape, 'float32', 'lab-02-base');

  let result: Tensor;
  let code: string;
  let note = '';
  try {
    const applied = applyOperation(runtime, operation, base, axis, requestedShape);
    result = applied.result;
    code = applied.code;
  } catch {
    const fallbackShape = [BASE_VALUES.length];
    result = runtime.tf.reshape(base, fallbackShape);
    code = `tf.reshape(t, [${fallbackShape.join(', ')}])`;
    note = ' · operação inválida para este eixo, mostrando flatten';
  }

  const tracked = runtime.track(result, 'lab-02-result');
  const snapshot = runtime.getSnapshot('lab-02-result');
  const resultShape = tracked.shape;

  return {
    tensors: [base, tracked],
    visualizationData: snapshot
      ? {
          type: 'tensor-grid',
          tensor: snapshot,
          title: `[${baseShape.join(', ')}] → [${resultShape.join(', ')}] · rank ${resultShape.length}${note}`,
        }
      : undefined,
    codeSnippet: [
      `const t = tf.tensor([${BASE_VALUES.join(', ')}], [${baseShape.join(', ')}]);`,
      `const result = ${code};`,
    ].join('\n'),
  };
};

/** Experiment functions contributed by Lab 2. */
export const LAB_02_EXPERIMENTS = {
  [LAB_02_RESHAPE]: manipulateExperiment,
} satisfies Record<string, ExperimentFn>;
