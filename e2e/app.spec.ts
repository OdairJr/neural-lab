import { readFile } from 'node:fs/promises';
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

test('searches the glossary and opens a concept entry', async ({ page }) => {
  await page.goto('/#/glossario');

  await expect(page.getByRole('heading', { level: 1, name: 'Glossário' })).toBeVisible();

  const terms = page.getByRole('list', { name: 'Termos do glossário' });
  await expect(terms).toContainText('Gradiente');

  // Search filters the A-Z list in real time.
  await page.getByLabel('Buscar termo').fill('tensor');
  await expect(terms).toContainText('Tensor');
  await expect(terms).not.toContainText('Gradiente');

  await terms.getByRole('button', { name: /^Tensor/ }).first().click();

  const detail = page.locator('app-concept-detail');
  await expect(detail).toBeVisible();
  await expect(detail).toContainText('Fórmula');
  await expect(detail).toContainText('API do TensorFlow.js');
  await expect(detail).toContainText('Ver também');
  await expect(detail).toContainText('Laboratórios relacionados');
});

test('deep-links to a glossary concept entry', async ({ page }) => {
  await page.goto('/#/glossario?concept=tensor');

  const detail = page.locator('app-concept-detail');
  await expect(detail).toBeVisible();
  await expect(detail).toContainText('Tensor');
  await expect(detail).toContainText('Fórmula');
});

test('opens the glossary modal from an inline concept link in a lab', async ({ page }) => {
  await page.goto('/#/lab/01-fundamentos-de-tensores?stage=contextualizacao');

  const inlineLink = page
    .locator('app-markdown-stage a[href^="#/glossario?concept="]')
    .first();
  await expect(inlineLink).toBeVisible();
  await inlineLink.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('API do TensorFlow.js');

  await page.getByRole('button', { name: 'Voltar ao laboratório' }).click();
  await expect(dialog).toBeHidden();
});

test('shows the progress dashboard with the 12-dimension mastery radar', async ({ page }) => {
  // Complete one stage so the dashboard has data to reflect.
  await page.goto('/#/lab/01-fundamentos-de-tensores?stage=contextualizacao');
  await page.getByRole('button', { name: 'Marcar etapa como concluída' }).first().click();

  await page.goto('/#/progresso');

  await expect(page.getByRole('heading', { level: 1, name: 'Progresso' })).toBeVisible();
  await expect(page.getByText('Seu aprendizado')).toBeVisible();
  await expect(page.locator('app-concept-mastery-radar canvas')).toBeVisible();
  await expect(page.getByRole('list').last().locator('> li')).toHaveCount(16);

  // The radar's accessible alternative exposes exactly the 12 spec dimensions.
  await page.getByRole('button', { name: 'Ver tabela de dados' }).click();
  const rows = page.locator('app-concept-mastery-radar tbody tr');
  await expect(rows).toHaveCount(12);
  await expect(rows.first()).toContainText('Tensors');
  await expect(rows.last()).toContainText('Memory');
});

test('includes analytics in the exported progress only when opted in', async ({ page }) => {
  await page.goto('/#/progresso');

  const exportButton = page.getByRole('button', { name: 'Exportar progresso' });
  const downloadText = async () => {
    const [download] = await Promise.all([page.waitForEvent('download'), exportButton.click()]);
    const path = await download.path();
    return readFile(path as string, 'utf8');
  };

  expect(await downloadText()).not.toContain('"analytics"');

  await page.getByLabel('Incluir análises no arquivo').check();
  expect(await downloadText()).toContain('"analytics"');
});
