import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LAB_CATALOG } from '@content/lab-configs/lab-catalog';
import { ProgressService } from '@domain/progress';
import { BadgeComponent, ButtonComponent, CardComponent, ProgressRingComponent } from '@core/ui';

@Component({
  selector: 'app-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CardComponent, BadgeComponent, ButtonComponent, ProgressRingComponent],
  template: `
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Progresso</h1>
        <p class="text-sm text-text/80">Acompanhe sua evolução ao longo da jornada.</p>
      </header>

      <div class="flex flex-wrap items-center gap-6">
        <app-progress-ring
          [value]="overallPercent()"
          [size]="120"
          label="Progresso geral"
        />
        <div class="space-y-1">
          <p class="text-4xl font-bold">{{ overallPercent() }}%</p>
          <p class="text-sm text-text/80">
            {{ completedCount() }} de {{ totalLabs }} laboratórios concluídos
          </p>
          <app-button variant="secondary" size="sm" (click)="exportProgress()">
            Exportar progresso
          </app-button>
        </div>
      </div>

      <div>
        <h2 class="mb-3 text-lg font-semibold">Por laboratório</h2>
        <ul class="space-y-2">
          @for (lab of labs; track lab.id) {
            <li>
              <app-card [padded]="true">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <a
                    [routerLink]="['/lab', lab.slug]"
                    class="text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    {{ lab.number }}. {{ lab.title }}
                  </a>
                  <app-badge [variant]="badgeVariant(lab.id)">{{ statusLabel(lab.id) }}</app-badge>
                </div>
              </app-card>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class ProgressComponent {
  private readonly document = inject(DOCUMENT);
  private readonly progressService = inject(ProgressService);

  protected readonly labs = LAB_CATALOG;
  protected readonly totalLabs = LAB_CATALOG.length;
  protected readonly completedCount = this.progressService.completedLabCount;
  protected readonly overallPercent = computed(() =>
    Math.round((this.completedCount() / this.totalLabs) * 100),
  );

  protected statusFor(labId: string): string {
    return this.progressService.getLabProgress(labId)?.status ?? 'not-started';
  }

  protected statusLabel(labId: string): string {
    const status = this.statusFor(labId);
    if (status === 'completed') return 'Concluído';
    if (status === 'in-progress') return 'Em andamento';
    return 'Não iniciado';
  }

  protected badgeVariant(labId: string): 'success' | 'warning' | 'neutral' {
    const status = this.statusFor(labId);
    if (status === 'completed') return 'success';
    if (status === 'in-progress') return 'warning';
    return 'neutral';
  }

  protected exportProgress(): void {
    const blob = new Blob([this.progressService.exportToJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = this.document.createElement('a');
    anchor.href = url;
    anchor.download = 'neural-lab-progress.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
