import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Result/violation shapes are inferred from `AxeBuilder.analyze()` so the spec
 * does not depend on the transitive `axe-core` package directly.
 */
type AnalyzeResults = Awaited<ReturnType<InstanceType<typeof AxeBuilder>['analyze']>>;
type Violation = AnalyzeResults['violations'][number];

/**
 * WCAG 2.1 A/AA tags. The roadmap requires "0 violations AA", so best-practice
 * rules are intentionally not enabled: this scan reflects the accessibility
 * standard the project committed to.
 */
const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

type ColorScheme = 'light' | 'dark';

/**
 * Expected `body` background per scheme, resolved from the `--nl-bg` token
 * (`oklch(1 0 0)` light / `oklch(0.17 0.02 265)` dark). Chromium preserves the
 * authored `oklch()` value in computed styles, so this reads back the token the
 * media query actually applied. Asserting it confirms the app honoured
 * `prefers-color-scheme` rather than silently auditing the light theme twice.
 */
const THEME_BACKGROUND: Record<ColorScheme, string> = {
  light: 'oklch(1 0 0)',
  dark: 'oklch(0.17 0.02 265)',
};

function describeViolations(violations: Violation[]): string {
  if (violations.length === 0) {
    return 'no axe violations';
  }
  return violations
    .map((violation) => {
      const nodes = violation.nodes.map((node) => node.target.join(' ')).join('\n      ');
      return `- [${violation.impact}] ${violation.id}: ${violation.help}\n      ${nodes}`;
    })
    .join('\n');
}

function describeRules(rules: AnalyzeResults['incomplete']): string {
  return rules
    .map((rule) => {
      const nodes = rule.nodes.map((node) => node.target.join(' ')).join('\n      ');
      return `- ${rule.id}: ${rule.help}\n      ${nodes}`;
    })
    .join('\n');
}

/**
 * Runs axe on the current page and fails on any WCAG 2.1 A/AA violation. The
 * returned results let callers record the exact violation count.
 */
async function audit(page: Page): Promise<AnalyzeResults> {
  return new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze();
}

async function expectNoViolations(page: Page): Promise<void> {
  const results = await audit(page);
  expect(
    results.violations,
    `axe reported ${results.violations.length} violation(s):\n${describeViolations(
      results.violations,
    )}`,
  ).toEqual([]);

  // `color-contrast` is reported as `incomplete` when axe cannot resolve a
  // background, which would let the rule silently stop evaluating. Require it to
  // actually produce a passing result. (Axe also reports `incomplete` for known
  // engine limitations that are not contrast failures — the symbol-only close
  // button and the modal overlay — so the incomplete entries are surfaced in the
  // failure message rather than asserted empty; see AUDIT_RESULTS.md.)
  const unresolvedContrast = results.incomplete.filter((rule) => rule.id === 'color-contrast');
  expect(
    results.passes.map((rule) => rule.id),
    `the color-contrast rule produced no passing result; it may have stopped evaluating.\nIncomplete entries:\n${describeRules(
      unresolvedContrast,
    )}`,
  ).toContain('color-contrast');
}

async function expectThemeApplied(page: Page, scheme: ColorScheme): Promise<void> {
  const prefersDark = await page.evaluate(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  expect(prefersDark, `the browser colour scheme is ${scheme}`).toBe(scheme === 'dark');
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
    .toBe(THEME_BACKGROUND[scheme]);
}

const STATIC_PAGES: readonly { name: string; path: string; heading: string }[] = [
  { name: 'jornada', path: '/#/jornada', heading: 'Jornada de Aprendizado' },
  { name: 'laboratórios', path: '/#/laboratorios', heading: 'Laboratórios' },
  { name: 'glossário', path: '/#/glossario', heading: 'Glossário' },
  { name: 'progresso', path: '/#/progresso', heading: 'Progresso' },
  { name: 'configurações', path: '/#/configuracoes', heading: 'Configurações' },
];

/**
 * Registers the full page/state matrix for one colour scheme. Called once per
 * scheme so light and dark are held to the same zero-violation bar.
 */
function registerAuditMatrix(scheme: ColorScheme): void {
  for (const entry of STATIC_PAGES) {
    test(`${entry.name} has zero violations`, async ({ page }) => {
      await page.goto(entry.path);
      await expect(page.getByRole('heading', { level: 1, name: entry.heading })).toBeVisible();
      await expectThemeApplied(page, scheme);

      await expectNoViolations(page);
    });
  }

  test('lab shell has zero violations', async ({ page }) => {
    await page.goto('/#/lab/01-fundamentos-de-tensores');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Fundamentos de Tensores',
    );
    await expectThemeApplied(page, scheme);

    await expectNoViolations(page);
  });

  test('glossary detail modal opened from a lab has zero violations', async ({ page }) => {
    await page.goto('/#/lab/01-fundamentos-de-tensores?stage=contextualizacao');
    await expectThemeApplied(page, scheme);

    const inlineLink = page
      .locator('app-markdown-stage a[href^="#/glossario?concept="]')
      .first();
    await inlineLink.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('API do TensorFlow.js');

    await expectNoViolations(page);
  });

  test('lab experiment stage with the "Por baixo dos panos" panel open has zero violations', async ({
    page,
  }) => {
    await page.goto('/#/lab/01-fundamentos-de-tensores?stage=experimentacao');
    await expectThemeApplied(page, scheme);

    const toggle = page.getByRole('button', { name: 'Por baixo dos panos' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('region', { name: 'Por baixo dos panos' })).toBeVisible();

    await expectNoViolations(page);
  });
}

test.describe('axe-core accessibility audit (WCAG 2.1 A/AA) — light', () => {
  test.use({ colorScheme: 'light' });
  registerAuditMatrix('light');
});

test.describe('axe-core accessibility audit (WCAG 2.1 A/AA) — dark', () => {
  test.use({ colorScheme: 'dark' });
  registerAuditMatrix('dark');
});
