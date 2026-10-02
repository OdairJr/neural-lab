import { expect, type Page } from '@playwright/test';

/** Thin page object for settings (`/#/configuracoes`). */
export class SettingsPage {
  constructor(private readonly page: Page) {}

  readonly heading = this.page.getByRole('heading', { level: 1, name: 'Configurações' });
  readonly lightTheme = this.page.getByRole('radio', { name: 'Claro' });
  readonly darkTheme = this.page.getByRole('radio', { name: 'Escuro' });
  readonly systemTheme = this.page.getByRole('radio', { name: 'Sistema' });
  readonly reducedMotion = this.page.getByLabel('Reduzir animações');
  readonly exportButton = this.page.getByRole('button', { name: 'Exportar', exact: true });
  readonly resetButton = this.page.getByRole('button', { name: 'Apagar todo o progresso' });
  readonly importInput = this.page.locator('#progress-import');
  readonly message = this.page.locator('app-settings [role="status"]');

  async goto(): Promise<void> {
    await this.page.goto('/#/configuracoes');
    await expect(this.heading).toBeVisible();
  }
}
