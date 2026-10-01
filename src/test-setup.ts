/**
 * Vitest global setup.
 *
 * Recent Node.js versions expose an experimental `globalThis.localStorage`
 * getter that resolves to `undefined` unless Node is started with
 * `--localstorage-file`. Vitest's jsdom environment aliases its window to
 * `globalThis`, so that Node getter shadows jsdom's own `localStorage` and
 * every persistence test would see `undefined`.
 *
 * This installs a small in-memory `Storage` implementation when no working
 * `localStorage` is available, so the storage-backed services can be tested
 * without weakening their behavior or the assertions that exercise them.
 */
class InMemoryStorage implements Storage {
  private readonly store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    const value = this.store.get(key);
    return value === undefined ? null : value;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  try {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: new InMemoryStorage(),
    });
  } catch {
    // If the environment exposes a non-configurable getter we cannot replace
    // it; storage-dependent specs will fail loudly rather than silently pass.
  }
}
