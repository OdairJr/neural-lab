import { expect, test } from '@playwright/test';

test('redirects the root route to the learning journey', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('NeuralLab');
  await expect(page).toHaveURL(/#\/jornada$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Jornada de Aprendizado' }),
  ).toBeVisible();
  await expect(page.locator('app-journey ol > li')).toHaveCount(16);
});

test('navigates between primary sections', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Glossário' }).click();

  await expect(page).toHaveURL(/#\/glossario$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Glossário' })).toBeVisible();
});
