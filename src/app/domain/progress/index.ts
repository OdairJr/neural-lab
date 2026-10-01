export {
  createDefaultProgress,
  createDefaultSettings,
  createLabProgress,
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
export { ProgressMigrator } from './progress-migrator';
export { ProgressService, PROGRESS_STORAGE_KEY } from './progress.service';
