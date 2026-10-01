/**
 * Lightweight, presentation-facing summary of a laboratory. Full lab configs
 * (stages, experiments, challenges) arrive in a later phase; the journey and
 * catalog views only need this shape.
 */
export interface LabSummary {
  /** Stable identifier, e.g. `lab-01-tensors`. */
  id: string;
  /** 1-based journey order. */
  number: number;
  /** URL slug, e.g. `01-fundamentos-de-tensores`. */
  slug: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  /** Concept ids covered by the lab. */
  concepts: string[];
  /** Lab ids that should be completed first. */
  prerequisites: string[];
  /** Coarse grouping used by the catalog filters. */
  category: LabCategory;
}

export type LabCategory =
  | 'tensors'
  | 'operations'
  | 'ml'
  | 'neural-networks'
  | 'images'
  | 'memory';
