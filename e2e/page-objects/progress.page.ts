import { expect, type Page } from '@playwright/test';

/** Thin page object for the progress dashboard (`/#/progresso`). */
export class ProgressPage {
  constructor(private readonly page: Page) {}

  readonly heading = this.page.getByRole('heading', { level: 1, name: 'Progresso' });
  readonly overallRing = this.page.locator('app-progress-ring svg').first();
  readonly rows = this.page.locator('app-progress ul.space-y-2 > li');
  readonly exportButton = this.page.getByRole('button', { name: 'Exportar progresso' });
  readonly includeAnalytics = this.page.getByLabel('Incluir análises no arquivo');

  async goto(): Promise<void> {
    await this.page.goto('/#/progresso');
    await expect(this.heading).toBeVisible();
  }

  async overallPercent(): Promise<string | null> {
    return this.overallRing.getAttribute('aria-valuenow');
  }
}
