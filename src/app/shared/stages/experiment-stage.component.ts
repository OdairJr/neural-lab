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
import { debounceTime } from 'rxjs';
import type {
  ExperimentConfig,
  ParameterConfig,
  StageConfig,
  VisualizationConfig,
  VisualizationData,
} from '@domain/content';
import { VisualizationRegistry } from '../visualizations/visualization-registry.service';
import { ExperimentRegistry, type ExperimentFn } from '../experiments/experiment-registry';
import type { LabRuntimeService } from '../runtime/lab-runtime.service';
import { StageLayoutComponent } from './stage-layout.component';
import { StageCompletionEvent } from './stage-contract';

interface ControlEntry {
  parameter: ParameterConfig;
  control: FormControl;
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

  protected readonly form = signal<FormGroup>(new FormGroup({}));
  protected readonly controlEntries = signal<ControlEntry[]>([]);
  protected readonly experimentData = signal<VisualizationData | null>(null);
  protected readonly unavailable = signal(false);
  private completed = false;

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
      control: new FormControl(parameterDefault(parameter)),
    }));
    const form = new FormGroup(
      Object.fromEntries(entries.map((entry) => [entry.parameter.name, entry.control])),
    );
    this.controlEntries.set(entries);
    this.form.set(form);

    const saved = this.runtime().getExperimentState(EXPERIMENT_STAGE_TYPE);
    if (saved && typeof saved === 'object') {
      form.patchValue(saved as Record<string, unknown>);
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

    const result = fn(params, this.runtime());
    if (result.visualizationData) {
      this.experimentData.set(result.visualizationData);
    }
    if (result.tensors && result.tensors.length > 0) {
      this.runtime().publishComputation(experiment.experimentFnId, {
        inputs: result.tensors,
        code: result.codeSnippet,
      });
    }
    this.runtime().setExperimentState(EXPERIMENT_STAGE_TYPE, params);

    if (!this.completed) {
      this.completed = true;
      this.stageComplete.emit({ type: this.config().type, index: this.stageIndex(), success: true });
    }
  }
}
