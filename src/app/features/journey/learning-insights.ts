import type { LabProgress } from '@domain/progress';

const DAYS_IN_MS = 24 * 60 * 60 * 1000;

/** Local-time day key (`YYYY-MM-DD`) used for streak grouping. */
function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Converts an ISO timestamp to a local-time day key, or `null` when invalid. */
function timestampDayKey(timestamp: string): string | null {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : dayKey(date);
}

/**
 * Current streak: number of consecutive days with activity ending today or,
 * when today has no activity yet, ending yesterday (the streak is not broken
 * until a full day passes without activity).
 */
export function computeStreak(timestamps: readonly string[], now: Date = new Date()): number {
  const days = new Set<string>();
  for (const timestamp of timestamps) {
    const key = timestampDayKey(timestamp);
    if (key) {
      days.add(key);
    }
  }

  if (days.size === 0) {
    return 0;
  }

  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(dayKey(cursor))) {
    cursor.setTime(cursor.getTime() - DAYS_IN_MS);
    if (!days.has(dayKey(cursor))) {
      return 0;
    }
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setTime(cursor.getTime() - DAYS_IN_MS);
  }
  return streak;
}

/** A stage where the user failed the most challenge attempts. */
export interface StrugglePoint {
  labId: string;
  stageIndex: number;
  failures: number;
}

/**
 * Aggregates failed challenge attempts per lab/stage and returns the top
 * struggle points, most failures first.
 */
export function computeStrugglePoints(
  labs: readonly LabProgress[],
  limit = 5,
): StrugglePoint[] {
  const counts = new Map<string, StrugglePoint>();

  for (const lab of labs) {
    for (const attempt of lab.challengeAttempts) {
      if (attempt.success) {
        continue;
      }
      const key = `${lab.labId}::${attempt.stageIndex}`;
      const existing = counts.get(key);
      if (existing) {
        existing.failures += 1;
      } else {
        counts.set(key, {
          labId: lab.labId,
          stageIndex: attempt.stageIndex,
          failures: 1,
        });
      }
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.failures - a.failures)
    .slice(0, limit);
}

/** Human-readable duration, e.g. `1 h 5 min`, `12 min`, `menos de 1 min`. */
export function formatDuration(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return '0 min';
  }
  const totalMinutes = Math.floor(milliseconds / 60000);
  if (totalMinutes < 1) {
    return 'menos de 1 min';
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes} min`;
  }
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

/** Formats an ISO timestamp as a short PT-BR date/time, or a dash when empty. */
export function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) {
    return '—';
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
