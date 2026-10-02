import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '@core/data';
import { ProgressMigrator } from './progress-migrator';
import {
  ANALYTICS_EVENT_LIMIT,
  createDefaultProgress,
  createLabProgress,
  type AnalyticsEvent,
  type AnalyticsEventType,
  type LabProgress,
  type ProgressState,
  type UserSettings,
} from './progress.types';

/** localStorage key required by the technical architecture spec. */
export const PROGRESS_STORAGE_KEY = 'neural-lab:v1:progress';

/**
 * Signal-based source of truth for learning progress.
 *
 * Mutations update the signal synchronously (so the UI reacts immediately)
 * and schedule a debounced write through `LocalStorageService`.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly storage = inject(LocalStorageService);
  private readonly migrator = inject(ProgressMigrator);

  private readonly state = signal<ProgressState>(this.load());

  readonly progress = this.state.asReadonly();

  /** Read-only view of the local analytics events (oldest first). */
  readonly analytics = computed(() => this.state().analytics);

  readonly completedLabIds = computed(
    () => new Set(this.state().labs.filter((lab) => lab.status === 'completed').map((lab) => lab.labId)),
  );

  readonly completedLabCount = computed(() => this.completedLabIds().size);

  /** Returns the persisted progress for a lab, if any. */
  getLabProgress(labId: string): LabProgress | undefined {
    return this.state().labs.find((lab) => lab.labId === labId);
  }

  /** Applies an immutable mutation and schedules a debounced save. */
  update(mutator: (state: ProgressState) => ProgressState): void {
    this.state.update((current) => ({
      ...mutator(current),
      lastUpdated: new Date().toISOString(),
    }));
    this.persist();
  }

  /** Creates or updates a single lab's progress. */
  updateLab(labId: string, mutator: (lab: LabProgress) => LabProgress): void {
    this.update((state) => {
      const existing = state.labs.find((lab) => lab.labId === labId) ?? createLabProgress(labId);
      const updated = mutator(existing);
      const labs = state.labs.some((lab) => lab.labId === labId)
        ? state.labs.map((lab) => (lab.labId === labId ? updated : lab))
        : [...state.labs, updated];
      return { ...state, labs };
    });
  }

  /**
   * Appends an analytics event, dropping the oldest entries beyond
   * `ANALYTICS_EVENT_LIMIT` so the localStorage quota is respected.
   */
  recordAnalytics(eventType: AnalyticsEventType, payload?: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      eventType,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.update((state) => ({
      ...state,
      analytics: [...state.analytics, event].slice(-ANALYTICS_EVENT_LIMIT),
    }));
  }

  /** Records that a glossary concept was viewed (list + analytics event). */
  recordGlossaryView(conceptId: string): void {
    if (!this.state().glossaryViews.includes(conceptId)) {
      this.update((state) => ({ ...state, glossaryViews: [...state.glossaryViews, conceptId] }));
    }
    this.recordAnalytics('glossary-viewed', { conceptId });
  }

  /** Marks a lab as started/visited and records the matching analytics event. */
  markLabStarted(labId: string): void {
    const now = new Date().toISOString();
    this.updateLab(labId, (lab) => ({
      ...lab,
      status: lab.status === 'not-started' ? 'in-progress' : lab.status,
      lastVisitedAt: now,
    }));
    this.recordAnalytics('lab-started', { labId });
  }

  /** Accumulates elapsed time for a lab (no-op for non-positive deltas). */
  addLabTime(labId: string, elapsedMs: number): void {
    if (elapsedMs <= 0) {
      return;
    }
    const now = new Date().toISOString();
    this.updateLab(labId, (lab) => ({
      ...lab,
      timeSpentMs: lab.timeSpentMs + elapsedMs,
      lastVisitedAt: now,
    }));
  }

  /** Immutably updates the user settings (preferences). */
  updateSettings(mutator: (settings: UserSettings) => UserSettings): void {
    this.update((state) => ({ ...state, settings: mutator(state.settings) }));
  }

  /**
   * Serializes the current progress as a pretty-printed JSON document.
   * Analytics are only included when the user opted in (`includeAnalyticsInExport`).
   */
  exportToJson(): string {
    const state = this.state();
    if (state.settings.includeAnalyticsInExport) {
      return JSON.stringify(state, null, 2);
    }
    const { version, lastUpdated, labs, glossaryViews, settings } = state;
    return JSON.stringify({ version, lastUpdated, labs, glossaryViews, settings }, null, 2);
  }

  /**
   * Replaces progress with the contents of a JSON document. Throws when the
   * document is not valid JSON; otherwise migrates it to the current schema.
   */
  importFromJson(json: string): ProgressState {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error('O arquivo de progresso não contém um JSON válido.');
    }

    const migrated = this.migrator.migrate(parsed);
    this.state.set(migrated);
    this.storage.write(PROGRESS_STORAGE_KEY, migrated, { debounceMs: 0 });
    return migrated;
  }

  /** Resets all progress to defaults and persists immediately. */
  reset(): void {
    const defaults = createDefaultProgress();
    this.state.set(defaults);
    this.storage.write(PROGRESS_STORAGE_KEY, defaults, { debounceMs: 0 });
  }

  private load(): ProgressState {
    return this.migrator.migrate(this.storage.read<unknown>(PROGRESS_STORAGE_KEY));
  }

  private persist(): void {
    this.storage.write(PROGRESS_STORAGE_KEY, this.state());
  }
}
