import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LAB_CATALOG, LAB_CATEGORY_LABELS } from '@content/lab-configs/lab-catalog';
import { BadgeComponent, CardComponent } from '@core/ui';

@Component({
  selector: 'app-journey',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CardComponent, BadgeComponent],
  template: `
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Jornada de Aprendizado</h1>
        <p class="max-w-2xl text-sm text-text/80">
          Siga os 16 laboratórios em ordem para ir dos fundamentos de tensores até o
          gerenciamento de memória com TensorFlow.js.
        </p>
      </header>

      <ol class="space-y-3">
        @for (lab of labs; track lab.id) {
          <li>
            <a
              [routerLink]="['/lab', lab.slug]"
              class="block rounded-nl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <app-card>
                <div class="flex items-start gap-4">
                  <span
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary"
                    aria-hidden="true"
                  >
                    {{ lab.number }}
                  </span>
                  <div class="flex-1 space-y-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <h2 class="text-base font-semibold">{{ lab.title }}</h2>
                      <app-badge variant="neutral">{{ categoryLabel(lab.category) }}</app-badge>
                    </div>
                    <p class="text-sm text-text/80">{{ lab.description }}</p>
                    <p class="text-xs text-text/70">{{ lab.estimatedMinutes }} min</p>
                  </div>
                </div>
              </app-card>
            </a>
          </li>
        }
      </ol>
    </section>
  `,
})
export class JourneyComponent {
  protected readonly labs = LAB_CATALOG;
  protected readonly categoryLabels = LAB_CATEGORY_LABELS;

  protected categoryLabel(category: (typeof LAB_CATALOG)[number]['category']): string {
    return this.categoryLabels[category];
  }
}
