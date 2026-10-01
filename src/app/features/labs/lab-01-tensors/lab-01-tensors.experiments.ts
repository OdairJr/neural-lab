import type { DataType } from '@tensorflow/tfjs';
import { parseNumberList, parseShape, shapeSize } from '@core/utils';
import type { ExperimentFn } from '@shared/experiments';

export const LAB_01_CREATE_TENSOR = 'lab-01-create-tensor';

/**
 * Experiment for Lab 1: builds a tensor from a flat list of values plus an
 * explicit shape and serializes the result for the tensor grid. When the
 * requested shape does not match the number of values it falls back to a rank-1
 * tensor so the experiment always renders something valid.
 */
export const createTensorExperiment: ExperimentFn = (params, runtime) => {
  const values = parseNumberList(params['values']);
  const requestedShape = parseShape(params['shape']);
  const dtype: DataType = params['dtype'] === 'int32' ? 'int32' : 'float32';

  const shapeFits =
    requestedShape !== undefined && shapeSize(requestedShape) === values.length;
  const shape = shapeFits && requestedShape ? requestedShape : [values.length];

  const tensor = runtime.createTensor(values, shape, dtype, 'lab-01-tensor');
  const snapshot = runtime.getSnapshot('lab-01-tensor');

  return {
    tensors: [tensor],
    visualizationData: snapshot
      ? {
          type: 'tensor-grid',
          tensor: snapshot,
          title: `shape [${shape.join(', ')}] · rank ${shape.length} · dtype ${tensor.dtype}`,
        }
      : undefined,
    codeSnippet: `const A = tf.tensor([${values.join(', ')}], [${shape.join(', ')}], '${dtype}');`,
  };
};

/** Experiment functions contributed by Lab 1. */
export const LAB_01_EXPERIMENTS = {
  [LAB_01_CREATE_TENSOR]: createTensorExperiment,
} satisfies Record<string, ExperimentFn>;
