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

test('renders a lab shell from a deep link and completes a stage', async ({ page }) => {
  await page.goto('/#/lab/01-fundamentos-de-tensores');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Fundamentos de Tensores',
  );
  await expect(page.locator('app-stage-navigator button')).toHaveCount(4);

  const ring = page.locator('app-progress-ring svg');
  await expect(ring).toHaveAttribute('aria-valuenow', '0');

  await page.getByRole('button', { name: 'Marcar etapa como concluída' }).first().click();

  await expect(ring).toHaveAttribute('aria-valuenow', '25');
  await expect(page.locator('app-stage-navigator')).toContainText('Concluída');
});

test('shows a not-found message for an unknown lab slug', async ({ page }) => {
  await page.goto('/#/lab/99-nao-existe');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Laboratório não encontrado' }),
  ).toBeVisible();
});
