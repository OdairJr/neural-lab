import { expect, test, type Page } from '@playwright/test';

/**
 * Keyboard-only flows. Every assertion checks real focus movement through
 * `document.activeElement` rather than merely asserting that controls exist.
 */

interface ActiveElementInfo {
  tag: string;
  text: string;
  ariaLabel: string | null;
  inPrimaryNav: boolean;
  inStageNavigator: boolean;
  inStageRenderer: boolean;
  inMain: boolean;
  inDialog: boolean;
  href: string | null;
}

function activeElement(page: Page): Promise<ActiveElementInfo | null> {
  return page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element || element === document.body) {
      return null;
    }
    return {
      tag: element.tagName.toLowerCase(),
      text: (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 48),
      ariaLabel: element.getAttribute('aria-label'),
      inPrimaryNav: Boolean(element.closest('nav[aria-label="Navegação principal"]')),
      inStageNavigator: Boolean(element.closest('nav[aria-label="Navegação de etapas"]')),
      inStageRenderer: Boolean(element.closest('app-stage-renderer')),
      inMain: Boolean(element.closest('main')),
      inDialog: Boolean(element.closest('[role="dialog"]')),
      href: element.getAttribute('href'),
    };
  });
}

interface OutlineStyle {
  outlineStyle: string;
  outlineWidth: string;
  outlineColor: string;
}

/** Computed outline of the currently focused element. */
function activeOutline(page: Page): Promise<OutlineStyle> {
  return page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element || element === document.body) {
      return { outlineStyle: 'none', outlineWidth: '0px', outlineColor: '' };
    }
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      outlineColor: style.outlineColor,
    };
  });
}

/** Tabs until the focused element's text matches `label` (or the budget runs out). */
async function tabUntilText(page: Page, label: string, budget = 40): Promise<boolean> {
  for (let i = 0; i < budget; i += 1) {
    await page.keyboard.press('Tab');
    const info = await activeElement(page);
    if (info?.text === label) {
      return true;
    }
  }
  return false;
}

test('tab order reaches the primary navigation and then the main content', async ({ page }) => {
  await page.goto('/#/jornada');
  await expect(page.getByRole('heading', { level: 1, name: 'Jornada de Aprendizado' })).toBeVisible();

  const seen: ActiveElementInfo[] = [];
  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.press('Tab');
    const info = await activeElement(page);
    if (info) {
      seen.push(info);
    }
    if (seen.some((item) => item.inPrimaryNav) && seen.some((item) => item.inMain)) {
      break;
    }
  }

  const navIndex = seen.findIndex((item) => item.inPrimaryNav);
  const mainIndex = seen.findIndex((item) => item.inMain);

  expect(navIndex, 'primary navigation is reachable with Tab').toBeGreaterThanOrEqual(0);
  expect(mainIndex, 'main content is reachable with Tab').toBeGreaterThanOrEqual(0);
  expect(mainIndex, 'focus reaches the navigation before the main content').toBeGreaterThan(
    navIndex,
  );
  expect(seen[navIndex]?.href).toContain('/jornada');
});

test('glossary modal traps focus, closes with Escape and restores focus to the trigger', async ({
  page,
}) => {
  await page.goto('/#/lab/01-fundamentos-de-tensores?stage=contextualizacao');

  const trigger = page.locator('app-markdown-stage a[href^="#/glossario?concept="]').first();
  await trigger.focus();
  await expect(trigger).toBeFocused();

  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Focus moves into the dialog as soon as it opens.
  const firstFocus = await activeElement(page);
  expect(firstFocus?.inDialog, 'focus is moved into the modal on open').toBe(true);
  expect(firstFocus?.ariaLabel).toBe('Fechar');

  // Tab cycles within the dialog and never escapes it.
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press('Tab');
    const info = await activeElement(page);
    expect(info?.inDialog, `focus stays trapped after Tab #${i + 1}`).toBe(true);
  }

  // Shift+Tab from the first element wraps to the last one inside the dialog.
  await page.keyboard.press('Shift+Tab');
  const wrapped = await activeElement(page);
  expect(wrapped?.inDialog).toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  // Focus returns to the element that opened the modal.
  await expect(trigger).toBeFocused();
});

