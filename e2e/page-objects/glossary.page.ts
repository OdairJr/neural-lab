import { expect, type Page } from '@playwright/test';

/** Thin page object for the glossary (`/#/glossario`). */
export class GlossaryPage {
  constructor(private readonly page: Page) {}

  readonly heading = this.page.getByRole('heading', { level: 1, name: 'Glossário' });
  readonly searchInput = this.page.getByLabel('Buscar termo');
  readonly terms = this.page.getByRole('list', { name: 'Termos do glossário' });
  readonly detail = this.page.locator('app-concept-detail');

  async goto(conceptId?: string): Promise<void> {
    const query = conceptId ? `?concept=${conceptId}` : '';
    await this.page.goto(`/#/glossario${query}`);
    await expect(this.heading).toBeVisible();
  }
}
