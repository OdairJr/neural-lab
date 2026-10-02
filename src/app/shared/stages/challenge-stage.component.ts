import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import type { StageConfig } from '@domain/content';
import { CodeBlockComponent } from '@core/ui';
import type { LabRuntimeService } from '../runtime/lab-runtime.service';
import { StageLayoutComponent } from './stage-layout.component';
import { StageCompletionEvent } from './stage-contract';
import { validateChallenge, type ChallengeInput, type ChallengeResult } from '../challenges/challenge-validator';

/**
 * Challenge stage supporting parameter-match, tensor-value and
 * multiple-choice (plus code-output/free-form) validation, progressive hints
 * and attempt tracking.
 */
@Component({
  selector: 'app-challenge-stage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlockComponent, StageLayoutComponent],
  template: `
    <app-stage-layout
      [title]="config().title"
      [type]="config().type"
      [canComplete]="false"
    >
      <div class="space-y-4">
        @if (validation(); as current) {
          <p class="text-sm text-text/80">Resolva o desafio para concluir esta etapa.</p>

          @if (current.prompt) {
            <p class="whitespace-pre-line text-sm text-text/90">{{ current.prompt }}</p>
          }

          @if (config().codeTemplate; as codeTemplate) {
            <app-code-block [code]="codeTemplate" />
          }

          @switch (current.type) {
            @case ('multiple-choice') {
              <fieldset class="space-y-2">
                <legend class="text-sm font-medium">Escolha uma opção</legend>
                @for (option of current.criteria.options; track option.id) {
                  <label class="flex items-center gap-2 text-sm">
                    <input
                      [type]="current.criteria.multiple ? 'checkbox' : 'radio'"
                      [name]="'challenge-option'"
                      [value]="option.id"
                      [checked]="isSelected(option.id)"
                      (change)="onOptionChange(option.id, $event)"
                      class="accent-primary"
                    />
                    {{ option.label }}
                  </label>
                }
              </fieldset>
            }
            @case ('parameter-match') {
              <div class="grid gap-3 sm:grid-cols-2">
                @for (entry of parameterEntries(); track entry[0]) {
                  <label class="flex flex-col gap-1 text-sm">
                    <span class="text-xs font-medium text-text/70">{{ entry[0] }}</span>
                    <input
                      [type]="isNumberTarget(entry[1]) ? 'number' : 'text'"
                      [value]="parameterValues()[entry[0]] ?? ''"
                      (input)="onParameterInput(entry[0], $event)"
                      class="h-10 rounded-nl border border-border bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary"
                    />
                  </label>
                }
              </div>
            }
            @case ('tensor-value') {
              <div class="space-y-3">
                <label class="flex flex-col gap-1 text-sm">
                  <span class="text-xs font-medium text-text/70">Shape (separado por vírgulas)</span>
                  <input
                    type="text"
                    [value]="tensorShape()"
                    (input)="onTensorShapeInput($event)"
                    placeholder="ex.: 2, 2"
                    class="h-10 rounded-nl border border-border bg-surface px-3 font-mono text-sm focus-visible:outline-2 focus-visible:outline-primary"
                  />
                </label>
                <label class="flex flex-col gap-1 text-sm">
                  <span class="text-xs font-medium text-text/70">Valores (separados por vírgulas)</span>
                  <textarea
                    [value]="tensorValues()"
                    (input)="onTensorValuesInput($event)"
                    rows="2"
                    placeholder="ex.: 1, 2, 3, 4"
                    class="rounded-nl border border-border bg-surface px-3 py-2 font-mono text-sm focus-visible:outline-2 focus-visible:outline-primary"
                  ></textarea>
                </label>
              </div>
            }
            @case ('code-output') {
              <label class="flex flex-col gap-1 text-sm">
                <span class="text-xs font-medium text-text/70">Saída do código</span>
                <input
                  type="text"
                  [value]="codeOutput()"
                  (input)="onCodeOutputInput($event)"
                  class="h-10 rounded-nl border border-border bg-surface px-3 font-mono text-sm focus-visible:outline-2 focus-visible:outline-primary"
                />
              </label>
            }
            @case ('free-form') {
              <label class="flex flex-col gap-1 text-sm">
                <span class="text-xs font-medium text-text/70">Sua resposta</span>
                <textarea
                  [value]="freeFormAnswer()"
                  (input)="onFreeFormInput($event)"
                  rows="3"
                  class="rounded-nl border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary"
                ></textarea>
              </label>
            }
          }

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex h-10 items-center rounded-nl bg-primary px-4 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              (click)="submit()"
            >
              Verificar resposta
            </button>
            <span class="text-xs text-text/60">Tentativas: {{ attempts() }}</span>
          </div>

          @if (result(); as outcome) {
            <p
              role="status"
              [class]="outcome.valid ? 'text-sm font-medium text-green-700' : 'text-sm font-medium text-red-700'"
            >
              {{ outcome.message }}
            </p>
          }

          @if (hint(); as currentHint) {
            <p class="rounded-nl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <span class="font-medium">Dica: </span>{{ currentHint }}
            </p>
          }
        } @else {
          <p class="text-sm text-text/70">Desafio sem configuração de validação.</p>
        }
      </div>
    </app-stage-layout>
  `,
})
export class ChallengeStageComponent {
  readonly config = input.required<StageConfig>();
  readonly stageIndex = input(0);
  readonly runtime = input.required<LabRuntimeService>();
  readonly stageComplete = output<StageCompletionEvent>();

