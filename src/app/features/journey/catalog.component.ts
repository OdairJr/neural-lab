import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LAB_CATALOG,
  LAB_CATEGORY_LABELS,
} from '@content/lab-configs/lab-catalog';
import type { LabCategory } from '@domain/models/lab.model';
import { BadgeComponent, CardComponent } from '@core/ui';

const ALL_CATEGORIES = 'all';

@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CardComponent, BadgeComponent],
  template: `
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Laboratórios</h1>
        <p class="max-w-2xl text-sm text-text/80">
          Explore os 16 laboratórios por categoria ou busque por palavra-chave.
        </p>
      </header>

      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col gap-1">
          <label for="catalog-search" class="text-xs font-medium text-text/70">Buscar</label>
          <input
            id="catalog-search"
            type="search"
            [value]="query()"
            (input)="onQueryInput($event)"
            placeholder="Título, descrição ou conceito"
            class="h-10 w-64 rounded-nl border border-border bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="catalog-category" class="text-xs font-medium text-text/70">Categoria</label>
          <select
            id="catalog-category"
            [value]="category()"
            (change)="onCategoryChange($event)"
            class="h-10 rounded-nl border border-border bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <option [value]="allCategories">Todas</option>
            @for (entry of categoryEntries; track entry.value) {
              <option [value]="entry.value">{{ entry.label }}</option>
            }
          </select>
        </div>
      </div>

      @if (results().length > 0) {
        <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          @for (lab of results(); track lab.id) {
            <li>
              <a
                [routerLink]="['/lab', lab.slug]"
                class="block h-full rounded-nl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <app-card>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between gap-2">
                      <h2 class="text-sm font-semibold">{{ lab.number }}. {{ lab.title }}</h2>
                      <app-badge variant="info">{{ categoryLabel(lab.category) }}</app-badge>
                    </div>
                    <p class="text-sm text-text/80">{{ lab.description }}</p>
                    <p class="text-xs text-text/60">{{ lab.estimatedMinutes }} min</p>
                  </div>
                </app-card>
              </a>
            </li>
          }
        </ul>
      } @else {
        <p class="text-sm text-text/70">Nenhum laboratório corresponde aos filtros selecionados.</p>
      }
    </section>
  `,
})
export class CatalogComponent {
  protected readonly allCategories = ALL_CATEGORIES;
  protected readonly query = signal('');
  protected readonly category = signal<string>(ALL_CATEGORIES);

  protected readonly categoryEntries = (
    Object.entries(LAB_CATEGORY_LABELS) as [LabCategory, string][]
  ).map(([value, label]) => ({ value, label }));

  protected readonly results = computed(() => {
    const query = this.query().trim().toLowerCase();
    const category = this.category();

    return LAB_CATALOG.filter((lab) => {
      const matchesCategory = category === ALL_CATEGORIES || lab.category === category;
      const haystack = [lab.title, lab.description, ...lab.concepts].join(' ').toLowerCase();
      return matchesCategory && (query === '' || haystack.includes(query));
    });
  });

  protected onQueryInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected onCategoryChange(event: Event): void {
    this.category.set((event.target as HTMLSelectElement).value);
  }

  protected categoryLabel(category: LabCategory): string {
    return LAB_CATEGORY_LABELS[category];
  }
}
