import type { ChallengeValidation } from '@domain/content';
import { validateChallenge } from './challenge-validator';

describe('validateChallenge', () => {
  describe('parameter-match', () => {
    const validation: ChallengeValidation = {
      type: 'parameter-match',
      criteria: { target: { w: 2, b: -1 } },
    };

    it('passes when all parameters match', () => {
      const result = validateChallenge(validation, {
        kind: 'parameter-match',
        params: { w: 2, b: -1 },
      });

      expect(result.valid).toBe(true);
    });

    it('passes for numerically-equivalent string inputs', () => {
      const result = validateChallenge(validation, {
        kind: 'parameter-match',
        params: { w: '2', b: '-1' },
      });

      expect(result.valid).toBe(true);
    });

    it('fails when a parameter differs', () => {
      const result = validateChallenge(validation, {
        kind: 'parameter-match',
        params: { w: 3, b: -1 },
      });

      expect(result.valid).toBe(false);
      expect(result.message).toContain('w');
    });
  });

  describe('tensor-value', () => {
    const validation: ChallengeValidation = {
      type: 'tensor-value',
      criteria: {
        expectedShape: [2, 2],
        expectedValues: [1, 2, 3, 4],
        tolerance: 0.01,
      },
    };

    it('passes within tolerance and matching shape', () => {
      const result = validateChallenge(validation, {
        kind: 'tensor-value',
        shape: [2, 2],
        values: [1, 2, 3, 4],
      });

      expect(result.valid).toBe(true);
    });

    it('fails when the shape is wrong', () => {
      const result = validateChallenge(validation, {
        kind: 'tensor-value',
        shape: [4],
        values: [1, 2, 3, 4],
      });

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Shape');
    });

    it('fails when a value is outside tolerance', () => {
      const result = validateChallenge(validation, {
        kind: 'tensor-value',
        values: [1, 2, 3, 9],
      });

      expect(result.valid).toBe(false);
    });
  });

  describe('multiple-choice', () => {
    const validation: ChallengeValidation = {
      type: 'multiple-choice',
      criteria: {
        options: [
          { id: 'a', label: 'Sigmoid' },
          { id: 'b', label: 'ReLU' },
        ],
        correctOptionIds: ['b'],
      },
    };

    it('passes with the correct selection', () => {
      const result = validateChallenge(validation, {
        kind: 'multiple-choice',
        selectedOptionIds: ['b'],
      });

      expect(result.valid).toBe(true);
    });

    it('fails with the wrong selection', () => {
      const result = validateChallenge(validation, {
        kind: 'multiple-choice',
        selectedOptionIds: ['a'],
      });

      expect(result.valid).toBe(false);
    });

    it('fails when extra options are selected', () => {
      const result = validateChallenge(validation, {
        kind: 'multiple-choice',
        selectedOptionIds: ['a', 'b'],
      });

      expect(result.valid).toBe(false);
    });
  });

  describe('free-form', () => {
    const validation: ChallengeValidation = {
      type: 'free-form',
      criteria: { requiredTerms: ['gradiente', 'learning rate'] },
    };

    it('passes when every required term is present (case-insensitive)', () => {
      const result = validateChallenge(validation, {
        kind: 'free-form',
        answer: 'O Gradiente e o Learning Rate controlam o treino.',
      });

      expect(result.valid).toBe(true);
    });

    it('fails when a term is missing', () => {
      const result = validateChallenge(validation, {
        kind: 'free-form',
        answer: 'O gradiente controla o treino.',
      });

      expect(result.valid).toBe(false);
    });
  });
});
