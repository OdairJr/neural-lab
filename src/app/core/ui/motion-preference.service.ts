import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '@core/data';

/** localStorage key for the persisted reduced-motion preference. */
export const MOTION_STORAGE_KEY = 'neural-lab:v1:reduced-motion';

/** Attribute toggled on the document root to disable motion globally. */
export const MOTION_ATTRIBUTE = 'data-reduced-motion';

/**
 * Applies and persists the user's reduced-motion preference, independently of
 * the operating-system media query handled by `ReducedMotionMixin`.
 */
@Injectable({ providedIn: 'root' })
export class MotionPreferenceService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(LocalStorageService);
  private readonly reduced = signal(this.readStored());

  readonly reducedMotion = this.reduced.asReadonly();

  constructor() {
    this.apply(this.reduced());
  }

  setReducedMotion(value: boolean): void {
    this.reduced.set(value);
    this.storage.write(MOTION_STORAGE_KEY, value, { debounceMs: 0 });
    this.apply(value);
  }

  private apply(value: boolean): void {
    if (value) {
      this.document.documentElement.setAttribute(MOTION_ATTRIBUTE, 'true');
    } else {
      this.document.documentElement.removeAttribute(MOTION_ATTRIBUTE);
    }
  }

  private readStored(): boolean {
    return this.storage.read<boolean>(MOTION_STORAGE_KEY) === true;
  }
}
