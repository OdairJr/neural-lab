import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { clamp } from '@core/utils/units';

@Component({
  selector: 'app-progress-ring',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.viewBox]="viewBox()"
      role="progressbar"
      [attr.aria-valuenow]="percentage()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-label]="label() || null"
    >
      <circle
        [attr.cx]="center()"
        [attr.cy]="center()"
        [attr.r]="radius()"
        fill="none"
        stroke="currentColor"
        class="text-border"
        [attr.stroke-width]="strokeWidth()"
      />
      <circle
        [attr.cx]="center()"
        [attr.cy]="center()"
        [attr.r]="radius()"
        fill="none"
        stroke="currentColor"
        class="text-primary"
        [attr.stroke-width]="strokeWidth()"
        stroke-linecap="round"
        [attr.stroke-dasharray]="circumference()"
        [attr.stroke-dashoffset]="dashOffset()"
        [attr.transform]="rotation()"
      />
    </svg>
  `,
})
export class ProgressRingComponent {
  readonly value = input(0);
  readonly size = input(64);
  readonly strokeWidth = input(6);
  readonly label = input('');

  protected readonly percentage = computed(() => Math.round(clamp(this.value(), 0, 100)));
  protected readonly viewBox = computed(() => `0 0 ${this.size()} ${this.size()}`);
  protected readonly center = computed(() => this.size() / 2);
  protected readonly radius = computed(() => (this.size() - this.strokeWidth()) / 2);
  protected readonly circumference = computed(() => 2 * Math.PI * this.radius());
  protected readonly dashOffset = computed(
    () => this.circumference() * (1 - this.percentage() / 100),
  );
  protected readonly rotation = computed(() => `rotate(-90 ${this.center()} ${this.center()})`);
}
