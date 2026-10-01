import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
  type OnDestroy,
} from '@angular/core';
import type { ScatterPlotData, ScatterPoint, VisualizationConfig, VisualizationData } from '@domain/content';
import { VisualizationTableComponent } from '../visualization-table.component';
import { VisualizationInteraction } from '../visualization-contract';

const CLASS_COLORS = ['#6366f1', '#f97316', '#10b981', '#ef4444', '#0ea5e9'];

/** Returns the index of the point nearest to (x, y), or -1 when empty. */
export function nearestPointIndex(
  points: readonly ScatterPoint[],
  x: number,
  y: number,
): number {
  let best = -1;
  let bestDistance = Infinity;
  points.forEach((point, index) => {
    const distance = (point.x - x) ** 2 + (point.y - y) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

function classColor(label: string | undefined, classes: string[]): string {
  const index = label ? classes.indexOf(label) : -1;
  return CLASS_COLORS[(index < 0 ? 0 : index) % CLASS_COLORS.length];
}

/**
 * Scatter plot on a 2D canvas with class colours, an optional decision
 * boundary overlay and nearest-point hover details.
 */
@Component({
  selector: 'app-scatter-plot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VisualizationTableComponent],
  template: `
    @if (scatterData(); as current) {
      <figure class="space-y-3">
        @if (current.title) {
          <figcaption class="text-xs text-text/70">{{ current.title }}</figcaption>
        }
        <div class="relative">
          <canvas
            #canvas
            role="img"
            [attr.aria-label]="ariaLabel()"
            class="h-64 w-full rounded-nl border border-border bg-bg"
            (mousemove)="onMouseMove($event)"
            (mouseleave)="hovered.set(null)"
          ></canvas>
          @if (hovered(); as point) {
            <p
              class="pointer-events-none absolute left-2 top-2 rounded-nl border border-border bg-surface px-2 py-1 text-xs shadow"
            >
              x: {{ point.x }}, y: {{ point.y }}
              @if (point.label) {
                <span> — {{ point.label }}</span>
              }
            </p>
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
            caption="Pontos do gráfico"
            [columns]="tableColumns()"
            [rows]="tableRows()"
          />
        }
      </figure>
    } @else {
      <p class="text-sm text-text/70">Sem dados de dispersão para exibir.</p>
    }
  `,
})
export class ScatterPlotComponent implements OnDestroy {
  readonly data = input<VisualizationData>();
  readonly config = input<VisualizationConfig>();
  readonly interaction = output<VisualizationInteraction>();

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private resizeObserver: ResizeObserver | null = null;

  protected readonly showTable = signal(false);
  protected readonly hovered = signal<ScatterPoint | null>(null);

  protected readonly scatterData = computed(() => {
    const data = this.data();
    return data?.type === 'scatter-plot' ? data : null;
  });

  protected readonly ariaLabel = computed(
    () => this.config()?.accessibility.ariaLabel ?? 'Gráfico de dispersão',
  );

  protected readonly classes = computed(() => {
    const data = this.scatterData();
    if (!data) {
      return [];
    }
    return [...new Set(data.points.map((point) => point.label).filter(Boolean))] as string[];
  });

  constructor() {
    effect(() => {
      const data = this.scatterData();
      if (data) {
        this.draw(data);
      }
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  protected readonly tableColumns = computed(() => ['Classe', 'X', 'Y']);

  protected readonly tableRows = computed(() => {
    const data = this.scatterData();
    if (!data) {
      return [];
    }
    const rows: (string | number)[][] = data.points.map((point) => [
      point.label ?? '',
      point.x,
      point.y,
    ]);
    for (const line of data.lines ?? []) {
      for (const point of line.points) {
        rows.push([line.label ?? 'linha', point.x, point.y]);
      }
    }
    return rows;
  });

  protected onMouseMove(event: MouseEvent): void {
    const data = this.scatterData();
    const canvas = this.canvasRef()?.nativeElement;
    if (!data || !canvas || data.points.length === 0) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const extent = this.extent(data);
    const x = extent.xMin + ((event.clientX - rect.left) / (rect.width || 1)) * (extent.xMax - extent.xMin);
    const y = extent.yMax - ((event.clientY - rect.top) / (rect.height || 1)) * (extent.yMax - extent.yMin);
    const index = nearestPointIndex(data.points, x, y);
    if (index >= 0) {
      this.hovered.set(data.points[index]);
      this.interaction.emit({ type: 'hover', detail: data.points[index] });
    }
  }

  private extent(data: ScatterPlotData): {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  } {
    if (data.boundary) {
      const [xMin, xMax, yMin, yMax] = data.boundary.extent;
      return { xMin, xMax, yMin, yMax };
    }
    const linePoints = (data.lines ?? []).flatMap((line) => line.points);
    const xs = [...data.points.map((point) => point.x), ...linePoints.map((point) => point.x)];
    const ys = [...data.points.map((point) => point.y), ...linePoints.map((point) => point.y)];
    return {
      xMin: Math.min(...xs, 0),
      xMax: Math.max(...xs, 1),
      yMin: Math.min(...ys, 0),
      yMax: Math.max(...ys, 1),
    };
  }

  private draw(data: ScatterPlotData): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas || typeof canvas.getContext !== 'function') {
      return;
    }
    let context: CanvasRenderingContext2D | null;
    try {
      context = canvas.getContext('2d');
    } catch {
      context = null;
    }
    if (!context) {
      return;
    }

    const width = canvas.clientWidth || 320;
    const height = canvas.clientHeight || 240;
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);

    const { xMin, xMax, yMin, yMax } = this.extent(data);
    const xSpan = xMax - xMin || 1;
    const ySpan = yMax - yMin || 1;
    const toX = (x: number): number => ((x - xMin) / xSpan) * width;
    const toY = (y: number): number => height - ((y - yMin) / ySpan) * height;

    if (data.boundary) {
      const rows = data.boundary.mesh.length;
      const columns = data.boundary.mesh[0]?.length ?? 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
          const classIndex = data.boundary.mesh[r][c];
          context.fillStyle = `${classColor(String(classIndex), data.boundary.classes)}33`;
          const cellWidth = width / columns;
          const cellHeight = height / rows;
          context.fillRect(c * cellWidth, height - (r + 1) * cellHeight, cellWidth + 1, cellHeight + 1);
        }
      }
    }

    for (const point of data.points) {
      context.beginPath();
      context.arc(toX(point.x), toY(point.y), 4, 0, Math.PI * 2);
      context.fillStyle = classColor(point.label, this.classes());
      context.fill();
    }

    const lineColors = ['#111827', '#7c3aed', '#e11d48', '#059669'];
    (data.lines ?? []).forEach((line, index) => {
      if (line.points.length === 0) {
        return;
      }
      context.strokeStyle = line.color ?? lineColors[index % lineColors.length];
      context.lineWidth = 2;
      context.beginPath();
      line.points.forEach((point, pointIndex) => {
        const px = toX(point.x);
        const py = toY(point.y);
        if (pointIndex === 0) {
          context.moveTo(px, py);
        } else {
          context.lineTo(px, py);
        }
      });
      context.stroke();
    });
  }
}