  protected readonly attempts = signal(0);
  protected readonly result = signal<ChallengeResult | null>(null);
  protected readonly parameterValues = signal<Record<string, unknown>>({});
  protected readonly selectedOptionIds = signal<string[]>([]);
  protected readonly tensorShape = signal('');
  protected readonly tensorValues = signal('');
  protected readonly codeOutput = signal('');
  protected readonly freeFormAnswer = signal('');

  protected readonly validation = computed(() => this.config().validation ?? null);

  protected readonly parameterEntries = computed(() => {
    const validation = this.validation();
    return validation?.type === 'parameter-match'
      ? Object.entries(validation.criteria.target)
      : [];
  });

  protected readonly hint = computed(() => {
    const validation = this.validation();
    const outcome = this.result();
    if (!validation || !outcome || outcome.valid) {
      return null;
    }
    const hints = validation.hints ?? [];
    if (hints.length === 0) {
      return null;
    }
    const index = Math.min(this.attempts() - 1, hints.length - 1);
    return hints[index] ?? null;
  });

  protected isSelected(optionId: string): boolean {
    return this.selectedOptionIds().includes(optionId);
  }

  /** Numeric targets get a numeric input; string enum targets get a text input. */
  protected isNumberTarget(expected: unknown): boolean {
    return typeof expected === 'number';
  }

  protected onOptionChange(optionId: string, event: Event): void {
    const validation = this.validation();
    const checked = (event.target as HTMLInputElement).checked;
    const multiple = validation?.type === 'multiple-choice' && validation.criteria.multiple === true;

    if (multiple) {
      this.selectedOptionIds.update((current) =>
        checked ? [...current, optionId] : current.filter((id) => id !== optionId),
      );
    } else {
      this.selectedOptionIds.set(checked ? [optionId] : []);
    }
  }

  protected onParameterInput(key: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.parameterValues.update((current) => ({ ...current, [key]: value }));
  }

  protected onTensorShapeInput(event: Event): void {
    this.tensorShape.set((event.target as HTMLInputElement).value);
  }

  protected onTensorValuesInput(event: Event): void {
    this.tensorValues.set((event.target as HTMLTextAreaElement).value);
  }

  protected onCodeOutputInput(event: Event): void {
    this.codeOutput.set((event.target as HTMLInputElement).value);
  }

  protected onFreeFormInput(event: Event): void {
    this.freeFormAnswer.set((event.target as HTMLTextAreaElement).value);
  }

  protected submit(): void {
    const validation = this.validation();
    if (!validation) {
      return;
    }
    const outcome = validateChallenge(validation, this.buildInput(validation.type));
    this.attempts.update((count) => count + 1);
    this.result.set(outcome);

    if (outcome.valid) {
      this.stageComplete.emit({
        type: this.config().type,
        index: this.stageIndex(),
        success: true,
      });
    }
  }

  private buildInput(type: string): ChallengeInput {
    switch (type) {
      case 'parameter-match':
        return { kind: 'parameter-match', params: this.parameterValues() };
      case 'tensor-value': {
        const values = this.tensorValues()
          .split(/[\s,]+/)
          .filter(Boolean)
          .map(Number);
        const shape = this.tensorShape()
          .split(/[\s,]+/)
          .filter(Boolean)
          .map(Number);
        return { kind: 'tensor-value', values, shape: shape.length > 0 ? shape : undefined };
      }
      case 'multiple-choice':
        return { kind: 'multiple-choice', selectedOptionIds: this.selectedOptionIds() };
      case 'code-output':
        return { kind: 'code-output', output: this.codeOutput() };
      default:
        return { kind: 'free-form', answer: this.freeFormAnswer() };
    }
  }
}
