import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import type { StageConfig, VisualizationConfig, VisualizationData, VisualizationType } from '@domain/content';
import { VisualizationRegistry } from '../visualizations/visualization-registry.service';
import type { LabRuntimeService } from '../runtime/lab-runtime.service';
import { StageLayoutComponent } from './stage-layout.component';
import { StageCompletionEvent } from './stage-contract';

/**
 * Wraps a registered visualization component, resolving it from
 * `VisualizationStageComponent`'s `visualizationType` + `initialData` config.
 */
@Component({
  selector: 'app-visualization-stage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet, StageLayoutComponent],
  template: `
    <app-stage-layout [title]="config().title" [type]="config().type" (complete)="complete()">
      @if (component(); as visualizationComponent) {
        <ng-container
          [ngComponentOutlet]="visualizationComponent"
          [ngComponentOutletInputs]="visualizationInputs()"
        />
      } @else {
        <p class="text-sm text-text/70">
          Visualização "{{ visualizationType() ?? 'desconhecida' }}" indisponível.
        </p>
      }
    </app-stage-layout>
  `,
})
export class VisualizationStageComponent {
  readonly config = input.required<StageConfig>();
  readonly stageIndex = input(0);
  readonly runtime = input.required<LabRuntimeService>();
  readonly stageComplete = output<StageCompletionEvent>();

  private readonly registry = inject(VisualizationRegistry);

  protected readonly visualizationType = computed<VisualizationType | null>(() => {
    const value = this.config().config?.['visualizationType'];
    return typeof value === 'string' ? (value as VisualizationType) : null;
  });

  protected readonly component = computed(() => {
    const type = this.visualizationType();
    return type ? this.registry.resolve(type) : undefined;
  });

  protected readonly visualizationInputs = computed<Record<string, unknown>>(() => {
    const type = this.visualizationType();
    const accessibility = {
      ariaLabel: this.config().title,
      dataTableAlternative: true,
      colorBlindSafe: true,
    };
    const vizConfig: VisualizationConfig = {
      type: type ?? 'tensor-grid',
      accessibility,
    };
    const data = this.config().config?.['initialData'] as VisualizationData | undefined;
    return { data, config: vizConfig };
  });

  protected complete(): void {
    this.stageComplete.emit({ type: this.config().type, index: this.stageIndex() });
  }
}
