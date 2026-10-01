import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import type { StageConfig } from '@domain/content';
import { ConceptRegistry } from '../concepts/concept-registry.service';
import type { LabRuntimeService } from '../runtime/lab-runtime.service';
import { StageLayoutComponent } from './stage-layout.component';
import { StageCompletionEvent } from './stage-contract';

/** Renders a concept definition resolved from the `ConceptRegistry`. */
@Component({
  selector: 'app-concept-card-stage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StageLayoutComponent],
  template: `
    <app-stage-layout [title]="config().title" [type]="config().type" (complete)="complete()">
      @if (concept(); as current) {
        <article class="space-y-4">
          <header>
            <h3 class="text-lg font-semibold">{{ current.title }}</h3>
            <p class="text-sm text-text/80">{{ current.shortDefinition }}</p>
          </header>

          <p class="text-sm leading-relaxed text-text/90">{{ current.fullDefinition }}</p>

          @if (current.visualAnalogy) {
            <p class="rounded-nl border border-border bg-surface p-3 text-sm">
              <span class="font-medium">Analogia: </span>{{ current.visualAnalogy }}
            </p>
          }

          @if (current.mathematicalNotation) {
            <p class="font-mono text-sm">{{ current.mathematicalNotation }}</p>
          }

          @if (current.tfjsApi.length > 0) {
            <div class="flex flex-wrap gap-2">
              @for (api of current.tfjsApi; track api) {
                <code class="rounded-nl bg-surface px-2 py-1 font-mono text-xs">{{ api }}</code>
              }
            </div>
          }
        </article>
      } @else {
        <p class="text-sm text-text/70">
          Conceito "{{ conceptId() }}" ainda não foi definido.
        </p>
      }
    </app-stage-layout>
  `,
})
export class ConceptCardStageComponent {
  readonly config = input.required<StageConfig>();
  readonly stageIndex = input(0);
  readonly runtime = input.required<LabRuntimeService>();
  readonly stageComplete = output<StageCompletionEvent>();

  private readonly registry = inject(ConceptRegistry);

  protected readonly conceptId = computed(() => {
    const value = this.config().config?.['conceptId'];
    return typeof value === 'string' ? value : '';
  });

  protected readonly concept = computed(() => this.registry.get(this.conceptId()));

  protected complete(): void {
    this.stageComplete.emit({ type: this.config().type, index: this.stageIndex() });
  }
}
