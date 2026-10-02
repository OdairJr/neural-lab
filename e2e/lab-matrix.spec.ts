import { expect, test } from '@playwright/test';
import { LabShellPage } from './page-objects';
import { waitForPersistedStages } from './support/progress-storage';
import { LAB_SPECS } from './support/lab-data';

/**
 * Lab-specific acceptance matrix (task 9.1.3).
 *
 * The table is derived from the real laboratory configs (`LAB_SPECS`), so it
 * cannot drift from what the application ships. Each lab is exercised for its
 * ten stages, its experiment visualization, its challenge validation (both a
 * wrong and the correct answer) and progress persistence across a reload.
 */
for (const lab of LAB_SPECS) {
  test.describe(`${lab.number}. ${lab.title}`, () => {
    test('loads its ten stages, navigates them and completes the lab', async ({
      page,
    }, testInfo) => {
      const shell = new LabShellPage(page);

      await shell.goto(lab.slug);
      await shell.expectStageCount(10);
      await shell.expectProgress(0);

      // The stage navigator drives navigation and the counter follows it.
      await shell.nextStage();
      await expect(shell.stageCounter).toContainText('Etapa 2 de 10');
      await shell.previousStageButton.click();
      await expect(shell.stageCounter).toContainText('Etapa 1 de 10');

      // The experiment stage renders a live visualization (a real visualization
      // always exposes its accessible data-table alternative).
      await shell.goto(lab.slug, 'experimentacao');
      await expect(page.locator('app-experiment-stage')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Ver tabela de dados' }).first(),
      ).toBeVisible();

      // "Under the Hood" opens and announces its expanded state.
      await shell.panelToggle.click();
      await expect(shell.panelToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByRole('region', { name: 'Por baixo dos panos' })).toBeVisible();

      await shell.completeLab(lab);
      await shell.expectProgress(100);
      await shell.expectStageCompleted('Resumo');
      await page.screenshot({
        path: testInfo.outputPath(`lab-${lab.number}-complete.png`),
        fullPage: true,
      });
    });

    test('validates the challenge for wrong and correct answers', async ({ page }) => {
      const shell = new LabShellPage(page);

      await shell.goto(lab.slug, 'desafio');

      await shell.answerChallenge(lab.challenge, 'wrong');
      await expect(shell.challengeStatus).toHaveClass(/text-red-700/);
      await shell.expectProgress(0);

      await shell.answerChallenge(lab.challenge, 'correct');
      await expect(shell.challengeStatus).toHaveClass(/text-green-700/);
      await shell.expectStageCompleted('Desafio');
    });

    test('persists progress across a reload', async ({ page }) => {
      const shell = new LabShellPage(page);

      await shell.goto(lab.slug, 'contextualizacao');
      await shell.completeStageButton.first().click();
      await shell.expectProgress(10);
      await waitForPersistedStages(page, lab.id, 1);

      await page.reload();

      await shell.expectProgress(10);
      await shell.expectStageCompleted('Contextualização');
    });
  });
}
