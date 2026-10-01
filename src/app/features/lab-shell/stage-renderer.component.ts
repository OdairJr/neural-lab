import {
  ChangeDetectionStrategy,
  Component,
  ViewContainerRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { inputBinding, outputBinding } from '@angular/core';
import type { StageConfig } from '@domain/content';
import { ComponentRegistry } from '@shared/stages/component-registry.service';
import type { StageCompletionEvent } from '@shared/stages/stage-contract';
import type { LabRuntimeService } from '@shared/runtime/lab-runtime.service';

/**
 * Dynamically renders the component registered for a stage's `component` key
 * and forwards its `config`, `stageIndex`, `runtime` inputs and
 * `stageComplete` output.
 */
@Component({
  selector: 'app-stage-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container #host />
    @if (missing(); as key) {
      <p class="text-sm text-red-700">Componente de etapa não registrado: "{{ key }}".</p>
    }
  `,
})
export class StageRendererComponent {
  readonly config = input.required<StageConfig>();
  readonly stageIndex = input(0);
  readonly runtime = input.required<LabRuntimeService>();
  readonly stageComplete = output<StageCompletionEvent>();

  private readonly registry = inject(ComponentRegistry);
  private readonly host = viewChild('host', { read: ViewContainerRef });

  protected readonly missing = signal<string | null>(null);

  constructor() {
    effect(() => {
      const config = this.config();
      const viewContainer = this.host();
      const runtime = this.runtime();
      const stageIndex = this.stageIndex();

      if (!viewContainer) {
        return;
      }

      viewContainer.clear();
      const componentType = this.registry.resolve(config.component);
      if (!componentType) {
        this.missing.set(config.component);
        return;
      }
      this.missing.set(null);

      viewContainer.createComponent(componentType, {
        bindings: [
          inputBinding('config', () => config),
          inputBinding('stageIndex', () => stageIndex),
          inputBinding('runtime', () => runtime),
          outputBinding<StageCompletionEvent>('stageComplete', (event) =>
            this.stageComplete.emit(event),
          ),
        ],
      });
    });
  }
}
