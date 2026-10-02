import { LAB_CONFIGS } from '../../src/app/educational-content/lab-configs/index';

/**
 * Data-driven view of the real laboratory configs, used by the E2E specs so the
 * table never drifts from what the application actually ships. Only the pieces
 * the browser tests need are projected: slugs, stage order and the correct
 * challenge answer.
 */

type LabConfig = (typeof LAB_CONFIGS)[number];
type Stage = LabConfig['stages'][number];
type Validation = NonNullable<Stage['validation']>;

/** A single option of a `multiple-choice` challenge. */
export interface ChallengeOption {
  id: string;
  label: string;
}

/** Normalized challenge description resolved from a lab's `desafio` stage. */
export type ChallengeDescriptor =
  | { type: 'multiple-choice'; options: ChallengeOption[]; correctOptionIds: string[] }
  | { type: 'parameter-match'; target: Record<string, unknown> }
  | { type: 'tensor-value'; expectedShape: number[]; expectedValues: number[] }
  | { type: 'code-output'; expectedOutput: string }
  | { type: 'free-form'; requiredTerms: string[] };

export interface LabSpec {
  id: string;
  number: number;
  slug: string;
  title: string;
  stageTypes: string[];
  challenge: ChallengeDescriptor;
}

function toChallengeDescriptor(validation: Validation): ChallengeDescriptor {
  switch (validation.type) {
    case 'multiple-choice':
      return {
        type: 'multiple-choice',
        options: validation.criteria.options,
        correctOptionIds: validation.criteria.correctOptionIds,
      };
    case 'parameter-match':
      return { type: 'parameter-match', target: validation.criteria.target };
    case 'tensor-value':
      return {
        type: 'tensor-value',
        expectedShape: validation.criteria.expectedShape,
        expectedValues: validation.criteria.expectedValues,
      };
    case 'code-output':
      return { type: 'code-output', expectedOutput: validation.criteria.expectedOutput };
    case 'free-form':
      return { type: 'free-form', requiredTerms: validation.criteria.requiredTerms };
  }
}

/** Every V1 laboratory, in journey order, derived from `LAB_CONFIGS`. */
export const LAB_SPECS: readonly LabSpec[] = LAB_CONFIGS.map((lab) => {
  const challengeStage = lab.stages.find((stage) => stage.type === 'desafio');
  if (!challengeStage?.validation) {
    throw new Error(`Laboratory "${lab.id}" has no challenge validation.`);
  }
  return {
    id: lab.id,
    number: lab.number,
    slug: lab.slug,
    title: lab.title,
    stageTypes: lab.stages.map((stage) => stage.type),
    challenge: toChallengeDescriptor(challengeStage.validation),
  };
});

/** Resolves a lab spec by slug, failing loudly if the catalog changes. */
export function findLabSpec(slug: string): LabSpec {
  const spec = LAB_SPECS.find((lab) => lab.slug === slug);
  if (!spec) {
    throw new Error(`Unknown laboratory slug "${slug}".`);
  }
  return spec;
}
