import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LAB_CONFIGS } from '@content/lab-configs';
import { LAB_CATALOG } from '@content/lab-configs/lab-catalog';
import { ProgressService } from '@domain/progress';
import { BadgeComponent, ButtonComponent, CardComponent, ProgressRingComponent } from '@core/ui';
import { ConceptMasteryRadarComponent } from './concept-mastery-radar.component';
import { computeMastery } from './concept-mastery';
import {
  computeStreak,
  computeStrugglePoints,
  formatDuration,
  formatTimestamp,
} from './learning-insights';

/**
 * Progress dashboard: overall completion, per-lab detail, the 12-dimension
 * concept mastery radar and the local "Seu aprendizado" analytics view.
 * Analytics are only included in the export when the user opts in.
 */
@Component({
  selector: 'app-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    ProgressRingComponent,
    ConceptMasteryRadarComponent,
  ],
  template: `
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Progresso</h1>
        <p class="text-sm text-text/80">Acompanhe sua evolução ao longo da jornada.</p>
      </header>

      <div class="flex flex-wrap items-center gap-6">
        <app-progress-ring [value]="overallPercent()" [size]="120" label="Progresso geral" />
        <dl class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <dt class="text-xs text-text/70">Progresso geral</dt>
            <dd class="text-2xl font-bold">{{ overallPercent() }}%</dd>
          </div>
          <div>
            <dt class="text-xs text-text/70">Laboratórios</dt>
            <dd class="text-2xl font-bold">{{ completedCount() }}</dd>
            <dd class="text-xs text-text/70">de {{ totalLabs }} concluídos</dd>
          </div>
          <div>
            <dt class="text-xs text-text/70">Tempo total</dt>
            <dd class="text-2xl font-bold">{{ formatDuration(totalTimeMs()) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-text/70">Sequência</dt>
            <dd class="text-2xl font-bold">{{ streak() }}</dd>
            <dd class="text-xs text-text/70">
              {{ streak() === 1 ? 'dia consecutivo' : 'dias consecutivos' }}
            </dd>
          </div>
        </dl>
      </div>

      <app-card>
        <h2 class="mb-1 text-lg font-semibold">Domínio dos conceitos</h2>
        <p class="mb-3 text-xs text-text/70">
          Percentual de etapas concluídas nos laboratórios de cada grupo de conceitos.
        </p>
        <app-concept-mastery-radar [points]="mastery()" />
      </app-card>

      <app-card>
        <h2 class="mb-3 text-lg font-semibold">Seu aprendizado</h2>
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-2 text-sm">
            <p>
              <span class="font-medium">Tempo total de estudo:</span>
              {{ formatDuration(totalTimeMs()) }}
            </p>
            <p>
              <span class="font-medium">Sequência atual:</span> {{ streak() }}
              {{ streak() === 1 ? 'dia' : 'dias' }}
            </p>
          </div>

          <div>
            <h3 class="text-sm font-semibold">Pontos de dificuldade</h3>
            @if (strugglePoints().length > 0) {
              <ul class="mt-2 space-y-1 text-sm">
                @for (point of strugglePoints(); track point.labId + '-' + point.stageIndex) {
                  <li class="flex items-center justify-between gap-3">
                    <span class="text-text/90">{{ point.labTitle }} — {{ point.stageTitle }}</span>
                    <app-badge variant="warning">{{ point.failures }} tentativas</app-badge>
                  </li>
                }
              </ul>
            } @else {
              <p class="mt-2 text-sm text-text/70">
                Nenhuma dificuldade registrada até agora.
              </p>
            }
          </div>
        </div>
      </app-card>

      <app-card>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold">Exportar progresso</h2>
            <label class="mt-1 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                [checked]="includeAnalytics()"
                (change)="setIncludeAnalytics($event)"
              />
              Incluir análises no arquivo
            </label>
          </div>
          <app-button variant="secondary" size="sm" (click)="exportProgress()">
            Exportar progresso
          </app-button>
        </div>
      </app-card>

      <div>
        <h2 class="mb-3 text-lg font-semibold">Por laboratório</h2>
        <ul class="space-y-2">
          @for (lab of rows(); track lab.id) {
            <li>
              <app-card [padded]="true">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <a
                      [routerLink]="['/lab', lab.slug]"
                      class="text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {{ lab.number }}. {{ lab.title }}
                    </a>
                    <dl class="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-xs text-text/70">
                      <div>
                        <dt class="inline">Progresso:</dt>
                        <dd class="inline font-medium text-text">{{ lab.completionPercent }}%</dd>
                      </div>
                      <div>
                        <dt class="inline">Etapas:</dt>
                        <dd class="inline font-medium text-text">
                          {{ lab.completedStages }}/{{ lab.totalStages }}
                        </dd>
                      </div>
                      <div>
                        <dt class="inline">Tempo:</dt>
                        <dd class="inline font-medium text-text">
                          {{ formatDuration(lab.timeSpentMs) }}
                        </dd>
                      </div>
                      <div>
                        <dt class="inline">Desafios:</dt>
                        <dd class="inline font-medium text-text">{{ lab.challengeAttempts }}</dd>
                      </div>
                      <div>
                        <dt class="inline">Última visita:</dt>
                        <dd class="inline font-medium text-text">
                          {{ formatTimestamp(lab.lastVisitedAt) }}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <app-badge [variant]="badgeVariant(lab.status)">{{
                    statusLabel(lab.status)
                  }}</app-badge>
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
  protected readonly formatDuration = formatDuration;
  protected readonly formatTimestamp = formatTimestamp;

  protected readonly completedCount = this.progressService.completedLabCount;
  protected readonly includeAnalytics = computed(
    () => this.progressService.progress().settings.includeAnalyticsInExport,
  );

  private readonly totalStagesByLab = new Map(
    LAB_CONFIGS.map((config) => [config.id, config.stages.length]),
  );

  protected readonly totalTimeMs = computed(() =>
    this.progressService.progress().labs.reduce((sum, lab) => sum + lab.timeSpentMs, 0),
  );

  protected readonly overallPercent = computed(() => {
    const completed = this.progressService
      .progress()
      .labs.reduce((sum, lab) => sum + lab.completedStages.length, 0);
    const total = [...this.totalStagesByLab.values()].reduce((sum, count) => sum + count, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  });

  protected readonly mastery = computed(() =>
    computeMastery(this.progressService.progress().labs, this.totalStagesByLab),
  );

  protected readonly streak = computed(() => computeStreak(this.activityTimestamps()));

  protected readonly strugglePoints = computed(() =>
    computeStrugglePoints(this.progressService.progress().labs).map((point) => {
      const catalogLab = LAB_CATALOG.find((lab) => lab.id === point.labId);
      const config = LAB_CONFIGS.find((lab) => lab.id === point.labId);
      const stageTitle =
        config?.stages[point.stageIndex]?.title ?? `Etapa ${point.stageIndex + 1}`;
      return {
        ...point,
        labTitle: catalogLab ? `${catalogLab.number}. ${catalogLab.title}` : point.labId,
        stageTitle,
      };
    }),
  );

  protected readonly rows = computed(() => {
    const byId = new Map(this.progressService.progress().labs.map((lab) => [lab.labId, lab]));
    return LAB_CATALOG.map((lab) => {
      const progress = byId.get(lab.id);
      const total = this.totalStagesByLab.get(lab.id) ?? 0;
      const completed = progress?.completedStages.length ?? 0;
      return {
        id: lab.id,
        number: lab.number,
        slug: lab.slug,
        title: lab.title,
        status: progress?.status ?? 'not-started',
        completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        completedStages: completed,
        totalStages: total,
        timeSpentMs: progress?.timeSpentMs ?? 0,
        challengeAttempts: progress?.challengeAttempts.length ?? 0,
        lastVisitedAt: progress?.lastVisitedAt ?? null,
      };
    });
  });

  protected statusLabel(status: string): string {
    if (status === 'completed') return 'Concluído';
    if (status === 'in-progress') return 'Em andamento';
    return 'Não iniciado';
  }

  protected badgeVariant(status: string): 'success' | 'warning' | 'neutral' {
    if (status === 'completed') return 'success';
    if (status === 'in-progress') return 'warning';
    return 'neutral';
  }

  protected setIncludeAnalytics(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.progressService.updateSettings((settings) => ({
      ...settings,
      includeAnalyticsInExport: value,
    }));
    this.progressService.recordAnalytics('settings-changed', {
      setting: 'includeAnalyticsInExport',
      value,
    });
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

  private activityTimestamps(): string[] {
    const state = this.progressService.progress();
    const timestamps = state.analytics.map((event) => event.timestamp);
    for (const lab of state.labs) {
      if (lab.lastVisitedAt) {
        timestamps.push(lab.lastVisitedAt);
      }
      for (const attempt of lab.challengeAttempts) {
        timestamps.push(attempt.timestamp);
      }
    }
    return timestamps;
  }
}
