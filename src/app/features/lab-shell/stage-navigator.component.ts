import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { StageConfig, StageType } from '@domain/content';
import { STAGE_TYPE_LABELS } from '@shared/stages/stage-contract';

const STAGE_ICONS: Record<StageType, string> = {
  contextualizacao: '🌍',
  conceito: '💡',
  analogia: '🔁',
  'exemplo-visual': '📊',
  demonstracao: '🧪',
  experimentacao: '🎛️',
  desafio: '🏆',
  explicacao: '📖',
  codigo: '⌨️',
  resumo: '✅',
};

/**
 * Sidebar stage navigator. Completed and current stages are clickable; stages
 * that come after the first incomplete stage are locked.
 */
@Component({
  selector: 'app-stage-navigator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Navegação de etapas">
      <ol class="space-y-1">
        @for (stage of stages(); track $index) {
          <li>
            <button
              type="button"
              [disabled]="!isUnlocked($index)"
              [attr.aria-current]="isCurrent($index) ? 'step' : null"
              [class]="buttonClasses($index)"
              (click)="select($index)"
            >
              <span aria-hidden="true">{{ icon(stage.type) }}</span>
              <span class="flex-1 text-left">{{ label(stage.type) }}</span>
              <span class="text-[10px] uppercase tracking-wide">{{ status($index) }}</span>
            </button>
          </li>
        }
      </ol>
    </nav>
  `,
})
export class StageNavigatorComponent {
  readonly stages = input.required<readonly StageConfig[]>();
  readonly completedStages = input<readonly string[]>([]);
  readonly currentIndex = input(0);
  readonly firstIncompleteIndex = input(0);
  readonly navigate = output<number>();

  protected label(type: StageType): string {
    return STAGE_TYPE_LABELS[type];
  }

  protected icon(type: StageType): string {
    return STAGE_ICONS[type];
  }

  protected isCompleted(index: number): boolean {
    const stage = this.stages()[index];
    return stage ? this.completedStages().includes(stage.type) : false;
  }

  protected isUnlocked(index: number): boolean {
    return index <= this.firstIncompleteIndex();
  }

  protected isCurrent(index: number): boolean {
    return index === this.currentIndex();
  }

  protected status(index: number): string {
    if (this.isCompleted(index)) {
      return 'Concluída';
    }
    if (this.isCurrent(index)) {
      return 'Atual';
    }
    return this.isUnlocked(index) ? 'Aberta' : 'Bloqueada';
  }

  protected buttonClasses(index: number): string {
    const base =
      'flex w-full items-center gap-2 rounded-nl px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50';
    if (this.isCurrent(index)) {
      return `${base} bg-primary text-on-primary`;
    }
    if (this.isCompleted(index)) {
      return `${base} bg-green-50 text-green-800`;
    }
    return `${base} text-text hover:bg-surface`;
  }

  protected select(index: number): void {
    if (this.isUnlocked(index)) {
      this.navigate.emit(index);
    }
  }
}
