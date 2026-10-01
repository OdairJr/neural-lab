import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Accessible data-table alternative for visualizations. Every chart renders
 * one of these so the same information is available to screen readers and
 * users who cannot perceive the graphical encoding.
 */
@Component({
  selector: 'app-visualization-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-left text-xs">
        @if (caption()) {
          <caption class="pb-2 text-left text-xs text-text/70">
            {{ caption() }}
          </caption>
        }
        <thead>
          <tr>
            @for (column of columns(); track column) {
              <th scope="col" class="border-b border-border px-2 py-1 font-semibold">
                {{ column }}
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track $index) {
            <tr>
              @for (cell of row; track $index) {
                <td class="border-b border-border/60 px-2 py-1 font-mono">{{ cell }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class VisualizationTableComponent {
  readonly caption = input('');
  readonly columns = input.required<readonly string[]>();
  readonly rows = input.required<readonly (readonly (string | number)[])[]>();
}
