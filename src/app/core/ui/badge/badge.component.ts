import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '@core/utils/classnames';

export type BadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: 'bg-surface text-text border-border',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-amber-100 text-amber-900 border-amber-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
};

@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="classes()"><ng-content /></span>`,
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('neutral');

  protected readonly classes = computed(() =>
    cn(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
      VARIANTS[this.variant()],
    ),
  );
}
