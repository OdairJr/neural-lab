import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  signal,
  viewChild,
  type OnDestroy,
} from '@angular/core';
import { Chart, registerables, type ChartConfiguration } from 'chart.js';
import { VisualizationTableComponent } from '@shared/visualizations/visualization-table.component';
import { useReducedMotion } from '@shared/visualizations/use-reduced-motion';
import type { MasteryPoint } from './concept-mastery';

Chart.register(...registerables);

/**
 * Concept-mastery radar chart (12 dimensions). This is a dashboard-level chart
 * and is intentionally not registered in `VisualizationRegistry`: it is not one
 * of the ten lab visualization types. Animation is disabled when reduced motion
 * is on and the same values are always available as a data table.
 */
@Component({
  selector: 'app-concept-mastery-radar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VisualizationTableComponent],
  template: `
    <figure class="space-y-3">
      <div class="relative h-80 w-full">
        <canvas
          #canvas
          role="img"
          aria-label="Gráfico de radar do domínio dos 12 grupos de conceitos"
        ></canvas>
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
          caption="Domínio por grupo de conceitos (%)"
          [columns]="columns"
          [rows]="rows()"
        />
      }
    </figure>
  `,
})
export class ConceptMasteryRadarComponent implements OnDestroy {
  readonly points = input.required<readonly MasteryPoint[]>();

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly reducedMotion = useReducedMotion();
  private chart: Chart | null = null;

  protected readonly showTable = signal(false);
  protected readonly columns = ['Dimensão', 'Domínio (%)'];
  protected readonly rows = computed(() =>
    this.points().map((point) => [point.label, point.value] as const),
  );

  constructor() {
    effect(() => {
      const points = this.points();
      if (points.length > 0) {
        this.render(points);
      }
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }

  private render(points: readonly MasteryPoint[]): void {
    const canvas = this.canvasRef()?.nativeElement;
    // Require a real 2D context: jsdom provides `getContext` but returns null,
    // and Chart.js would then fail while binding its resize listeners.
    const context = canvas?.getContext?.('2d');
    if (!canvas || !context) {
      return;
    }

    const labels = points.map((point) => point.label);
    const data = points.map((point) => point.value);

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = data;
      this.chart.update(this.reducedMotion() ? 'none' : undefined);
      return;
    }

    try {
      const config: ChartConfiguration<'radar'> = {
        type: 'radar',
        data: {
          labels,
          datasets: [
            {
              label: 'Domínio (%)',
              data,
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.25)',
              pointBackgroundColor: '#6366f1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: this.reducedMotion() ? false : undefined,
          plugins: { legend: { display: false } },
          scales: {
            r: {
              suggestedMin: 0,
              suggestedMax: 100,
              ticks: { stepSize: 25 },
            },
          },
        },
      };
      this.chart = new Chart(canvas, config);
    } catch (error) {
      // jsdom does not implement canvas rendering; the data-table alternative
      // remains available so the component degrades gracefully.
      console.warn('[NeuralLab] Unable to render mastery radar chart.', error);
    }
  }
}