test('the "Por baixo dos panos" panel toggle is operable from the keyboard', async ({ page }) => {
  await page.goto('/#/lab/01-fundamentos-de-tensores?stage=experimentacao');

  const toggle = page.getByRole('button', { name: 'Por baixo dos panos' });
  await toggle.focus();
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('region', { name: 'Por baixo dos panos' })).toBeVisible();
  await expect(toggle).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('region', { name: 'Por baixo dos panos' })).toBeHidden();
});

test('the stage navigator is operable with the keyboard', async ({ page }) => {
  await page.goto('/#/lab/01-fundamentos-de-tensores');

  // Complete the first stage from the keyboard so the next stage unlocks.
  const completeButton = page.getByRole('button', { name: 'Marcar etapa como concluída' }).first();
  await completeButton.focus();
  await page.keyboard.press('Enter');

  const navigator = page.locator('app-stage-navigator');
  const currentStage = navigator.locator('button[aria-current="step"]');
  await expect(currentStage).toHaveCount(1);

  // Reach the second stage through the keyboard and activate it.
  const secondStage = navigator.getByRole('button', { name: /Conceito/ });
  await expect(secondStage).toBeEnabled();
  await secondStage.focus();
  await expect(secondStage).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(secondStage).toHaveAttribute('aria-current', 'step');
  await expect(currentStage).toHaveCount(1);
  await expect(secondStage).toBeFocused();
});

test('the stage footer navigation is operable with the keyboard', async ({ page }) => {
  await page.goto('/#/lab/01-fundamentos-de-tensores');

  const next = page.getByRole('button', { name: 'Próxima etapa' });
  await next.focus();
  await expect(next).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByText('Etapa 2 de 10')).toBeVisible();
  await expect(
    page.locator('app-stage-navigator button[aria-current="step"]'),
  ).toHaveCount(1);
});

test('keyboard-focused controls show a visible focus indicator', async ({ page }) => {
  await page.goto('/#/lab/01-fundamentos-de-tensores');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Reach a control with the keyboard so `:focus-visible` styles apply.
  expect(
    await tabUntilText(page, 'Por baixo dos panos'),
    'the panel toggle is reachable with Tab',
  ).toBe(true);

  const outline = await activeOutline(page);
  expect(outline.outlineStyle, 'focused control exposes an outline style').not.toBe('none');
  expect(outline.outlineWidth, 'focused control has a non-zero outline width').not.toBe('0px');
});

test('lab-shell focus order reaches the header, sidebar, main and footer controls', async ({
  page,
}) => {
  await page.goto('/#/lab/01-fundamentos-de-tensores?stage=experimentacao');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const seen: ActiveElementInfo[] = [];
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press('Tab');
    const info = await activeElement(page);
    if (info) {
      seen.push(info);
    }
  }

  const toggleIndex = seen.findIndex((item) => item.text === 'Por baixo dos panos');
  const navigatorIndex = seen.findIndex((item) => item.inStageNavigator);
  const stageIndex = seen.findIndex((item) => item.inStageRenderer);
  const footerIndex = seen.findIndex((item) => item.text === 'Próxima etapa');

  expect(toggleIndex, 'header "Por baixo dos panos" toggle is reachable').toBeGreaterThanOrEqual(0);
  expect(navigatorIndex, 'sidebar stage navigator is reachable').toBeGreaterThanOrEqual(0);
  expect(stageIndex, 'main stage content is reachable').toBeGreaterThanOrEqual(0);
  expect(footerIndex, 'footer "Próxima etapa" control is reachable').toBeGreaterThanOrEqual(0);

  expect(navigatorIndex, 'the sidebar follows the header controls').toBeGreaterThan(toggleIndex);
  expect(stageIndex, 'the stage content follows the sidebar').toBeGreaterThan(navigatorIndex);
  expect(footerIndex, 'the footer controls follow the stage content').toBeGreaterThan(stageIndex);
});
