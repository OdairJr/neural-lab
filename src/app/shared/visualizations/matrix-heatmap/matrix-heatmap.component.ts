import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import type { VisualizationConfig, VisualizationData } from '@domain/content';
import { VisualizationTableComponent } from '../visualization-table.component';
import { VisualizationInteraction } from '../visualization-contract';

/** Maps a value within [min, max] to a blue sequential background colour. */
export function heatmapColor(value: number, min: number, max: number): string {
  const ratio = max === min ? 0.5 : (value - min) / (max - min);
  const clamped = Math.max(0, Math.min(1, ratio));
  const lightness = 96 - clamped * 60;
  return `hsl(222 70% ${lightness}%)`;
}

/**
 * Renders a numeric matrix as a labelled heatmap with per-cell hover values
 * and a data-table alternative.
 */
@Component({
  selector: 'app-matrix-heatmap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VisualizationTableComponent],
  template: `
    @if (matrix(); as current) {
      <figure class="space-y-3">
        @if (current.title) {
          <figcaption class="text-xs text-text/70">{{ current.title }}</figcaption>
        }
        <div class="overflow-x-auto">
          <div
            role="grid"
            [attr.aria-label]="ariaLabel()"
            class="inline-grid gap-1"
            [style.grid-template-columns]="'auto repeat(' + current.columns + ', minmax(2.5rem, 1fr))'"
          >
            @if (current.columnLabels.length > 0) {
              <div role="row" class="contents">
                <span role="columnheader"></span>
                @for (label of current.columnLabels; track $index) {
                  <span role="columnheader" class="px-1 text-center text-xs font-medium text-text/70">
                    {{ label }}
                  </span>
                }
              </div>
            }
            @for (row of current.matrix; track $index) {
              <div role="row" class="contents">
                @if (current.rowLabels.length > $index) {
                  <span role="rowheader" class="pr-2 text-right text-xs font-medium text-text/70">
                    {{ current.rowLabels[$index] }}
                  </span>
                } @else {
                  <span role="rowheader"></span>
                }
                @for (value of row; track $index) {
                  <span
                    role="gridcell"
                    tabindex="0"
                    [style.background-color]="color(value)"
                    [title]="'Valor: ' + value"
                    [attr.aria-label]="'Valor: ' + value"
                    class="flex h-9 items-center justify-center rounded-nl border border-border font-mono text-xs text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
                    (mouseenter)="interaction.emit({ type: 'hover', detail: value })"
                    (focus)="interaction.emit({ type: 'hover', detail: value })"
                  >
                    {{ value }}
                  </span>
                }
              </div>
            }
          </div>
        </div>

        <button
          type="button"
          class="text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
          [attr.aria-expanded]="showTable()"
          (click)="showTable.set(!showTable())"
        >
          {{ showTable() ? 'Ocultar tabela de dados' : 'Ver tabela de dados' }}
        </button>

        @if (showTable()) {
          <app-visualization-table
            caption="Valores da matriz"
            [columns]="tableColumns()"
            [rows]="tableRows()"
          />
        }
      </figure>
    } @else {
      <p class="text-sm text-text/70">Sem dados de matriz para exibir.</p>
    }
  `,
})
export class MatrixHeatmapComponent {
  readonly data = input<VisualizationData>();
  readonly config = input<VisualizationConfig>();
  readonly interaction = output<VisualizationInteraction>();

  protected readonly showTable = signal(false);

  protected readonly matrixData = computed(() => {
    const data = this.data();
    return data?.type === 'matrix-heatmap' ? data : null;
  });

  protected readonly ariaLabel = computed(
    () => this.config()?.accessibility.ariaLabel ?? 'Mapa de calor',
  );

  protected readonly matrix = computed(() => {
    const data = this.matrixData();
    if (!data || data.matrix.length === 0) {
      return null;
    }
    const columns = Math.max(...data.matrix.map((row) => row.length));
    const flat = data.matrix.flat();
    const min = flat.length > 0 ? Math.min(...flat) : 0;
    const max = flat.length > 0 ? Math.max(...flat) : 0;
    return {
      matrix: data.matrix,
      columns,
      min,
      max,
      rowLabels: data.rowLabels ?? [],
      columnLabels: data.columnLabels ?? [],
      title: data.title,
    };
  });

  protected color(value: number): string {
    const current = this.matrix();
    return current ? heatmapColor(value, current.min, current.max) : '';
  }

  protected readonly tableColumns = computed(() => {
    const current = this.matrix();
    if (!current) {
      return [];
    }
    return ['Linha', 'Coluna', 'Valor'];
  });

  protected readonly tableRows = computed(() => {
    const current = this.matrix();
    if (!current) {
      return [];
    }
    const rows: (string | number)[][] = [];
    current.matrix.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        rows.push([rowIndex, columnIndex, value]);
      });
    });
    return rows;
  });
}
