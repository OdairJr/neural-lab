import { Injectable } from '@angular/core';
import {
  createDefaultProgress,
  createDefaultSettings,
  PROGRESS_SCHEMA_VERSION,
  type AnalyticsEvent,
  type AnalyticsEventType,
  type ChallengeAttempt,
  type LabProgress,
  type LabStatus,
  type ProgressState,
  type ThemePreference,
  type UserSettings,
} from './progress.types';

const LAB_STATUSES: readonly LabStatus[] = ['not-started', 'in-progress', 'completed'];

const THEME_PREFERENCES: readonly ThemePreference[] = ['light', 'dark', 'system'];

const EVENT_TYPES: readonly AnalyticsEventType[] = [
  'lab-started',
  'stage-completed',
  'challenge-passed',
  'challenge-failed',
  'lab-completed',
  'glossary-viewed',
  'settings-changed',
];

/**
 * Migrates arbitrary (including legacy or corrupt) persisted data into the
 * current `ProgressState` schema. Unknown/older versions are upgraded in
 * place; data from a future schema version is discarded to avoid corruption.
 */
@Injectable({ providedIn: 'root' })
export class ProgressMigrator {
  migrate(raw: unknown): ProgressState {
    if (!isRecord(raw)) {
      return createDefaultProgress();
    }

    const version = typeof raw['version'] === 'number' ? raw['version'] : 0;
    if (version > PROGRESS_SCHEMA_VERSION) {
      console.warn(
        `[NeuralLab] Progress schema v${version} is newer than supported v${PROGRESS_SCHEMA_VERSION}; resetting.`,
      );
      return createDefaultProgress();
    }

    return this.normalize(raw);
  }

  private normalize(raw: Record<string, unknown>): ProgressState {
    const defaults = createDefaultProgress();

    return {
      version: PROGRESS_SCHEMA_VERSION,
      lastUpdated:
        typeof raw['lastUpdated'] === 'string' ? raw['lastUpdated'] : defaults.lastUpdated,
      labs: toRecordArray(raw['labs']).map(toLabProgress).filter((lab) => lab.labId !== ''),
      glossaryViews: toStringArray(raw['glossaryViews']),
      settings: toSettings(raw['settings']),
      analytics: toRecordArray(raw['analytics'])
        .map(toAnalyticsEvent)
        .filter((event): event is AnalyticsEvent => event !== null),
    };
  }
}

function toLabProgress(raw: Record<string, unknown>): LabProgress {
  const status = raw['status'];
  return {
    labId: typeof raw['labId'] === 'string' ? raw['labId'] : '',
    status: LAB_STATUSES.includes(status as LabStatus) ? (status as LabStatus) : 'not-started',
    completedStages: toStringArray(raw['completedStages']),
    currentStageIndex: typeof raw['currentStageIndex'] === 'number' ? raw['currentStageIndex'] : 0,
    timeSpentMs: typeof raw['timeSpentMs'] === 'number' ? raw['timeSpentMs'] : 0,
    challengeAttempts: toRecordArray(raw['challengeAttempts']).map(toChallengeAttempt),
    experimentStates: isRecord(raw['experimentStates']) ? { ...raw['experimentStates'] } : {},
  };
}

function toChallengeAttempt(raw: Record<string, unknown>): ChallengeAttempt {
  return {
    stageIndex: typeof raw['stageIndex'] === 'number' ? raw['stageIndex'] : 0,
    timestamp: typeof raw['timestamp'] === 'string' ? raw['timestamp'] : new Date().toISOString(),
    success: raw['success'] === true,
    userInput: raw['userInput'],
    hintUsed: raw['hintUsed'] === true,
  };
}

function toSettings(raw: unknown): UserSettings {
  const defaults = createDefaultSettings();
  if (!isRecord(raw)) {
    return defaults;
  }
  const theme = raw['theme'];
  return {
    theme: THEME_PREFERENCES.includes(theme as ThemePreference)
      ? (theme as ThemePreference)
      : defaults.theme,
    reducedMotion: raw['reducedMotion'] === true,
    showUnderTheHood: raw['showUnderTheHood'] === true,
    language: 'pt-BR',
  };
}

function toAnalyticsEvent(raw: Record<string, unknown>): AnalyticsEvent | null {
  const eventType = raw['eventType'];
  if (!EVENT_TYPES.includes(eventType as AnalyticsEventType)) {
    return null;
  }
  return {
    eventType: eventType as AnalyticsEventType,
    timestamp: typeof raw['timestamp'] === 'string' ? raw['timestamp'] : new Date().toISOString(),
    payload: isRecord(raw['payload']) ? { ...raw['payload'] } : undefined,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}
