/** User-selectable theme preference. `system` follows the OS setting. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** localStorage key for the persisted theme preference. */
export const THEME_STORAGE_KEY = 'neural-lab:v1:theme';

/** The attribute `ThemeService` toggles on the document root. */
export const THEME_ATTRIBUTE = 'data-theme';
