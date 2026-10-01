import { DOCUMENT, inject, Injectable } from '@angular/core';

/** Default debounce window for coalesced writes. */
export const DEFAULT_WRITE_DEBOUNCE_MS = 500;

interface PendingWrite {
  timer: ReturnType<typeof setTimeout>;
  value: unknown;
}

/**
 * Thin, JSON-aware wrapper around `localStorage` with debounced writes.
 *
 * Writes are coalesced per key so rapid state changes (for example progress
 * updates while a user moves through stages) do not thrash the storage.
 * Pass `debounceMs: 0` for an immediate write.
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private readonly document = inject(DOCUMENT);
  private readonly pending = new Map<string, PendingWrite>();

  /** Reads and parses a stored value, returning `null` when absent/invalid. */
  read<T>(key: string): T | null {
    const raw = this.getStorage()?.getItem(key);
    if (raw == null) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      console.warn(`[NeuralLab] Ignoring corrupt localStorage entry for "${key}".`);
      return null;
    }
  }

  /** Writes a value, debounced per key (immediately when `debounceMs` is 0). */
  write<T>(key: string, value: T, options: { debounceMs?: number } = {}): void {
    const debounceMs = options.debounceMs ?? DEFAULT_WRITE_DEBOUNCE_MS;

    const existing = this.pending.get(key);
    if (existing) {
      clearTimeout(existing.timer);
    }

    if (debounceMs <= 0) {
      this.pending.delete(key);
      this.commit(key, value);
      return;
    }

    const timer = setTimeout(() => this.commitPending(key), debounceMs);
    this.pending.set(key, { timer, value });
  }

  /** Immediately persists any pending write for `key`, or all pending writes. */
  flush(key?: string): void {
    if (key !== undefined) {
      this.commitPending(key);
      return;
    }
    for (const pendingKey of [...this.pending.keys()]) {
      this.commitPending(pendingKey);
    }
  }

  /** Removes a key and cancels any pending write for it. */
  remove(key: string): void {
    const pending = this.pending.get(key);
    if (pending) {
      clearTimeout(pending.timer);
      this.pending.delete(key);
    }
    this.getStorage()?.removeItem(key);
  }

  private commitPending(key: string): void {
    const pending = this.pending.get(key);
    if (!pending) {
      return;
    }
    clearTimeout(pending.timer);
    this.pending.delete(key);
    this.commit(key, pending.value);
  }

  private commit(key: string, value: unknown): void {
    try {
      this.getStorage()?.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[NeuralLab] Failed to persist localStorage entry "${key}".`, error);
    }
  }

  private getStorage(): Storage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }
}
