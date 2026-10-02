import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
  type OnInit,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, debounceTime, type Subscription } from 'rxjs';
import type {
  ExperimentConfig,
  ImageParameterValue,
  ParameterConfig,
  StageConfig,
  VisualizationConfig,
  VisualizationData,
} from '@domain/content';
import { ImageLoaderService } from '@core/images';
import { VisualizationRegistry } from '../visualizations/visualization-registry.service';
import {
  ExperimentRegistry,
  type ExperimentFn,
  type ExperimentResult,
} from '../experiments/experiment-registry';
import type { LabRuntimeService } from '../runtime/lab-runtime.service';
import { StageLayoutComponent } from './stage-layout.component';
import { StageCompletionEvent } from './stage-contract';

interface ControlEntry {
  parameter: ParameterConfig;
  control: FormControl;
}

/** Lightweight, serializable summary of a loaded image (persisted with state). */
interface ImageInfo {
  name: string;
  width: number;
  height: number;
}

const EXPERIMENT_STAGE_TYPE = 'experimentacao';
const DEBOUNCE_MS = 150;

/** Resolves the default value for a parameter from its config. */
export function parameterDefault(parameter: ParameterConfig): number | string | boolean {
  if (parameter.defaultValue !== undefined) {
    return parameter.defaultValue;
  }
  if (parameter.type === 'number') {
    return parameter.min ?? 0;
  }
  if (parameter.type === 'boolean') {
    return false;
  }
  if (parameter.options && parameter.options.length > 0) {
    return parameter.options[0].value;
  }
  return '';
}

/**
 * Interactive experiment stage: builds a reactive form from the parameter
 * config, runs the lab's `experimentFn` (debounced 150ms), publishes the
 * resulting tensors to the "Under the Hood" panel and updates the live
 * visualization.
 */
@Component({
  selector: 'app-experiment-stage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet, ReactiveFormsModule, StageLayoutComponent],
  template: `
    <app-stage-layout [title]="config().title" [type]="config().type" (complete)="complete()">
      @if (experimentConfig(); as experiment) {
        <div class="grid gap-6 lg:grid-cols-2">
          <form class="space-y-3" [formGroup]="form()">
            <h3 class="text-sm font-semibold">Parâmetros</h3>
            @for (entry of controlEntries(); track entry.parameter.name) {
              <label
                class="flex flex-col gap-1 text-sm"
                [attr.for]="'param-' + entry.parameter.name"
              >
                <span class="text-xs font-medium text-text/70">{{ entry.parameter.label }}</span>

                @switch (entry.parameter.type) {
                  @case ('number') {
                    <input
                      type="number"
                      [id]="'param-' + entry.parameter.name"
                      [formControl]="entry.control"
                      [attr.min]="entry.parameter.min ?? null"
                      [attr.max]="entry.parameter.max ?? null"
                      [attr.step]="entry.parameter.step ?? null"
                      class="h-10 rounded-nl border border-border bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary"
                    />
                  }
                  @case ('boolean') {
                    <input
                      type="checkbox"
                      [id]="'param-' + entry.parameter.name"
                      [formControl]="entry.control"
                      class="accent-primary"
                    />
                  }
                  @case ('image') {
                    <input
                      type="file"
                      accept="image/*"
                      [id]="'param-' + entry.parameter.name"
                      (change)="onImageSelected(entry, $event)"
                      class="text-xs file:mr-2 file:rounded-nl file:border file:border-border file:bg-surface file:px-2 file:py-1 file:text-xs focus-visible:outline-2 focus-visible:outline-primary"
                    />
                    @if (imageInfos()[entry.parameter.name]; as info) {
                      <span class="text-xs text-text/60">
                        {{ info.name }} · {{ info.width }}×{{ info.height }}
                      </span>
                    }
                  }
                  @default {
                    @if (entry.parameter.options?.length) {
                      <select
                        [id]="'param-' + entry.parameter.name"
                        [formControl]="entry.control"
                        class="h-10 rounded-nl border border-border bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        @for (option of entry.parameter.options; track option.label) {
                          <option [ngValue]="option.value">{{ option.label }}</option>
                        }
                      </select>
                    } @else {
                      <input
                        type="text"
                        [id]="'param-' + entry.parameter.name"
                        [formControl]="entry.control"
                        class="h-10 rounded-nl border border-border bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary"
                      />
                    }
                  }
                }

                @if (entry.parameter.description) {
                  <span class="text-xs text-text/60">{{ entry.parameter.description }}</span>
                }
              </label>
            }
          </form>

          <div class="space-y-2">
            <h3 class="text-sm font-semibold">Visualização</h3>
            @if (visualizationComponent(); as visualizationComponent_1) {
              <ng-container
                [ngComponentOutlet]="visualizationComponent_1"
                [ngComponentOutletInputs]="visualizationInputs()"
              />
            } @else {
              <p class="text-sm text-text/70">Visualização indisponível.</p>
            }
          </div>
        </div>

        @if (unavailable()) {
          <p class="mt-4 rounded-nl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Nenhuma função de experimento registrada para "{{ experiment.experimentFnId }}".
          </p>
        }
      } @else {
        <p class="text-sm text-text/70">Experimentação sem configuração.</p>
      }
    </app-stage-layout>
  `,
})
export class ExperimentStageComponent implements OnInit {
  readonly config = input.required<StageConfig>();
  readonly stageIndex = input(0);
  readonly runtime = input.required<LabRuntimeService>();
  readonly stageComplete = output<StageCompletionEvent>();

