import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { findLabBySlug } from '@content/lab-configs/lab-catalog';
import { CardComponent } from '@core/ui';

/**
 * Temporary landing page for a lab route until the individual lab features
 * are implemented (Phase 1+). Keeps `/lab/:slug` deep links alive.
 */
@Component({
  selector: 'app-lab-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CardComponent],
  template: `
    <section class="space-y-4">
      @if (lab(); as current) {
        <h1 class="text-3xl font-bold tracking-tight">
          {{ current.number }}. {{ current.title }}
        </h1>
        <p class="max-w-2xl text-sm text-text/80">{{ current.description }}</p>
      } @else {
        <h1 class="text-3xl font-bold tracking-tight">Laboratório não encontrado</h1>
        <p class="text-sm text-text/80">
          O laboratório solicitado ainda não está disponível.
        </p>
      }

      <app-card>
        <p class="text-sm text-text/70">
          Este laboratório será implementado na próxima fase. Enquanto isso, explore a
          jornada completa.
        </p>
        <a
          routerLink="/jornada"
          class="mt-3 inline-block text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Voltar para a jornada
        </a>
      </app-card>
    </section>
  `,
})
export class LabPlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly lab = computed(() =>
    findLabBySlug(this.route.snapshot.paramMap.get('slug') ?? ''),
  );
}
