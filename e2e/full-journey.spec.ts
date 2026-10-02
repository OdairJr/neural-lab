import { expect, test } from '@playwright/test';
import { LabShellPage } from './page-objects';
import { LAB_SPECS } from './support/lab-data';

/**
 * V1 acceptance: the complete learning journey (task 9.2.1).
 *
 * Walks all sixteen laboratories in order, completing every stage of each one
 * and asserting the lab is marked completed before moving on. Playwright records
 * a video for this run (see `playwright.config.ts`), so the journey is the
 * artifact-level acceptance evidence for the release.
 */
test('completes the full journey across Labs 1 to 16', async ({ page }, testInfo) => {
  test.slow();
  // Walking 16 labs × 10 stages exceeds the default budget; give it headroom.
  test.setTimeout(240_000);

  const shell = new LabShellPage(page);

  for (const lab of LAB_SPECS) {
    await shell.goto(lab.slug);
    await shell.expectStageCount(10);

    await shell.completeLab(lab);

    await shell.expectProgress(100);
    await shell.expectStageCompleted('Resumo');
  }

  // The dashboard reflects the completed journey.
  await page.goto('/#/progresso');
  await expect(page.getByRole('heading', { level: 1, name: 'Progresso' })).toBeVisible();
  await expect(page.getByText('Seu aprendizado')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('full-journey.png'), fullPage: true });

  await expect
    .poll(async () => page.locator('app-progress ul').last().locator('> li').count())
    .toBe(LAB_SPECS.length);
  await expect(page.locator('app-progress ul').last()).toContainText('Concluído');
});
