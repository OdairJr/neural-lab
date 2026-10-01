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
import type { MemoryTimelineData, VisualizationConfig, VisualizationData } from '@domain/content';
import { VisualizationTableComponent } from '../visualization-table.component';
import { VisualizationInteraction } from '../visualization-contract';
import { useReducedMotion } from '../use-reduced-motion';

Chart.register(...registerables);

/**
 * Memory usage over time with a budget reference line and hover statistics.
 * Backed by Chart.js; the instance is destroyed on teardown.
 */
@Component({
  selector: 'app-memory-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VisualizationTableComponent],
  template: `
    @if (timelineData(); as current) {
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
            caption="Uso de memória"
            [columns]="tableColumns()"
            [rows]="tableRows()"
          />
        }
      </figure>
    } @else {
      <p class="text-sm text-text/70">Sem dados de memória para exibir.</p>
    }
  `,
})
export class MemoryTimelineComponent implements OnDestroy {
  readonly data = input<VisualizationData>();
  readonly config = input<VisualizationConfig>();
  readonly interaction = output<VisualizationInteraction>();

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly reducedMotion = useReducedMotion();
  private chart: Chart | null = null;

  protected readonly showTable = signal(false);

  protected readonly timelineData = computed(() => {
    const data = this.data();
    return data?.type === 'memory-timeline' ? data : null;
  });

  protected readonly ariaLabel = computed(
    () => this.config()?.accessibility.ariaLabel ?? 'Linha do tempo de memória',
  );

  constructor() {
    effect(() => {
      const data = this.timelineData();
      if (data) {
        this.render(data);
      }
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }

  protected readonly tableColumns = computed(() => ['Momento', 'Memória (MB)', 'Tensores']);

  protected readonly tableRows = computed(() => {
    const data = this.timelineData();
    if (!data) {
      return [];
    }
    return data.snapshots.map((snapshot) => [
      new Date(snapshot.timestamp).toLocaleTimeString(),
      snapshot.usedMemoryMB,
      snapshot.tensorCount,
    ]);
  });

  private render(data: MemoryTimelineData): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas || typeof canvas.getContext !== 'function') {
      return;
    }

    const labels = data.snapshots.map((snapshot) =>
      new Date(snapshot.timestamp).toLocaleTimeString(),
    );
    const datasets: ChartConfiguration<'line'>['data']['datasets'] = [
      {
        label: 'Memória (MB)',
        data: data.snapshots.map((snapshot) => snapshot.usedMemoryMB),
        borderColor: '#6366f1',
        backgroundColor: '#6366f1',
        tension: 0.25,
        pointRadius: 3,
      },
    ];

    if (typeof data.budgetMB === 'number') {
      datasets.push({
        label: 'Orçamento (MB)',
        data: data.snapshots.map(() => data.budgetMB as number),
        borderColor: '#ef4444',
        borderDash: [6, 4],
        pointRadius: 0,
        tension: 0,
      });
    }

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets = datasets;
      this.chart.update(this.reducedMotion() ? 'none' : undefined);
      return;
    }

    try {
      this.chart = new Chart(canvas, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: this.reducedMotion() ? false : undefined,
          plugins: {
            legend: { display: datasets.length > 1 },
            tooltip: {
              callbacks: {
                afterLabel: (item) => {
                  const snapshot = data.snapshots[item.dataIndex];
                  return snapshot ? `Tensores: ${snapshot.tensorCount}` : '';
                },
              },
            },
          },
          scales: { x: { grid: { display: false } } },
        },
      });
    } catch (error) {
      console.warn('[NeuralLab] Unable to render memory timeline.', error);
    }
  }
}
