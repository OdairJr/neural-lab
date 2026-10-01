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
import { Chart, registerables, type ChartConfiguration } from 'chart.js';
import type { LineChartData, VisualizationConfig, VisualizationData } from '@domain/content';
import { VisualizationTableComponent } from '../visualization-table.component';
import { VisualizationInteraction } from '../visualization-contract';
import { useReducedMotion } from '../use-reduced-motion';

Chart.register(...registerables);

const PALETTE = ['#6366f1', '#f97316', '#10b981', '#ef4444', '#0ea5e9', '#a855f7'];

/**
 * Multi-series line chart backed by Chart.js. Instances are destroyed on
 * component teardown and updates skip animation when reduced motion is on.
 */
@Component({
  selector: 'app-line-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VisualizationTableComponent],
  template: `
    @if (lineData(); as current) {
      <figure class="space-y-3">
        @if (current.title) {
          <figcaption class="text-xs text-text/70">{{ current.title }}</figcaption>
        }
        <div class="relative h-64 w-full">
          <canvas #canvas role="img" [attr.aria-label]="ariaLabel()"></canvas>
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
            caption="Séries do gráfico"
            [columns]="tableColumns()"
            [rows]="tableRows()"
          />
        }
      </figure>
    } @else {
      <p class="text-sm text-text/70">Sem dados de gráfico para exibir.</p>
    }
  `,
})
export class LineChartComponent implements OnDestroy {
  readonly data = input<VisualizationData>();
  readonly config = input<VisualizationConfig>();
  readonly interaction = output<VisualizationInteraction>();

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly reducedMotion = useReducedMotion();
  private chart: Chart | null = null;

  protected readonly showTable = signal(false);

  protected readonly lineData = computed(() => {
    const data = this.data();
    return data?.type === 'line-chart' ? data : null;
  });

  protected readonly ariaLabel = computed(
    () => this.config()?.accessibility.ariaLabel ?? 'Gráfico de linhas',
  );

  constructor() {
    effect(() => {
      const data = this.lineData();
      if (data) {
        this.render(data);
      }
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }

  protected readonly tableColumns = computed(() => {
    const data = this.lineData();
    return data ? ['Índice', ...data.series.map((series) => series.label)] : [];
  });

  protected readonly tableRows = computed(() => {
    const data = this.lineData();
    if (!data) {
      return [];
    }
    const length = Math.max(0, ...data.series.map((series) => series.data.length));
    return Array.from({ length }, (_, index) => [
      data.xLabels?.[index] ?? index,
      ...data.series.map((series) => series.data[index] ?? ''),
    ]);
  });

  private render(data: LineChartData): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas || typeof canvas.getContext !== 'function') {
      return;
    }

    const labels = data.xLabels ?? data.series[0]?.data.map((_, index) => String(index)) ?? [];
    const datasets = data.series.map((series, index) => ({
      label: series.label,
      data: series.data,
      borderColor: series.color ?? PALETTE[index % PALETTE.length],
      backgroundColor: series.color ?? PALETTE[index % PALETTE.length],
      tension: 0.25,
      pointRadius: 2,
    }));

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets = datasets;
      this.chart.update(this.reducedMotion() ? 'none' : undefined);
      return;
    }

    try {
      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: this.reducedMotion() ? false : undefined,
          plugins: {
            legend: { display: data.series.length > 1 },
            tooltip: { enabled: true },
          },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: false },
          },
        },
      };
      this.chart = new Chart(canvas, config);
      this.chart.canvas.addEventListener('click', () => {
        this.interaction.emit({ type: 'click' });
      });
    } catch (error) {
      // jsdom does not implement canvas rendering; the data-table alternative
      // remains available so the component degrades gracefully.
      console.warn('[NeuralLab] Unable to render line chart.', error);
    }
  }
}
