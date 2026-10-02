import { createLabProgress, type ChallengeAttempt, type LabProgress } from '@domain/progress';
import { computeStreak, computeStrugglePoints, formatDuration } from './learning-insights';

function at(year: number, month: number, day: number): string {
  return new Date(year, month - 1, day, 10, 0, 0).toISOString();
}

function attempt(stageIndex: number, success: boolean): ChallengeAttempt {
  return { stageIndex, timestamp: at(2026, 3, 10), success, hintUsed: false };
}

describe('computeStreak', () => {
  const now = new Date(2026, 2, 10, 18, 0, 0);

  it('returns 0 without any activity', () => {
    expect(computeStreak([], now)).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    expect(computeStreak([at(2026, 3, 10), at(2026, 3, 9), at(2026, 3, 8)], now)).toBe(3);
  });

  it('keeps the streak alive when today has no activity yet', () => {
    expect(computeStreak([at(2026, 3, 9), at(2026, 3, 8)], now)).toBe(2);
  });

  it('breaks the streak after a skipped day', () => {
    expect(computeStreak([at(2026, 3, 7), at(2026, 3, 6)], now)).toBe(0);
  });

  it('deduplicates multiple events on the same day', () => {
    expect(computeStreak([at(2026, 3, 10), at(2026, 3, 10), at(2026, 3, 9)], now)).toBe(2);
  });
});

describe('computeStrugglePoints', () => {
  it('ranks failed challenge attempts by frequency', () => {
    const labA: LabProgress = {
      ...createLabProgress('lab-a'),
      challengeAttempts: [attempt(0, false), attempt(0, false), attempt(1, true)],
    };
    const labB: LabProgress = {
      ...createLabProgress('lab-b'),
      challengeAttempts: [attempt(3, false)],
    };

    expect(computeStrugglePoints([labA, labB])).toEqual([
      { labId: 'lab-a', stageIndex: 0, failures: 2 },
      { labId: 'lab-b', stageIndex: 3, failures: 1 },
    ]);
  });

  it('returns an empty list when there are no failures', () => {
    const lab: LabProgress = {
      ...createLabProgress('lab-a'),
      challengeAttempts: [attempt(0, true)],
    };
    expect(computeStrugglePoints([lab])).toEqual([]);
  });
});

describe('formatDuration', () => {
  it('formats minutes and hours', () => {
    expect(formatDuration(0)).toBe('0 min');
    expect(formatDuration(30_000)).toBe('menos de 1 min');
    expect(formatDuration(600_000)).toBe('10 min');
    expect(formatDuration(3_600_000)).toBe('1 h');
    expect(formatDuration(3_900_000)).toBe('1 h 5 min');
  });
});
