import {
  activationDerivative,
  activationSeries,
  activationValue,
  sampleRange,
} from './activation-functions';

describe('activationValue', () => {
  it('computes sigmoid', () => {
    expect(activationValue('sigmoid', 0)).toBeCloseTo(0.5, 6);
    expect(activationValue('sigmoid', 10)).toBeGreaterThan(0.999);
  });

  it('computes relu', () => {
    expect(activationValue('relu', -3)).toBe(0);
    expect(activationValue('relu', 3)).toBe(3);
  });

  it('computes tanh', () => {
    expect(activationValue('tanh', 0)).toBe(0);
    expect(activationValue('tanh', 10)).toBeCloseTo(1, 6);
  });
});

describe('activationDerivative', () => {
  it('computes the sigmoid derivative peak at 0.25', () => {
    expect(activationDerivative('sigmoid', 0)).toBeCloseTo(0.25, 6);
  });

  it('computes the relu derivative as a step', () => {
    expect(activationDerivative('relu', -1)).toBe(0);
    expect(activationDerivative('relu', 1)).toBe(1);
  });

  it('computes the tanh derivative as 1 - tanh(x)^2', () => {
    expect(activationDerivative('tanh', 0)).toBeCloseTo(1, 6);
  });
});

describe('activationSeries', () => {
  it('normalizes softmax values so they sum to 1', () => {
    const xs = sampleRange(-2, 2, 9);
    const { values } = activationSeries('softmax', xs);
    const sum = values.reduce((total, value) => total + value, 0);

    expect(sum).toBeCloseTo(1, 6);
  });

  it('returns derivatives aligned with the sampled values', () => {
    const xs = sampleRange(-1, 1, 5);
    const { values, derivatives } = activationSeries('sigmoid', xs);

    expect(values).toHaveLength(5);
    expect(derivatives).toHaveLength(5);
    expect(derivatives[2]).toBeCloseTo(0.25, 6);
  });
});

describe('sampleRange', () => {
  it('generates evenly spaced values inclusive of the bounds', () => {
    expect(sampleRange(-1, 1, 3)).toEqual([-1, 0, 1]);
  });
});
