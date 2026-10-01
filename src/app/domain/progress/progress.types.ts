/** Current persisted progress schema version. */
export const PROGRESS_SCHEMA_VERSION = 1;

export type LabStatus = 'not-started' | 'in-progress' | 'completed';

import type { ThemePreference } from '@core/ui/theme';

export type { ThemePreference };

export interface ChallengeAttempt {
  stageIndex: number;
  timestamp: string;
  success: boolean;
  userInput?: unknown;
  hintUsed: boolean;
}

export interface LabProgress {
  labId: string;
  status: LabStatus;
  completedStages: string[];
  currentStageIndex: number;
  timeSpentMs: number;
  challengeAttempts: ChallengeAttempt[];
  experimentStates: Record<string, unknown>;
}

export interface UserSettings {
  theme: ThemePreference;
  reducedMotion: boolean;
  showUnderTheHood: boolean;
  language: 'pt-BR';
}

export type AnalyticsEventType =
  | 'lab-started'
  | 'stage-completed'
  | 'challenge-passed'
  | 'challenge-failed'
  | 'lab-completed'
  | 'glossary-viewed'
  | 'settings-changed';

export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  timestamp: string;
  payload?: Record<string, unknown>;
}

/** Root aggregate persisted to localStorage under `neural-lab:v1:progress`. */
export interface ProgressState {
  version: number;
  lastUpdated: string;
  labs: LabProgress[];
  glossaryViews: string[];
  settings: UserSettings;
  analytics: AnalyticsEvent[];
}

export function createLabProgress(labId: string): LabProgress {
  return {
    labId,
    status: 'not-started',
    completedStages: [],
    currentStageIndex: 0,
    timeSpentMs: 0,
    challengeAttempts: [],
    experimentStates: {},
  };
}

export function createDefaultSettings(): UserSettings {
  return {
    theme: 'system',
    reducedMotion: false,
    showUnderTheHood: false,
    language: 'pt-BR',
  };
}

export function createDefaultProgress(): ProgressState {
  return {
    version: PROGRESS_SCHEMA_VERSION,
    lastUpdated: new Date().toISOString(),
    labs: [],
    glossaryViews: [],
    settings: createDefaultSettings(),
    analytics: [],
  };
}
