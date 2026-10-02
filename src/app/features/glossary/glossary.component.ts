import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LAB_CATALOG } from '@content/lab-configs/lab-catalog';
import { ProgressService } from '@domain/progress';
import { ConceptRegistry } from '@shared/concepts';
import { CardComponent } from '@core/ui';
import { ConceptDetailComponent } from './concept-detail.component';

/**
 * Searchable, cross-referenced glossary page.
 *
 * Shows an A-Z list of every registered concept with its one-line definition
 * and how many laboratories reference it, filters the list in real time as the
 * user types, and renders the full entry (definition, visual analogy, formula,
 * TF.js API and cross-references) for the selected term. A `?concept=<id>`
 * query parameter deep-links directly to an entry.
 */
@Component({
  selector: 'app-glossary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, ConceptDetailComponent],
  template: `
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Glossário</h1>
        <p class="max-w-2xl text-sm text-text/80">
          Definições dos conceitos de Machine Learning e TensorFlow.js usados nos laboratórios,
          com fórmula, API e referências cruzadas.
        </p>
      </header>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div class="space-y-4">
          <div class="space-y-1">
            <label for="glossary-search" class="text-xs font-medium text-text/70">
              Buscar termo
            </label>
            <input
              id="glossary-search"
              type="search"
              [value]="query()"
              (input)="onSearch($event)"
              placeholder="ex.: tensor, loss, gradiente"
              class="h-10 w-full rounded-nl border border-border bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary"
            />
          </div>

          <p class="text-xs text-text/70" role="status">
            {{ filtered().length }} de {{ concepts().length }} termos
          </p>

          @if (filtered().length > 0) {
            <ul class="space-y-2" aria-label="Termos do glossário">
              @for (concept of filtered(); track concept.id) {
                <li>
                  <button
                    type="button"
                    [attr.aria-current]="selectedId() === concept.id ? 'true' : null"
                    (click)="selectConcept(concept.id)"
                    [class]="itemClasses(concept.id)"
                  >
                    <span class="block text-sm font-medium">{{ concept.title }}</span>
                    <span class="block text-xs text-text/70">{{ concept.shortDefinition }}</span>
                    <span class="mt-1 block text-xs text-text/70">
                      {{ relatedLabCount(concept.id) }} laboratórios
                    </span>
                  </button>
                </li>
              }
            </ul>
          } @else {
            <p class="text-sm text-text/70">Nenhum termo corresponde à busca.</p>
          }
        </div>

        <div>
          @if (selectedId(); as id) {
            <app-card>
              <app-concept-detail [conceptId]="id" (selectConcept)="selectConcept($event)" />
            </app-card>
          } @else {
            <app-card>
              <p class="text-sm text-text/70">
                Selecione um termo para ver a definição completa, a fórmula, a API do
                TensorFlow.js e os laboratórios relacionados.
              </p>
            </app-card>
          }
        </div>
      </div>
    </section>
  `,
})
export class GlossaryComponent {
  private readonly registry = inject(ConceptRegistry);
  private readonly progress = inject(ProgressService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly query = signal('');
  protected readonly selectedId = signal<string | null>(null);

  private readonly recorded = new Set<string>();

  protected readonly concepts = computed(() =>
    [...this.registry.all()].sort((a, b) =>
      a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }),
    ),
  );

  protected readonly filtered = computed(() => {
    const term = this.query().trim().toLocaleLowerCase('pt-BR');
    if (!term) {
      return this.concepts();
    }
    return this.concepts().filter(
      (concept) =>
        concept.title.toLocaleLowerCase('pt-BR').includes(term) ||
        concept.shortDefinition.toLocaleLowerCase('pt-BR').includes(term),
    );
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const conceptId = params.get('concept');
      if (conceptId && this.registry.has(conceptId)) {
        this.selectedId.set(conceptId);
        this.recordView(conceptId);
      } else if (conceptId) {
        this.selectedId.set(null);
      }
    });
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected itemClasses(conceptId: string): string {
    const base =
      'w-full rounded-nl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
    return this.selectedId() === conceptId
      ? `${base} border-primary bg-primary/10`
      : `${base} border-border bg-surface hover:bg-bg`;
  }

  protected relatedLabCount(conceptId: string): number {
    return LAB_CATALOG.filter((lab) => lab.concepts.includes(conceptId)).length;
  }

  protected selectConcept(conceptId: string): void {
    this.selectedId.set(conceptId);
    this.recordView(conceptId);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { concept: conceptId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private recordView(conceptId: string): void {
    if (this.recorded.has(conceptId)) {
      return;
    }
    this.recorded.add(conceptId);
    this.progress.recordGlossaryView(conceptId);
  }
}
