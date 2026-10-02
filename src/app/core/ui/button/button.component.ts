import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '@core/utils/classnames';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

const BASE =
  'inline-flex items-center justify-center gap-2 font-medium transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90',
  secondary: 'border border-border bg-surface text-text hover:bg-bg',
  ghost: 'text-text hover:bg-surface',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 rounded-nl px-3 text-sm',
  md: 'h-10 rounded-nl px-4 text-sm',
  lg: 'h-12 rounded-nl px-6 text-base',
};

@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [class]="classes()"
      [disabled]="disabled()"
      [attr.aria-disabled]="disabled() ? 'true' : null"
    >
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<ButtonType>('button');
  readonly disabled = input(false);

  protected readonly classes = computed(() =>
    cn(BASE, VARIANTS[this.variant()], SIZES[this.size()]),
  );
}
