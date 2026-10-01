import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '@core/utils/classnames';

@Component({
  selector: 'app-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section [class]="classes()">
      @if (heading()) {
        <header class="border-b border-border px-4 py-3">
          <h2 class="text-sm font-semibold text-text">{{ heading() }}</h2>
        </header>
      }
      <div class="p-4">
        <ng-content />
      </div>
    </section>
  `,
})
export class PanelComponent {
  readonly heading = input('');

  protected readonly classes = computed(() =>
    cn('block overflow-hidden rounded-nl border border-border bg-surface shadow-sm'),
  );
}