  private readonly visualizationRegistry = inject(VisualizationRegistry);
  private readonly experimentRegistry = inject(ExperimentRegistry);
  private readonly destroyRef = inject(DestroyRef);
  private readonly imageLoader = inject(ImageLoaderService);

  protected readonly form = signal<FormGroup>(new FormGroup({}));
  protected readonly controlEntries = signal<ControlEntry[]>([]);
  protected readonly experimentData = signal<VisualizationData | null>(null);
  protected readonly unavailable = signal(false);
  /** Name/dimensions of the currently loaded image, keyed by parameter name. */
  protected readonly imageInfos = signal<Record<string, ImageInfo>>({});
  private completed = false;
  private streamSubscription: Subscription | null = null;

  protected readonly experimentConfig = computed<ExperimentConfig | null>(
    () => this.config().experimentConfig ?? null,
  );

  protected readonly visualizationComponent = computed(() => {
    const experiment = this.experimentConfig();
    return experiment ? this.visualizationRegistry.resolve(experiment.visualization.type) : undefined;
  });

  protected readonly visualizationInputs = computed<Record<string, unknown>>(() => {
    const experiment = this.experimentConfig();
    const accessibility = {
      ariaLabel: this.config().title,
      dataTableAlternative: true,
      colorBlindSafe: true,
    };
    const config: VisualizationConfig = experiment?.visualization ?? {
      type: 'tensor-grid',
      accessibility,
    };
    return { data: this.experimentData(), config };
  });

  ngOnInit(): void {
    const experiment = this.experimentConfig();
    if (!experiment) {
      return;
    }

    const entries: ControlEntry[] = experiment.parameters.map((parameter) => ({
      parameter,
      control: new FormControl(
        parameter.type === 'image'
          ? this.imageLoader.sampleImage()
          : parameterDefault(parameter),
      ),
    }));
    const form = new FormGroup(
      Object.fromEntries(entries.map((entry) => [entry.parameter.name, entry.control])),
    );
    this.controlEntries.set(entries);
    this.form.set(form);

    const imageInfos: Record<string, ImageInfo> = {};
    for (const entry of entries) {
      const value = entry.control.value as ImageParameterValue | null;
      if (entry.parameter.type === 'image' && value) {
        imageInfos[entry.parameter.name] = {
          name: value.name,
          width: value.width,
          height: value.height,
        };
      }
    }
    this.imageInfos.set(imageInfos);

    const saved = this.runtime().getExperimentState(EXPERIMENT_STAGE_TYPE);
    if (saved && typeof saved === 'object') {
      const patch = { ...(saved as Record<string, unknown>) };
      // Image parameters cannot be restored: their persisted form is only a
      // descriptor, so the built-in sample image stays selected.
      for (const entry of entries) {
        if (entry.parameter.type === 'image') {
          delete patch[entry.parameter.name];
        }
      }
      form.patchValue(patch);
    }

    form.valueChanges
      .pipe(debounceTime(DEBOUNCE_MS), takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.runExperiment(params));

    // Run once with the initial/saved parameters so the visualization is live.
    this.runExperiment(form.getRawValue());
  }

  protected complete(): void {
    this.stageComplete.emit({ type: this.config().type, index: this.stageIndex() });
  }

  protected async onImageSelected(entry: ControlEntry, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    try {
      const value = await this.imageLoader.loadFile(file);
      entry.control.setValue(value);
      this.imageInfos.update((infos) => ({
        ...infos,
        [entry.parameter.name]: {
          name: value.name,
          width: value.width,
          height: value.height,
        },
      }));
    } catch (error) {
      console.warn('[NeuralLab] Unable to load the selected image.', error);
    }
  }

  /**
   * Replaces image values with a lightweight descriptor before persisting, so
   * no large/non-serializable pixel buffer is stored in experiment state.
   */
  private serializableParams(params: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = { ...params };
    for (const entry of this.controlEntries()) {
      if (entry.parameter.type !== 'image') {
        continue;
      }
      const value = result[entry.parameter.name] as ImageParameterValue | undefined;
      if (value && typeof value === 'object' && 'width' in value && 'height' in value) {
        result[entry.parameter.name] = {
          name: value.name,
          width: value.width,
          height: value.height,
        } satisfies ImageInfo;
      }
    }
    return result;
  }

  private runExperiment(params: Record<string, unknown>): void {
    const experiment = this.experimentConfig();
    if (!experiment) {
      return;
    }
    const fn: ExperimentFn | undefined = this.experimentRegistry.get(experiment.experimentFnId);
    if (!fn) {
      this.unavailable.set(true);
      return;
    }
    this.unavailable.set(false);

    // Cancel a previous stream (e.g. a running training session) before the
    // next parameter-driven run starts.
    this.streamSubscription?.unsubscribe();
    this.streamSubscription = null;

    const outcome = fn(params, this.runtime());
    if (outcome instanceof Observable) {
      this.streamSubscription = outcome
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (result) => this.applyResult(experiment.experimentFnId, result),
          error: () => this.unavailable.set(true),
        });
    } else {
      this.applyResult(experiment.experimentFnId, outcome);
    }

    this.runtime().setExperimentState(EXPERIMENT_STAGE_TYPE, this.serializableParams(params));
  }

  private applyResult(operation: string, result: ExperimentResult): void {
    if (result.visualizationData) {
      this.experimentData.set(result.visualizationData);
    }
    if (result.tensors && result.tensors.length > 0) {
      this.runtime().publishComputation(operation, {
        inputs: result.tensors,
        code: result.codeSnippet,
      });
    }

    if (!this.completed) {
      this.completed = true;
      this.stageComplete.emit({ type: this.config().type, index: this.stageIndex(), success: true });
    }
  }
}
