import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY } from './theme';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    window.localStorage.clear();
  });

  it('defaults to system and applies no data-theme attribute', () => {
    const service = TestBed.inject(ThemeService);

    expect(service.preference()).toBe('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('applies and persists an explicit theme', () => {
    const service = TestBed.inject(ThemeService);

    service.setPreference('dark');

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(JSON.parse(window.localStorage.getItem(THEME_STORAGE_KEY) ?? 'null')).toBe('dark');
  });

  it('restores a persisted preference on startup', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify('dark'));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ThemeService);

    expect(service.preference()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('removes the attribute when switching back to system', () => {
    const service = TestBed.inject(ThemeService);

    service.setPreference('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    service.setPreference('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});
