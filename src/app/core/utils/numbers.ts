/** Parses a comma/space separated list of numbers, ignoring invalid entries. */
export function parseNumberList(value: unknown): number[] {
  if (typeof value !== 'string') {
    return [];
  }
  return value
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((part) => Number(part))
    .filter((part) => !Number.isNaN(part));
}

/**
 * Parses a comma/space separated shape. Returns `undefined` when the input is
 * empty or contains a negative/non-integer dimension.
 */
export function parseShape(value: unknown): number[] | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }
  const shape = value
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((part) => Number(part));
  if (shape.some((dimension) => !Number.isInteger(dimension) || dimension < 0)) {
    return undefined;
  }
  return shape;
}

/** Product of every dimension of a shape (1 for an empty shape). */
export function shapeSize(shape: readonly number[]): number {
  return shape.reduce((product, dimension) => product * dimension, 1);
}

/** Whether `shape` is a valid non-empty list of non-negative integers. */
export function isValidShape(shape: readonly number[]): boolean {
  return shape.length > 0 && shape.every((dimension) => Number.isInteger(dimension) && dimension >= 0);
}
