import { inject, Injectable } from '@angular/core';
import type { LayersModel, Tensor } from '@tensorflow/tfjs';
import { TFJS_TOKEN } from './tfjs.token';

export interface TensorStats {
  min: number;
  max: number;
  mean: number;
  std: number;
}

/** Serializable view of a tensor for the "Under the Hood" panel. */
export interface TensorSnapshot {
  shape: number[];
  dtype: string;
  values: number[];
  stats: TensorStats;
  /** Total number of elements in the tensor. */
  size: number;
  /** Whether `values` was truncated to the sample limit. */
  truncated: boolean;
}

export interface ModelLayerSnapshot {
  name: string;
  className: string;
  outputShape: (number | null)[];
  params: number;
  trainable: boolean;
}

export interface ModelSnapshot {
  name: string;
  totalParams: number;
  trainableParams: number;
  layers: ModelLayerSnapshot[];
}

const DEFAULT_MAX_ELEMENTS = 100;

/**
 * Serializes tensors and models into plain, JSON-friendly objects for the
 * "Under the Hood" panel. Tensor reads run inside `tf.tidy` so no intermediate
 * tensors leak into the lab's memory budget.
 */
@Injectable({ providedIn: 'root' })
export class TensorSerializerService {
  private readonly tf = inject(TFJS_TOKEN);

  /**
   * Serializes a tensor into shape, dtype, sampled values and statistics.
   * Large tensors are truncated to `maxElements` for display while statistics
   * are computed over the full tensor.
   */
  serialize(tensor: Tensor, maxElements = DEFAULT_MAX_ELEMENTS): TensorSnapshot {
    // `dataSync` copies the values out of the tensor; keeping it inside a tidy
    // guarantees any incidental intermediates are disposed immediately.
    const allValues = this.tf.tidy(() => Array.from(tensor.dataSync()));
    const size = allValues.length;
    const truncated = size > maxElements;
    const values = truncated ? allValues.slice(0, maxElements) : allValues;

    return {
      shape: [...tensor.shape],
      dtype: tensor.dtype,
      values,
      stats: computeStats(allValues),
      size,
      truncated,
    };
  }

  /** Serializes a layers model into layer, parameter and shape summaries. */
  serializeModel(model: LayersModel): ModelSnapshot {
    // Reading model metadata creates no tensors, so no tidy scope is needed.
    const layers: ModelLayerSnapshot[] = model.layers.map((layer) => ({
      name: layer.name,
      className: layer.getClassName(),
      outputShape: normalizeShape(layer.outputShape),
      params: layer.countParams(),
      trainable: layer.trainable,
    }));

    return {
      name: model.name,
      totalParams: model.countParams(),
      trainableParams: layers
        .filter((layer) => layer.trainable)
        .reduce((sum, layer) => sum + layer.params, 0),
      layers,
    };
  }
}

/** Computes min/max/mean/population-standard-deviation over numeric values. */
export function computeStats(values: readonly number[]): TensorStats {
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, std: 0 };
  }

  let min = Infinity;
  let max = -Infinity;
  let sum = 0;

  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
    sum += value;
  }

  const mean = sum / values.length;
  let squaredDiffSum = 0;
  for (const value of values) {
    squaredDiffSum += (value - mean) ** 2;
  }

  return {
    min,
    max,
    mean,
    std: Math.sqrt(squaredDiffSum / values.length),
  };
}

function normalizeShape(shape: unknown): (number | null)[] {
  if (!Array.isArray(shape)) {
    return [];
  }
  return shape.flatMap((entry) => (Array.isArray(entry) ? entry : [entry]));
}
