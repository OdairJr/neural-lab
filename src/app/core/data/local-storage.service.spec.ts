import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  const KEY = 'neural-lab:test:key';
  let service: LocalStorageService;

  beforeEach(() => {
    window.localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('persists values only after the debounce window', () => {
    vi.useFakeTimers();

    service.write(KEY, { value: 42 });

    expect(window.localStorage.getItem(KEY)).toBeNull();
    vi.advanceTimersByTime(499);
    expect(window.localStorage.getItem(KEY)).toBeNull();
    vi.advanceTimersByTime(1);
    expect(JSON.parse(window.localStorage.getItem(KEY) ?? 'null')).toEqual({ value: 42 });
  });

  it('coalesces rapid writes into the latest value', () => {
    vi.useFakeTimers();

    service.write(KEY, 'first');
    service.write(KEY, 'second');
    vi.advanceTimersByTime(500);

    expect(JSON.parse(window.localStorage.getItem(KEY) ?? 'null')).toBe('second');
  });

  it('reads persisted values back', () => {
    service.write(KEY, [1, 2, 3], { debounceMs: 0 });

    expect(service.read<number[]>(KEY)).toEqual([1, 2, 3]);
  });

  it('flushes pending writes immediately', () => {
    vi.useFakeTimers();

    service.write(KEY, { flushed: true });
    service.flush();

    expect(JSON.parse(window.localStorage.getItem(KEY) ?? 'null')).toEqual({ flushed: true });
  });

  it('returns null for corrupt entries', () => {
    window.localStorage.setItem(KEY, '{not json');

    expect(service.read(KEY)).toBeNull();
  });

  it('removes a key and cancels pending writes', () => {
    vi.useFakeTimers();

    service.write(KEY, 'value');
    service.remove(KEY);
    vi.advanceTimersByTime(500);

    expect(window.localStorage.getItem(KEY)).toBeNull();
  });
});
