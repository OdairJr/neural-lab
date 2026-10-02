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
  await expect(page.locator('app-stage-navigator button')).toHaveCount(10);

  const ring = page.locator('app-progress-ring svg');
  await expect(ring).toHaveAttribute('aria-valuenow', '0');

  await page.getByRole('button', { name: 'Marcar etapa como concluída' }).first().click();

  await expect(ring).toHaveAttribute('aria-valuenow', '10');
  await expect(page.locator('app-stage-navigator')).toContainText('Concluída');
});

test('shows a not-found message for an unknown lab slug', async ({ page }) => {
  await page.goto('/#/lab/99-nao-existe');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Laboratório não encontrado' }),
  ).toBeVisible();
});

test('loads a phase-2 lab with its ten stages', async ({ page }) => {
  await page.goto('/#/lab/03-operacoes-elemento-a-elemento');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Operações Elemento a Elemento',
  );
  await expect(page.locator('app-stage-navigator button')).toHaveCount(10);
});

test('loads the phase-4 neuron lab with its ten stages', async ({ page }) => {
  await page.goto('/#/lab/11-o-neuronio');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('O Neurônio');
  await expect(page.locator('app-stage-navigator button')).toHaveCount(10);
});

test('loads the phase-4 classification lab with its ten stages', async ({ page }) => {
  await page.goto('/#/lab/14-classificacao-e-fronteiras-de-decisao');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Classificação e Fronteiras de Decisão',
  );
  await expect(page.locator('app-stage-navigator button')).toHaveCount(10);
});

/** A valid 1×1 transparent PNG, embedded so the test needs no fixture file. */
const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

test('loads the phase-5 images lab and turns an uploaded image into a tensor', async ({
  page,
}) => {
  await page.goto('/#/lab/15-imagens-como-tensores?stage=experimentacao');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Imagens como Tensores',
  );
  await expect(page.locator('app-stage-navigator button')).toHaveCount(10);

  await expect(page.getByText('exemplo-gradient · 16×16')).toBeVisible();
  await expect(page.getByText('shape [16, 16, 3]').first()).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({
    name: 'pixel.png',
    mimeType: 'image/png',
    buffer: PIXEL_PNG,
  });

  await expect(page.getByText('pixel.png · 1×1')).toBeVisible();
  await expect(page.getByText('shape [16, 16, 3]').first()).toBeVisible();
});

test('runs the phase-5 memory lab and reflects real memory growth and recovery', async ({
  page,
}) => {
  await page.goto('/#/lab/16-gerenciamento-de-memoria?stage=experimentacao');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Gerenciamento de Memória',
  );
  await expect(page.locator('app-stage-navigator button')).toHaveCount(10);

  await expect(page.locator('app-memory-timeline canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Ver tabela de dados' }).click();

  const rows = page.locator('app-memory-timeline tbody tr');
  const tensorCounts = page.locator('app-memory-timeline tbody tr td:nth-child(3)');

  // The default "leak" strategy streams one accumulating snapshot per round.
  await expect(rows).toHaveCount(10, { timeout: 10_000 });
  const firstLeak = Number((await tensorCounts.first().textContent())?.trim());
  const lastLeak = Number((await tensorCounts.last().textContent())?.trim());
  expect(lastLeak).toBeGreaterThan(firstLeak);

  // Switching to tf.tidy keeps the live tensor count flat across rounds.
  await page.getByLabel('Estratégia').selectOption({ label: 'Corrigido (tf.tidy)' });
  await expect
    .poll(
      async () => {
        const values = (await tensorCounts.allTextContents()).map((value) => Number(value.trim()));
        return values.length === 10 && values[0] === values[values.length - 1];
      },
      { timeout: 10_000 },
    )
    .toBe(true);
});
