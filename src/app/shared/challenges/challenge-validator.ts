import type { ChallengeValidation } from '@domain/content';

/** User input submitted to a challenge validator. */
export type ChallengeInput =
  | { kind: 'parameter-match'; params: Record<string, unknown> }
  | { kind: 'tensor-value'; values: number[]; shape?: number[] }
  | { kind: 'multiple-choice'; selectedOptionIds: string[] }
  | { kind: 'code-output'; output: string }
  | { kind: 'free-form'; answer: string };

export interface ChallengeResult {
  valid: boolean;
  message: string;
}

const DEFAULT_TOLERANCE = 1e-3;

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Pure challenge validation used by `ChallengeStageComponent`. Returns a
 * human-readable result so the UI can display success/failure feedback.
 */
export function validateChallenge(
  validation: ChallengeValidation,
  input: ChallengeInput,
): ChallengeResult {
  switch (validation.type) {
    case 'parameter-match': {
      if (input.kind !== 'parameter-match') {
        return { valid: false, message: 'Entrada incompatível com o desafio.' };
      }
      for (const [key, expected] of Object.entries(validation.criteria.target)) {
        const expectedNumber = toNumber(expected);
        const actualNumber = toNumber(input.params[key]);
        const matches =
          expectedNumber !== null && actualNumber !== null
            ? Math.abs(expectedNumber - actualNumber) < DEFAULT_TOLERANCE
            : input.params[key] === expected;
        if (!matches) {
          return {
            valid: false,
            message: `O valor de "${key}" ainda não está correto.`,
          };
        }
      }
      return { valid: true, message: 'Parâmetros corretos!' };
    }

    case 'tensor-value': {
      if (input.kind !== 'tensor-value') {
        return { valid: false, message: 'Entrada incompatível com o desafio.' };
      }
      const { expectedShape, expectedValues } = validation.criteria;
      const tolerance = validation.criteria.tolerance ?? DEFAULT_TOLERANCE;

      if (input.shape) {
        const shapeMatches =
          input.shape.length === expectedShape.length &&
          input.shape.every((value, index) => value === expectedShape[index]);
        if (!shapeMatches) {
          return { valid: false, message: `Shape incorreto: esperado [${expectedShape.join(', ')}].` };
        }
      }

      if (input.values.length !== expectedValues.length) {
        return {
          valid: false,
          message: `Quantidade de valores incorreta: esperado ${expectedValues.length}.`,
        };
      }
      for (let index = 0; index < expectedValues.length; index++) {
        if (Math.abs(input.values[index] - expectedValues[index]) > tolerance) {
          return {
            valid: false,
            message: `O valor na posição ${index} está fora da tolerância.`,
          };
        }
      }
      return { valid: true, message: 'Tensor correto!' };
    }

    case 'multiple-choice': {
      if (input.kind !== 'multiple-choice') {
        return { valid: false, message: 'Entrada incompatível com o desafio.' };
      }
      const selected = new Set(input.selectedOptionIds);
      const correct = new Set(validation.criteria.correctOptionIds);
      const sameSize = selected.size === correct.size;
      const sameItems = [...correct].every((id) => selected.has(id));
      if (sameSize && sameItems) {
        return { valid: true, message: 'Resposta correta!' };
      }
      return { valid: false, message: 'A seleção ainda não está correta.' };
    }

    case 'code-output': {
      if (input.kind !== 'code-output') {
        return { valid: false, message: 'Entrada incompatível com o desafio.' };
      }
      const actual = input.output.trim();
      const expected = validation.criteria.expectedOutput.trim();
      return actual === expected
        ? { valid: true, message: 'Saída correta!' }
        : { valid: false, message: 'A saída do código ainda não é a esperada.' };
    }

    case 'free-form': {
      if (input.kind !== 'free-form') {
        return { valid: false, message: 'Entrada incompatível com o desafio.' };
      }
      const answer = input.answer.toLowerCase();
      const missing = validation.criteria.requiredTerms.filter(
        (term) => !answer.includes(term.toLowerCase()),
      );
      return missing.length === 0
        ? { valid: true, message: 'Resposta correta!' }
        : { valid: false, message: `Faltam termos: ${missing.join(', ')}.` };
    }
  }
}
