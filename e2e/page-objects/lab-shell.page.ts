import { expect, type Locator, type Page } from '@playwright/test';
import type { ChallengeDescriptor, LabSpec } from '../support/lab-data';

const COMPLETE_BUTTON = 'Marcar etapa como concluída';
const VERIFY_BUTTON = 'Verificar resposta';
const NEXT_BUTTON = 'Próxima etapa';

export type ChallengeAnswer = 'correct' | 'wrong';

/**
 * Thin page object for the universal laboratory shell. Encapsulates the
 * selectors used across the lab E2E specs: stage navigator, progress ring,
 * challenge controls and the stage footer navigation.
 */
export class LabShellPage {
  constructor(private readonly page: Page) {}

  readonly heading = this.page.getByRole('heading', { level: 1 });
  readonly stageNavigator = this.page.locator('app-stage-navigator');
  readonly stageButtons = this.stageNavigator.locator('button');
  readonly progressRing = this.page.locator('app-progress-ring svg').first();
  readonly completeStageButton = this.page.getByRole('button', { name: COMPLETE_BUTTON });
  readonly nextStageButton = this.page.getByRole('button', { name: NEXT_BUTTON });
  readonly previousStageButton = this.page.getByRole('button', { name: 'Etapa anterior' });
  readonly stageCounter = this.page.getByText(/Etapa \d+ de \d+/);
  readonly panelToggle = this.page.getByRole('button', { name: 'Por baixo dos panos' });
  readonly challengeStatus = this.page.locator('app-challenge-stage [role="status"]');

  /** Navigates directly to a lab, optionally deep-linking to a stage type. */
  async goto(slug: string, stageType?: string): Promise<void> {
    const query = stageType ? `?stage=${stageType}` : '';
    await this.page.goto(`/#/lab/${slug}${query}`);
    await expect(this.heading).toBeVisible();
  }

  currentStageButton(): Locator {
    return this.stageNavigator.locator('button[aria-current="step"]');
  }

  async expectStageCount(count: number): Promise<void> {
    await expect(this.stageButtons).toHaveCount(count);
  }

  async expectProgress(percent: number): Promise<void> {
    await expect(this.progressRing).toHaveAttribute('aria-valuenow', String(percent));
  }

  async expectStageCompleted(label: string): Promise<void> {
    await expect(this.stageNavigator.getByRole('button', { name: new RegExp(label) })).toContainText(
      'Concluída',
    );
  }

  async nextStage(): Promise<void> {
    await this.nextStageButton.click();
  }

  /** Completes the current stage, answering the challenge when required. */
  async completeCurrentStage(
    stageType: string,
    challenge: ChallengeDescriptor,
  ): Promise<void> {
    if (stageType === 'desafio') {
      await this.answerChallenge(challenge, 'correct');
      await expect(this.challengeStatus).toHaveClass(/text-green-700/);
      return;
    }
    await this.completeStageButton.first().click();
  }

  /**
   * Walks a lab's ten stages, completing each one in order.
   *
   * It re-enters the lab at its first stage explicitly: Angular reuses the lab
   * shell when only the `?stage=` query changes, so a bare `goto(slug)` after a
   * deep link keeps the previously selected index instead of resetting to 0.
   */
  async completeLab(lab: LabSpec): Promise<void> {
    const firstStage = lab.stageTypes[0];
    await this.goto(lab.slug, firstStage);
    for (let index = 0; index < lab.stageTypes.length; index += 1) {
      const stageType = lab.stageTypes[index] ?? '';
      await this.completeCurrentStage(stageType, lab.challenge);
      if (index < lab.stageTypes.length - 1) {
        await this.nextStage();
      }
    }
  }

  /** Fills the challenge controls with either the correct or a wrong answer. */
  async answerChallenge(challenge: ChallengeDescriptor, answer: ChallengeAnswer): Promise<void> {
    const correct = answer === 'correct';

    switch (challenge.type) {
      case 'multiple-choice': {
        const options = this.page.locator('app-challenge-stage input[name="challenge-option"]');
        const wantedIds = correct
          ? challenge.correctOptionIds
          : challenge.options
              .filter((option) => !challenge.correctOptionIds.includes(option.id))
              .map((option) => option.id);
        for (const id of wantedIds) {
          const index = challenge.options.findIndex((option) => option.id === id);
          await options.nth(index).check();
        }
        break;
      }
      case 'parameter-match': {
        const entries = Object.entries(challenge.target);
        const inputs = this.page.locator('app-challenge-stage input');
        for (let index = 0; index < entries.length; index += 1) {
          const expected = entries[index]?.[1];
          await inputs.nth(index).fill(correct ? String(expected) : wrongParamValue(expected));
        }
        break;
      }
      case 'tensor-value': {
        const values = correct
          ? challenge.expectedValues
          : challenge.expectedValues.map((value) => value + 1);
        await this.page
          .locator('app-challenge-stage input[type="text"]')
          .first()
          .fill(challenge.expectedShape.join(', '));
        await this.page
          .locator('app-challenge-stage textarea')
          .first()
          .fill(values.join(', '));
        break;
      }
      case 'code-output': {
        await this.page
          .locator('app-challenge-stage input[type="text"]')
          .first()
          .fill(correct ? challenge.expectedOutput : '__resposta_errada__');
        break;
      }
      case 'free-form': {
        await this.page
          .locator('app-challenge-stage textarea')
          .first()
          .fill(correct ? challenge.requiredTerms.join(', ') : '__resposta_errada__');
        break;
      }
    }

    await this.page.getByRole('button', { name: VERIFY_BUTTON }).click();
  }
}

/** Produces a value that can never satisfy a `parameter-match` target. */
function wrongParamValue(expected: unknown): string {
  return typeof expected === 'number' ? String(expected + 1) : '__valor_errado__';
}
