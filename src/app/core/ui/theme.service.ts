import { DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '@core/data';
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY, type ThemePreference } from './theme';

/**
 * Persists and applies the user's theme preference.
 *
 * `system` removes the `data-theme` attribute (falling back to the
 * `prefers-color-scheme` media query); explicit values set `data-theme` on
 * the document root so CSS variables switch immediately.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(LocalStorageService);
  private readonly preferenceSignal = signal<ThemePreference>(this.readStoredPreference());

  readonly preference = this.preferenceSignal.asReadonly();

  constructor() {
    this.applyPreference(this.preferenceSignal());
  }

  /** Sets, persists and applies a new preference. */
  setPreference(preference: ThemePreference): void {
    this.preferenceSignal.set(preference);
    this.storage.write(THEME_STORAGE_KEY, preference, { debounceMs: 0 });
    this.applyPreference(preference);
  }

  private applyPreference(preference: ThemePreference): void {
    const root = this.document.documentElement;
    if (preference === 'system') {
      root.removeAttribute(THEME_ATTRIBUTE);
    } else {
      root.setAttribute(THEME_ATTRIBUTE, preference);
    }
  }

  private readStoredPreference(): ThemePreference {
    const stored = this.storage.read<ThemePreference>(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  }
}
