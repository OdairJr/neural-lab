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
import type {
  ImageTensorData,
  VisualizationConfig,
  VisualizationData,
} from '@domain/content';
import {
  grayscalePixels,
  toImageData,
  type ImageChannels,
} from '@core/images';
import { VisualizationTableComponent } from '../visualization-table.component';
import { VisualizationInteraction } from '../visualization-contract';
import { useReducedMotion } from '../use-reduced-motion';

/** Monotonic id so multiple instances on a page get distinct radio groups. */
let instanceCounter = 0;

/**
 * Side-by-side view of an image and its tensor representation: the original is
 * painted onto a canvas and the tensor's shape/values are shown as text and
 * cells. A channel toggle switches between the colour and luminance preview
 * without mutating any input, and an accessible data table carries the values.
 *
 * The canvas is optional: when `getContext` is unavailable (e.g. jsdom) the
 * component still renders the tensor readout and the data table.
 */
@Component({
  selector: 'app-image-tensor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VisualizationTableComponent],
  template: `
    @if (imageTensor(); as current) {
      <figure class="space-y-3">
        <figcaption class="text-xs text-text/70">
          Tensor de imagem — shape [{{ shapeLabel() }}] · dtype {{ current.tensor.dtype }}
        </figcaption>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1">
            <h4 class="text-xs font-semibold">Imagem original</h4>
            <canvas
              #canvas
              role="img"
              [attr.aria-label]="ariaLabel()"
              [attr.width]="current.original.width"
              [attr.height]="current.original.height"
              [style.transition]="reducedMotion() ? 'none' : null"
              class="w-full max-w-[220px] rounded-nl border border-border [image-rendering:pixelated]"
            ></canvas>
            <p class="text-xs text-text/70">
              {{ current.original.width }}×{{ current.original.height }} · canal {{ channel() }}
            </p>
          </div>

          <div class="space-y-1">
            <h4 class="text-xs font-semibold">Valores do tensor</h4>
            <p class="text-xs text-text/70">
              shape [{{ shapeLabel() }}] · {{ current.tensor.size }} valores
              @if (current.tensor.truncated) {
                <span>(amostra)</span>
              }
            </p>
            <div class="flex flex-wrap gap-1" aria-hidden="true">
              @for (value of sampleValues(); track $index) {
                <span
                  class="rounded-nl border border-border bg-bg px-1 py-0.5 font-mono text-[10px]"
                >
                  {{ value }}
                </span>
              }
            </div>
          </div>
        </div>

        <fieldset class="flex flex-wrap items-center gap-3 text-xs">
          <legend class="sr-only">Canal da imagem</legend>
          <label class="flex items-center gap-1">
            <input
              type="radio"
              [name]="radioGroupName"
              value="RGB"
              [checked]="channel() === 'RGB'"
              (change)="toggleChannel('RGB')"
              class="accent-primary"
            />
            RGB
          </label>
          <label class="flex items-center gap-1">
            <input
              type="radio"
              [name]="radioGroupName"
              value="grayscale"
              [checked]="channel() === 'grayscale'"
              (change)="toggleChannel('grayscale')"
              class="accent-primary"
            />
            Escala de cinza
          </label>
        </fieldset>

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
            caption="Valores do tensor da imagem"
            [columns]="tableColumns"
            [rows]="tableRows()"
          />
        }
      </figure>
    } @else {
      <p class="text-sm text-text/70">Sem dados de imagem para exibir.</p>
    }
  `,
})
export class ImageTensorComponent {
  readonly data = input<VisualizationData>();
  readonly config = input<VisualizationConfig>();
  readonly interaction = output<VisualizationInteraction>();

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  protected readonly reducedMotion = useReducedMotion();

  protected readonly showTable = signal(false);
  /** Unique per instance so two components never share a radio group. */
  protected readonly radioGroupName = `image-channel-${++instanceCounter}`;
  /** Manual channel choice; `null` follows the data's declared channels. */
  private readonly channelOverride = signal<ImageChannels | null>(null);

  protected readonly tableColumns: readonly string[] = ['Índice', 'Valor'];

  protected readonly imageTensor = computed(() => {
    const data = this.data();
    return data?.type === 'image-tensor' ? data : null;
  });

  protected readonly channel = computed<ImageChannels>(
    () => this.channelOverride() ?? this.imageTensor()?.channels ?? 'RGB',
  );

  protected readonly shapeLabel = computed(
    () => this.imageTensor()?.tensor.shape.join(', ') ?? '',
  );

  protected readonly sampleValues = computed(() =>
    (this.imageTensor()?.tensor.values ?? []).slice(0, 24),
  );

  protected readonly tableRows = computed(() =>
    (this.imageTensor()?.tensor.values ?? []).map((value, index) => [index, value]),
  );

  protected readonly ariaLabel = computed(
    () => this.config()?.accessibility.ariaLabel ?? 'Imagem e tensor correspondente',
  );

  constructor() {
    // Follow the data's declared channels whenever fresh data arrives.
    effect(() => {
      this.imageTensor();
      this.channelOverride.set(null);
    });

    effect(() => {
      const current = this.imageTensor();
      const channel = this.channel();
      if (current) {
        this.render(current, channel);
      }
    });
  }

  protected toggleChannel(channel: ImageChannels): void {
    this.channelOverride.set(channel);
    this.interaction.emit({ type: 'channel-change', detail: channel });
  }

  private render(data: ImageTensorData, channel: ImageChannels): void {
    const canvas = this.canvasRef()?.nativeElement;
    const context = canvas?.getContext?.('2d');
    if (!canvas || !context) {
      // jsdom (unit tests) returns null here; the readout/table still render.
      return;
    }

    try {
      const { original } = data;
      const image =
        channel === 'grayscale'
          ? toImageData({
              width: original.width,
              height: original.height,
              data: grayscalePixels(original),
            })
          : original;
      context.putImageData(image, 0, 0);
    } catch (error) {
      console.warn('[NeuralLab] Unable to draw the image tensor.', error);
    }
  }
}
