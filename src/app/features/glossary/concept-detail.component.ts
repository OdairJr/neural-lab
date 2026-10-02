import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LAB_CATALOG } from '@content/lab-configs/lab-catalog';
import type { Concept } from '@domain/content';
import type { LabSummary } from '@domain/models/lab.model';
import { ConceptRegistry } from '@shared/concepts';

/**
 * Read-only concept entry with definition, visual analogy, formula, TF.js API
 * and cross-references. Reused by the glossary page detail view and by the
 * inline modal opened from lab content.
 *
 * Cross-references resolve lab ids to catalog entries here (a feature-layer
 * concern) so the shared concept services stay free of educational content.
 */
@Component({
  selector: 'app-concept-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (concept(); as current) {
      <article class="space-y-4">
        <header class="space-y-1">
          <h3 class="text-lg font-semibold">{{ current.title }}</h3>
          <p class="text-sm text-text/80">{{ current.shortDefinition }}</p>
        </header>

        <p class="text-sm leading-relaxed text-text/90">{{ current.fullDefinition }}</p>

        @if (current.visualAnalogy) {
          <figure class="rounded-nl border border-border bg-bg p-3">
            <figcaption class="text-xs font-semibold text-text/70">
              Visual / analogia
            </figcaption>
            <p class="mt-1 text-sm text-text/90">{{ current.visualAnalogy }}</p>
          </figure>
        }

        @if (current.mathematicalNotation) {
          <div>
            <h4 class="text-xs font-semibold text-text/70">Fórmula</h4>
            <code
              class="mt-1 block overflow-x-auto rounded-nl bg-surface px-2 py-1 font-mono text-xs"
            >
              {{ current.mathematicalNotation }}
            </code>
          </div>
        }

        @if (current.tfjsApi.length > 0) {
          <div>
            <h4 class="text-xs font-semibold text-text/70">API do TensorFlow.js</h4>
            <ul class="mt-1 flex flex-wrap gap-2">
              @for (api of current.tfjsApi; track api) {
                <li class="rounded-nl bg-surface px-2 py-1 font-mono text-xs">{{ api }}</li>
              }
            </ul>
          </div>
        }

        @if (related().length > 0) {
          <section>
            <h4 class="text-xs font-semibold text-text/70">Ver também</h4>
            <ul class="mt-1 flex flex-wrap gap-2">
              @for (item of related(); track item.id) {
                <li>
                  <button
                    type="button"
                    class="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    (click)="selectConcept.emit(item.id)"
                  >
                    {{ item.title }}
                  </button>
                </li>
              }
            </ul>
          </section>
        }

        @if (relatedLabs().length > 0) {
          <section>
            <h4 class="text-xs font-semibold text-text/70">Laboratórios relacionados</h4>
            <ul class="mt-1 space-y-1 text-sm">
              @for (lab of relatedLabs(); track lab.id) {
                <li>
                  <a
                    [routerLink]="['/lab', lab.slug]"
                    class="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {{ lab.number }}. {{ lab.title }}
                  </a>
                </li>
              }
            </ul>
          </section>
        }

        @if (introducedLab(); as lab) {
          <section>
            <h4 class="text-xs font-semibold text-text/70">Pré-requisito</h4>
            <ul class="mt-1 space-y-1 text-sm">
              <li>
                Introduzido em
                <a
                  [routerLink]="['/lab', lab.slug]"
                  class="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {{ lab.number }}. {{ lab.title }}
                </a>
              </li>
              @for (prerequisite of prerequisiteLabs(); track prerequisite.id) {
                <li>
                  Requer
                  <a
                    [routerLink]="['/lab', prerequisite.slug]"
                    class="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {{ prerequisite.number }}. {{ prerequisite.title }}
                  </a>
                </li>
              }
            </ul>
          </section>
        }

        @if (reinforcedLabs().length > 0) {
          <section>
            <h4 class="text-xs font-semibold text-text/70">Reforçado em</h4>
            <ul class="mt-1 space-y-1 text-sm">
              @for (lab of reinforcedLabs(); track lab.id) {
                <li>
                  <a
                    [routerLink]="['/lab', lab.slug]"
                    class="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {{ lab.number }}. {{ lab.title }}
                  </a>
                </li>
              }
            </ul>
          </section>
        }
      </article>
    } @else {
      <p class="text-sm text-text/70">Conceito "{{ conceptId() }}" não encontrado.</p>
    }
  `,
})
export class ConceptDetailComponent {
  readonly conceptId = input.required<string>();
  readonly selectConcept = output<string>();

  private readonly registry = inject(ConceptRegistry);

  protected readonly concept = computed(() => this.registry.get(this.conceptId()) ?? null);

  protected readonly related = computed(() =>
    (this.concept()?.relatedConcepts ?? [])
      .map((id) => this.registry.get(id))
      .filter((item): item is Concept => item !== undefined)
      .map((item) => ({ id: item.id, title: item.title })),
  );

  /** Labs whose config lists this concept (the "related labs" links). */
  protected readonly relatedLabs = computed(() =>
    LAB_CATALOG.filter((lab) => lab.concepts.includes(this.conceptId())),
  );

  protected readonly introducedLab = computed(() => this.findLab(this.concept()?.introducedInLab));

  protected readonly prerequisiteLabs = computed(() =>
    (this.introducedLab()?.prerequisites ?? [])
      .map((id) => this.findLab(id))
      .filter((lab): lab is LabSummary => lab !== undefined),
  );

  protected readonly reinforcedLabs = computed(() =>
    (this.concept()?.reinforcedInLabs ?? [])
      .map((id) => this.findLab(id))
      .filter((lab): lab is LabSummary => lab !== undefined),
  );

  private findLab(labId: string | undefined): LabSummary | undefined {
    return labId ? LAB_CATALOG.find((lab) => lab.id === labId) : undefined;
  }
}
