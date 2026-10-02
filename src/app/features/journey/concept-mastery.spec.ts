import { createLabProgress } from '@domain/progress';
import { MASTERY_DIMENSIONS, computeMastery } from './concept-mastery';

const EXPECTED_LABELS = [
  'Tensors',
  'Operations',
  'Algebra',
  'ML',
  'Regression',
  'Gradient Descent',
  'Neurons',
  'Activations',
  'Networks',
  'Classification',
  'Images',
  'Memory',
];

describe('MASTERY_DIMENSIONS', () => {
  it('lists the 12 spec dimensions in order', () => {
    expect(MASTERY_DIMENSIONS.map((dimension) => dimension.label)).toEqual(EXPECTED_LABELS);
  });
});

describe('computeMastery', () => {
  it('computes the completed-stage ratio for each dimension', () => {
    const totalStagesByLab = new Map<string, number>([
      ['lab-01-tensors', 10],
      ['lab-02-manipulation', 10],
      ['lab-03-elementwise', 10],
      ['lab-09-linear-regression', 20],
    ]);

    const labs = [
      {
        ...createLabProgress('lab-01-tensors'),
        completedStages: Array.from({ length: 5 }, (_, index) => `s${index}`),
      },
      {
        ...createLabProgress('lab-02-manipulation'),
        completedStages: Array.from({ length: 10 }, (_, index) => `s${index}`),
      },
      {
        ...createLabProgress('lab-09-linear-regression'),
        completedStages: Array.from({ length: 10 }, (_, index) => `s${index}`),
      },
    ];

    const points = computeMastery(labs, totalStagesByLab);
    const byLabel = new Map(points.map((point) => [point.label, point.value]));

    expect(points.map((point) => point.label)).toEqual(EXPECTED_LABELS);
    expect(byLabel.get('Tensors')).toBe(50);
    expect(byLabel.get('Operations')).toBe(50);
    expect(byLabel.get('Algebra')).toBe(0);
    expect(byLabel.get('ML')).toBe(0);
    expect(byLabel.get('Regression')).toBe(50);
    expect(byLabel.get('Memory')).toBe(0);
  });

  it('scores 0 when no lab has stages', () => {
    const points = computeMastery([], new Map());
    expect(points.every((point) => point.value === 0)).toBe(true);
  });
});
