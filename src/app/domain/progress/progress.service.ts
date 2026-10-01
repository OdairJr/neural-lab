import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '@core/data';
import { ProgressMigrator } from './progress-migrator';
import {
  createDefaultProgress,
  createLabProgress,
  type LabProgress,
  type ProgressState,
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

  /** Records that a glossary concept was viewed. */
  recordGlossaryView(conceptId: string): void {
    this.update((state) =>
      state.glossaryViews.includes(conceptId)
        ? state
        : { ...state, glossaryViews: [...state.glossaryViews, conceptId] },
    );
  }

  /** Serializes the current progress as a pretty-printed JSON document. */
  exportToJson(): string {
    return JSON.stringify(this.state(), null, 2);
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
