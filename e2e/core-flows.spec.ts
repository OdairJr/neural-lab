import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { findLabSpec } from './support/lab-data';
import { waitForPersistedStages } from './support/progress-storage';
import { LabShellPage, ProgressPage, SettingsPage } from './page-objects';

/**
 * Core end-to-end flows required by the V1 verification milestone: completing
 * Lab 1 and Lab 9, the progress export/import roundtrip, theme switching and
 * the reduced-motion preference. Keyboard navigation and the axe audit live in
 * `keyboard.spec.ts` and `accessibility.spec.ts` respectively.
 */

test('completes Lab 1 (tensors) and marks it completed', async ({ page }, testInfo) => {
  const lab = findLabSpec('01-fundamentos-de-tensores');
  const shell = new LabShellPage(page);

  await shell.goto(lab.slug);
  await shell.expectStageCount(10);
  await shell.expectProgress(0);

  await shell.completeLab(lab);

  await shell.expectProgress(100);
  await shell.expectStageCompleted('Resumo');
  await page.screenshot({ path: testInfo.outputPath('lab-01-complete.png'), fullPage: true });

  // The dashboard reflects the completed laboratory.
  const progress = new ProgressPage(page);
  await progress.goto();
  await expect(progress.rows.first()).toContainText('Concluído');
});

test('completes Lab 9 (regressão linear) including the experiment stage', async ({
  page,
}, testInfo) => {
  const lab = findLabSpec('09-regressao-linear');
  const shell = new LabShellPage(page);

  await shell.goto(lab.slug, 'experimentacao');
  await shell.expectStageCount(10);

  // The interactive fit renders its scatter plot with the regression line.
  await expect(page.locator('app-experiment-stage app-scatter-plot canvas')).toBeVisible();

  await shell.completeCurrentStage('experimentacao', lab.challenge);
  await shell.expectProgress(10);
  await page.screenshot({ path: testInfo.outputPath('lab-09-experiment.png'), fullPage: true });

  // Finish the remaining stages from the top and confirm the lab is completed.
  await shell.completeLab(lab);
  await shell.expectProgress(100);
  await shell.expectStageCompleted('Resumo');
});

test('exports and re-imports progress without losing data', async ({ page }, testInfo) => {
  const lab = findLabSpec('01-fundamentos-de-tensores');
  const shell = new LabShellPage(page);
  const settings = new SettingsPage(page);

  // Create some progress to export.
  await shell.goto(lab.slug);
  await shell.completeCurrentStage('contextualizacao', lab.challenge);
  await shell.expectProgress(10);
  await waitForPersistedStages(page, lab.id, 1);

  await settings.goto();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    settings.exportButton.click(),
  ]);
  const filePath = await download.path();
  const exported = await readFile(filePath as string, 'utf8');
  expect(exported).toContain('lab-01-tensors');
  expect(exported).toContain('"completedStages"');

  // Reset clears the progress.
  page.once('dialog', (dialog) => dialog.accept());
  await settings.resetButton.click();
  await expect(settings.message).toHaveText('Progresso apagado.');

  await shell.goto(lab.slug);
  await shell.expectProgress(0);

  // Import restores the exported progress.
  await settings.goto();
  await settings.importInput.setInputFiles({
    name: 'neural-lab-progress.json',
    mimeType: 'application/json',
    buffer: Buffer.from(exported, 'utf8'),
  });
  await expect(settings.message).toHaveText('Progresso importado com sucesso.');
  await page.screenshot({ path: testInfo.outputPath('progress-imported.png'), fullPage: true });

  await shell.goto(lab.slug);
  await shell.expectProgress(10);
  await shell.expectStageCompleted('Contextualização');
});

test('toggles light/dark/system theme and persists the preference', async ({ page }) => {
  const settings = new SettingsPage(page);
  const html = page.locator('html');

  await settings.goto();

  await settings.darkTheme.check();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
    .toBe('oklch(0.17 0.02 265)');

  // The preference survives a reload.
  await page.reload();
  await expect(settings.heading).toBeVisible();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(settings.darkTheme).toBeChecked();

  await settings.lightTheme.check();
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
    .toBe('oklch(1 0 0)');

  // `system` removes the explicit override and follows the OS query.
  await settings.systemTheme.check();
  await expect(html).not.toHaveAttribute('data-theme');
});

test('honours the reduced-motion preference and persists it', async ({ page }) => {
  const settings = new SettingsPage(page);
  const html = page.locator('html');

  await settings.goto();
  await settings.reducedMotion.check();
  await expect(html).toHaveAttribute('data-reduced-motion', 'true');

  await page.reload();
  await expect(settings.heading).toBeVisible();
  await expect(html).toHaveAttribute('data-reduced-motion', 'true');
  await expect(settings.reducedMotion).toBeChecked();

  await settings.reducedMotion.uncheck();
  await expect(html).not.toHaveAttribute('data-reduced-motion');
});
