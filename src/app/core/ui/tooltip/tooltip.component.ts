import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let tooltipCounter = 0;

@Component({
  selector: 'app-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="group relative inline-flex">
      <span
        [attr.aria-describedby]="tooltipId"
        tabindex="0"
        class="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ng-content />
      </span>
      <span
        [id]="tooltipId"
        role="tooltip"
        class="pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-max max-w-xs -translate-x-1/2 rounded-nl border border-border bg-surface px-2 py-1 text-xs text-text opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {{ text() }}
      </span>
    </span>
  `,
})
export class TooltipComponent {
  readonly text = input.required<string>();

  protected readonly tooltipId = `app-tooltip-${++tooltipCounter}`;
}
