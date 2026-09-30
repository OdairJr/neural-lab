import { expect, test } from '@playwright/test';

test('application loads and renders the root component', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('NeuralLab');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hello, neural-lab');
});