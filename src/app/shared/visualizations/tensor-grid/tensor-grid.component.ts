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

/** One rendered cell of the tensor grid. */
interface GridCell {
  value: string;
  index: number;
}

/**
 * Renders rank 1-3 tensors as a responsive grid with an optional slice
 * selector (rank 3) and a value tooltip on each cell. A data-table alternative
 * is available for assistive technology.
 */
@Component({
  selector: 'app-tensor-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VisualizationTableComponent],
  template: `
    @if (grid(); as current) {
      <figure class="space-y-3">
        <figcaption class="text-xs text-text/70">
          Tensor rank {{ current.rank }} — shape [{{ current.shape.join(', ') }}]
          @if (current.truncated) {
            <span class="ml-2 text-amber-700">valores amostrados</span>
          }
        </figcaption>

        @if (current.rank === 3 && current.sliceCount > 1) {
          <label class="flex items-center gap-2 text-xs">
            <span>Fatia</span>
            <input
              type="range"
              min="0"
              [max]="current.sliceCount - 1"
              [value]="sliceIndex()"
              (input)="onSliceInput($event)"
              class="accent-primary"
            />
            <span class="font-mono">{{ sliceIndex() }} / {{ current.sliceCount - 1 }}</span>
          </label>
        }

        <div
          role="grid"
          [attr.aria-label]="ariaLabel()"
          [attr.aria-rowcount]="current.rows.length"
          [attr.aria-colcount]="current.columns"
          class="grid w-full gap-1"
          [style.grid-template-columns]="'repeat(' + current.columns + ', minmax(0, 1fr))'"
        >
          @for (row of current.rows; track $index) {
            <div role="row" class="contents">
              @for (cell of row; track cell.index) {
                <span
                  role="gridcell"
                  tabindex="0"
                  [title]="'Índice ' + cell.index + ': ' + cell.value"
                  [attr.aria-label]="'Índice ' + cell.index + ': ' + cell.value"
                  class="truncate rounded-nl border border-border bg-bg px-1 py-2 text-center font-mono text-xs transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-primary"
                  (mouseenter)="onCellHover(cell)"
                  (focus)="onCellHover(cell)"
                >
                  {{ cell.value }}
                </span>
              }
            </div>
          }
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
            caption="Valores do tensor"
            [columns]="tableColumns()"
            [rows]="tableRows()"
          />
        }
      </figure>
    } @else {
      <p class="text-sm text-text/70">Sem dados de tensor para exibir.</p>
    }
  `,
})
export class TensorGridComponent {
  readonly data = input<VisualizationData>();
  readonly config = input<VisualizationConfig>();
  readonly interaction = output<VisualizationInteraction>();

  protected readonly showTable = signal(false);
  protected readonly sliceIndex = signal(0);

  protected readonly gridData = computed(() => {
    const data = this.data();
    return data?.type === 'tensor-grid' ? data : null;
  });

  protected readonly ariaLabel = computed(
    () => this.config()?.accessibility.ariaLabel ?? 'Grade de tensor',
  );

  protected readonly grid = computed(() => {
    const data = this.gridData();
    if (!data) {
      return null;
    }
    const { shape, values, truncated } = data.tensor;
    const rank = shape.length;
    if (rank < 1 || rank > 3) {
      return null;
    }

    const sliceCount = rank === 3 ? shape[0] : 1;
    const slice = Math.min(this.sliceIndex(), sliceCount - 1);

    let rows: GridCell[][];
    let columns: number;

    if (rank === 1) {
      columns = shape[0];
      rows = [this.buildRow(values, 0, columns)];
    } else if (rank === 2) {
      columns = shape[1];
      rows = Array.from({ length: shape[0] }, (_, r) =>
        this.buildRow(values, r * shape[1], shape[1]),
      );
    } else {
      columns = shape[2];
      const planeSize = shape[1] * shape[2];
      rows = Array.from({ length: shape[1] }, (_, r) =>
        this.buildRow(values, slice * planeSize + r * shape[2], shape[2]),
      );
    }

    return { rank, shape, truncated, rows, columns, sliceCount };
  });

  protected readonly tableColumns = computed(() =>
    this.gridData() ? ['Índice', 'Valor'] : [],
  );

  protected readonly tableRows = computed(() => {
    const data = this.gridData();
    if (!data) {
      return [];
    }
    return data.tensor.values.map((value, index) => [index, value]);
  });

  private buildRow(values: readonly number[], start: number, length: number): GridCell[] {
    return Array.from({ length }, (_, offset) => {
      const index = start + offset;
      return {
        index,
        value: index < values.length ? String(values[index]) : '…',
      };
    });
  }

  protected onSliceInput(event: Event): void {
    const index = Number((event.target as HTMLInputElement).value);
    this.sliceIndex.set(index);
    this.interaction.emit({ type: 'slice-change', detail: index });
  }

  protected onCellHover(cell: GridCell): void {
    this.interaction.emit({ type: 'hover', detail: cell });
  }
}
