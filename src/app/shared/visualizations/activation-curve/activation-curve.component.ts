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
} from '@angular/core';
import type { VisualizationConfig, VisualizationData } from '@domain/content';
import { VisualizationTableComponent } from '../visualization-table.component';
import { VisualizationInteraction } from '../visualization-contract';
import { activationSeries, sampleRange, type ActivationFunction } from './activation-functions';

const RANGE_PRESETS: readonly [number, number][] = [
  [-1, 1],
  [-2, 2],
  [-5, 5],
  [-10, 10],
];

/**
 * Plots the four activation functions with an adjustable x-range and a
 * derivative toggle. Values are computed by the shared pure helpers so the
 * curves match the mathematical definitions.
 */
@Component({
  selector: 'app-activation-curve',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VisualizationTableComponent],
  template: `
    @if (curveData(); as current) {
      <figure class="space-y-3">
        <figcaption class="text-xs text-text/70">
          Função de ativação: <span class="font-mono">{{ current.fn }}</span>
        </figcaption>

        <div class="flex flex-wrap items-end gap-3">
          <label class="flex flex-col gap-1 text-xs">
            <span>Intervalo de x</span>
            <select
              [value]="rangeKey()"
              (change)="onRangeChange($event)"
              class="h-8 rounded-nl border border-border bg-surface px-2 text-xs focus-visible:outline-2 focus-visible:outline-primary"
            >
              @for (preset of rangePresets; track preset.join('-')) {
                <option [value]="preset.join(',')">[{{ preset[0] }}, {{ preset[1] }}]</option>
              }
            </select>
          </label>

          <label class="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              [checked]="showDerivative()"
              (change)="onDerivativeToggle($event)"
              class="accent-primary"
            />
            Mostrar derivada
          </label>
        </div>

        <canvas
          #canvas
          role="img"
          [attr.aria-label]="ariaLabel()"
          class="h-64 w-full rounded-nl border border-border bg-bg"
        ></canvas>

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
            caption="Valores da função"
            [columns]="tableColumns()"
            [rows]="tableRows()"
          />
        }
      </figure>
    } @else {
      <p class="text-sm text-text/70">Sem dados de ativação para exibir.</p>
    }
  `,
})
export class ActivationCurveComponent {
  readonly data = input<VisualizationData>();
  readonly config = input<VisualizationConfig>();
  readonly interaction = output<VisualizationInteraction>();

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly rangePresets = RANGE_PRESETS;
  protected readonly showTable = signal(false);
  protected readonly selectedRange = signal<readonly [number, number] | null>(null);
  protected readonly derivativeOverride = signal<boolean | null>(null);

  protected readonly curveData = computed(() => {
    const data = this.data();
    return data?.type === 'activation-curve' ? data : null;
  });

  protected readonly ariaLabel = computed(
    () => this.config()?.accessibility.ariaLabel ?? 'Curva de ativação',
  );

  protected readonly activeRange = computed<readonly [number, number]>(() => {
    const selected = this.selectedRange();
    if (selected) {
      return selected;
    }
    const data = this.curveData();
    return data?.xRange ?? [-5, 5];
  });

  protected readonly rangeKey = computed(() => this.activeRange().join(','));

  protected readonly showDerivative = computed(
    () => this.derivativeOverride() ?? this.curveData()?.showDerivative ?? false,
  );

  protected readonly curve = computed(() => {
    const data = this.curveData();
    if (!data) {
      return null;
    }
    const [min, max] = this.activeRange();
    const xs = sampleRange(min, max, 121);
    const { values, derivatives } = activationSeries(data.fn as ActivationFunction, xs);
    return { fn: data.fn, xs, values, derivatives };
  });

  constructor() {
    effect(() => {
      const curve = this.curve();
      if (curve) {
        this.draw(curve.xs, curve.values, curve.derivatives, this.showDerivative());
      }
    });
  }

  protected onRangeChange(event: Event): void {
    const [min, max] = (event.target as HTMLSelectElement).value.split(',').map(Number);
    this.selectedRange.set([min, max]);
    this.interaction.emit({ type: 'parameter-change', detail: { xRange: [min, max] } });
  }

  protected onDerivativeToggle(event: Event): void {
    this.derivativeOverride.set((event.target as HTMLInputElement).checked);
  }

  protected readonly tableColumns = computed(() =>
    this.showDerivative() ? ['x', 'f(x)', "f'(x)"] : ['x', 'f(x)'],
  );

  protected readonly tableRows = computed(() => {
    const data = this.curveData();
    if (!data) {
      return [];
    }
    const [min, max] = this.activeRange();
    const xs = sampleRange(min, max, 11);
    const { values, derivatives } = activationSeries(data.fn as ActivationFunction, xs);
    return xs.map((x, index) =>
      this.showDerivative()
        ? [round(x), round(values[index]), round(derivatives[index])]
        : [round(x), round(values[index])],
    );
  });

  private draw(
    xs: readonly number[],
    values: readonly number[],
    derivatives: readonly number[],
    showDerivative: boolean,
  ): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas || typeof canvas.getContext !== 'function') {
      return;
    }
    let context: CanvasRenderingContext2D | null = null;
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

    const plotted = showDerivative ? [...values, ...derivatives] : [...values];
    const yMin = Math.min(...plotted, 0);
    const yMax = Math.max(...plotted, 1);
    const ySpan = yMax - yMin || 1;
    const xMin = xs[0];
    const xMax = xs[xs.length - 1] || 1;
    const xSpan = xMax - xMin || 1;

    const toX = (x: number): number => ((x - xMin) / xSpan) * width;
    const toY = (y: number): number => height - ((y - yMin) / ySpan) * height;

    context.strokeStyle = '#94a3b8';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, toY(0));
    context.lineTo(width, toY(0));
    context.stroke();

    const strokeSeries = (series: readonly number[], color: string): void => {
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.beginPath();
      series.forEach((value, index) => {
        const px = toX(xs[index]);
        const py = toY(value);
        if (index === 0) {
          context.moveTo(px, py);
        } else {
          context.lineTo(px, py);
        }
      });
      context.stroke();
    };

    strokeSeries(values, '#6366f1');
    if (showDerivative) {
      strokeSeries(derivatives, '#f97316');
    }
  }
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
