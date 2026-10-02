import { expect, type Locator, type Page } from '@playwright/test';

/** Thin page object for the learning journey (`/#/jornada`). */
export class JourneyPage {
  constructor(private readonly page: Page) {}

  readonly heading = this.page.getByRole('heading', { level: 1, name: 'Jornada de Aprendizado' });
  readonly labItems = this.page.locator('app-journey ol > li');

  async goto(): Promise<void> {
    await this.page.goto('/#/jornada');
    await expect(this.heading).toBeVisible();
  }

  labLink(title: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(title) });
  }
}
