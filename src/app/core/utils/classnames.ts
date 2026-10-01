export type ClassValue = string | false | null | undefined;

/** Joins truthy class name fragments, keeping templates free of logic. */
export function cn(...values: ClassValue[]): string {
  return values.filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ');
}
