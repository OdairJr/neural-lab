import type { LabProgress } from '@domain/progress';

/** One axis of the concept-mastery radar chart. */
export interface MasteryDimension {
  label: string;
  /** Labs whose completed-stage ratio feeds this dimension. */
  labIds: readonly string[];
}

export interface MasteryPoint {
  label: string;
  /** Percentage of completed stages across the dimension's labs (0-100). */
  value: number;
}

/**
 * Lab → mastery-dimension mapping, in the exact order required by the
 * information-architecture spec:
 *
 * - Tensors → Lab 1
 * - Operations → Labs 2-7
 * - Algebra → Lab 7
 * - ML → Lab 8
 * - Regression → Lab 9
 * - Gradient Descent → Lab 10
 * - Neurons → Lab 11
 * - Activations → Lab 12
 * - Networks → Lab 13
 * - Classification → Lab 14
 * - Images → Lab 15
 * - Memory → Lab 16
 */
export const MASTERY_DIMENSIONS: readonly MasteryDimension[] = [
  { label: 'Tensors', labIds: ['lab-01-tensors'] },
  {
    label: 'Operations',
    labIds: [
      'lab-02-manipulation',
      'lab-03-elementwise',
      'lab-04-reductions',
      'lab-05-matrix',
      'lab-06-broadcasting',
      'lab-07-linear-algebra',
    ],
  },
  { label: 'Algebra', labIds: ['lab-07-linear-algebra'] },
  { label: 'ML', labIds: ['lab-08-ml-fundamentals'] },
  { label: 'Regression', labIds: ['lab-09-linear-regression'] },
  { label: 'Gradient Descent', labIds: ['lab-10-gradient-descent'] },
  { label: 'Neurons', labIds: ['lab-11-neuron'] },
  { label: 'Activations', labIds: ['lab-12-activations'] },
  { label: 'Networks', labIds: ['lab-13-neural-networks'] },
  { label: 'Classification', labIds: ['lab-14-classification'] },
  { label: 'Images', labIds: ['lab-15-images'] },
  { label: 'Memory', labIds: ['lab-16-memory'] },
];

/**
 * Computes mastery (percentage of completed stages) for each dimension.
 * Values are rounded to whole percentages; dimensions without stages score 0.
 */
export function computeMastery(
  labs: readonly LabProgress[],
  totalStagesByLab: ReadonlyMap<string, number>,
): MasteryPoint[] {
  const byId = new Map(labs.map((lab) => [lab.labId, lab]));

  return MASTERY_DIMENSIONS.map((dimension) => {
    let completed = 0;
    let total = 0;
    for (const labId of dimension.labIds) {
      total += totalStagesByLab.get(labId) ?? 0;
      completed += byId.get(labId)?.completedStages.length ?? 0;
    }
    return {
      label: dimension.label,
      value: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });
}
