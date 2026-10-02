import { expect, type Page } from '@playwright/test';

/** Thin page object for the laboratory catalog (`/#/laboratorios`). */
export class CatalogPage {
  constructor(private readonly page: Page) {}

  readonly heading = this.page.getByRole('heading', { level: 1, name: 'Laboratórios' });
  readonly searchInput = this.page.locator('#catalog-search');
  readonly categorySelect = this.page.locator('#catalog-category');
  readonly results = this.page.locator('app-catalog ul > li');

  async goto(): Promise<void> {
    await this.page.goto('/#/laboratorios');
    await expect(this.heading).toBeVisible();
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
  }
}
