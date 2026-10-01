import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import type { CodeViewMode, StageConfig } from '@domain/content';
import { CodeBlockComponent } from '@core/ui';
import type { LabRuntimeService } from '../runtime/lab-runtime.service';
import { StageLayoutComponent } from './stage-layout.component';
import { StageCompletionEvent } from './stage-contract';

const MODES: readonly { id: CodeViewMode; label: string }[] = [
  { id: 'essential', label: 'Essencial' },
  { id: 'annotated', label: 'Anotado' },
  { id: 'full', label: 'Completo' },
];

/** Code stage with essential/annotated/full view modes and copy support. */
@Component({
  selector: 'app-code-view-stage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlockComponent, StageLayoutComponent],
  template: `
    <app-stage-layout [title]="config().title" [type]="config().type" (complete)="complete()">
      <div class="space-y-3">
        <div class="flex flex-wrap gap-1" role="group" aria-label="Modo de visualização do código">
          @for (mode of modes; track mode.id) {
            <button
              type="button"
              [attr.aria-pressed]="activeMode() === mode.id"
              [class]="
                'rounded-nl px-3 py-1.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-primary ' +
                (activeMode() === mode.id
                  ? 'bg-primary text-white'
                  : 'border border-border bg-surface text-text hover:bg-bg')
              "
              (click)="activeMode.set(mode.id)"
            >
              {{ mode.label }}
            </button>
          }
        </div>

        <app-code-block [code]="code()" />
      </div>
    </app-stage-layout>
  `,
})
export class CodeViewStageComponent {
  readonly config = input.required<StageConfig>();
  readonly stageIndex = input(0);
  readonly runtime = input.required<LabRuntimeService>();
  readonly stageComplete = output<StageCompletionEvent>();

  protected readonly modes = MODES;
  protected readonly activeMode = signal<CodeViewMode>('annotated');

  protected readonly code = computed(() => {
    const stageConfig = this.config().config ?? {};
    const modeSpecific = stageConfig[this.activeMode()];
    if (typeof modeSpecific === 'string') {
      return modeSpecific;
    }
    return this.config().codeTemplate ?? '// Código será exibido aqui.';
  });

  protected complete(): void {
    this.stageComplete.emit({ type: this.config().type, index: this.stageIndex() });
  }
}
