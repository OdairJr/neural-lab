import type { Page } from '@playwright/test';

/** localStorage key required by the technical architecture spec. */
const PROGRESS_STORAGE_KEY = 'neural-lab:v1:progress';

/**
 * Waits until the debounced localStorage write has persisted at least
 * `minCount` completed stages for `labId`. Polling the real storage avoids the
 * flakiness of a fixed timeout before a reload.
 */
export async function waitForPersistedStages(
  page: Page,
  labId: string,
  minCount: number,
): Promise<void> {
  await page.waitForFunction(
    ({ key, labId: id, minCount: count }) => {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return false;
      }
      try {
        const parsed = JSON.parse(raw) as {
          labs?: { labId?: string; completedStages?: string[] }[];
        };
        const lab = parsed.labs?.find((entry) => entry.labId === id);
        return (lab?.completedStages?.length ?? 0) >= count;
      } catch {
        return false;
      }
    },
    { key: PROGRESS_STORAGE_KEY, labId, minCount },
  );
}
