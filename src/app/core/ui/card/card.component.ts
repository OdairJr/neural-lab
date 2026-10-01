import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '@core/utils/classnames';

@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="classes()">
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  readonly padded = input(true);

  protected readonly classes = computed(() =>
    cn('block rounded-nl border border-border bg-surface shadow-sm', this.padded() && 'p-4'),
  );
}
