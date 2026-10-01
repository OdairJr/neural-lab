import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { StageType } from '@domain/content';
import { BadgeComponent } from '@core/ui';
import { STAGE_TYPE_LABELS } from './stage-contract';

/**
 * Common frame for every base stage: renders the stage title/type badge, the
 * projected stage body and an optional completion button that emits when the
 * learner marks the stage as done.
 */
@Component({
  selector: 'app-stage-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
  template: `
    <section class="space-y-4">
      <header class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-xl font-semibold">{{ title() }}</h2>
        <app-badge variant="info">{{ stageLabel() }}</app-badge>
      </header>

      <div>
        <ng-content />
      </div>

      @if (canComplete()) {
        <footer class="border-t border-border pt-4">
          <button
            type="button"
            class="inline-flex h-10 items-center rounded-nl bg-primary px-4 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            (click)="complete.emit()"
          >
            {{ completionLabel() }}
          </button>
        </footer>
      }
    </section>
  `,
})
export class StageLayoutComponent {
  readonly title = input.required<string>();
  readonly type = input.required<StageType>();
  readonly canComplete = input(true);
  readonly completionLabel = input('Marcar etapa como concluída');
  readonly complete = output<void>();

  protected stageLabel(): string {
    return STAGE_TYPE_LABELS[this.type()];
  }
}
