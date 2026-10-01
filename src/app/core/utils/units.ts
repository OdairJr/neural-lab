export const BYTES_PER_MB = 1024 * 1024;

/** Converts a byte count to megabytes, rounded to two decimals. */
export function bytesToMB(bytes: number): number {
  return Number((bytes / BYTES_PER_MB).toFixed(2));
}

/** Converts megabytes to bytes. */
export function mbToBytes(megabytes: number): number {
  return megabytes * BYTES_PER_MB;
}

/** Clamps a number to the inclusive [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
