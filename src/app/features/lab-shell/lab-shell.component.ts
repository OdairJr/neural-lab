import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { findLabConfigBySlug } from '@content/lab-configs';
import type { LaboratoryConfig } from '@domain/content';
import { ProgressService } from '@domain/progress';
import { LiveRegionService, ModalComponent, ProgressRingComponent } from '@core/ui';
import { ConceptModalService } from '@shared/concepts';
import { LabRuntimeService } from '@shared/runtime/lab-runtime.service';
import type { StageCompletionEvent } from '@shared/stages/stage-contract';
import { ConceptDetailComponent } from '../glossary/concept-detail.component';
import { LAB_CONFIG } from './lab-config.token';
import { StageNavigatorComponent } from './stage-navigator.component';
import { StageRendererComponent } from './stage-renderer.component';
import { UnderTheHoodPanelComponent } from './under-the-hood-panel.component';

/**
 * Universal laboratory shell: header (title, progress, panel toggle),
 * sidebar (stage navigator), main (current stage) and the optional
 * "Under the Hood" panel.
 *
 * It reads its `LaboratoryConfig` from the `LAB_CONFIG` token (provided by the
 * lab route providers) and the per-lab `LabRuntimeService`.
 */
@Component({
  selector: 'app-lab-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ProgressRingComponent,
    ModalComponent,
    ConceptDetailComponent,
    StageNavigatorComponent,
    StageRendererComponent,
    UnderTheHoodPanelComponent,
  ],
  template: `
    @if (lab; as current) {
      <div class="space-y-5">
        <header class="flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-1">
            <a
              routerLink="/jornada"
              class="text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
            >
              ← Voltar para a jornada
            </a>
            <h1 class="text-2xl font-bold tracking-tight">
              {{ current.number }}. {{ current.title }}
            </h1>
          </div>

          <div class="flex items-center gap-3">
            <app-progress-ring
              [value]="progressPercent()"
              [size]="56"
              label="Progresso do laboratório"
            />
            <button
              type="button"
              class="rounded-nl border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              [attr.aria-expanded]="panelOpen()"
              (click)="panelOpen.set(!panelOpen())"
            >
              Por baixo dos panos
            </button>
          </div>
        </header>

        <div class="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside class="rounded-nl border border-border bg-surface p-3">
            <app-stage-navigator
              [stages]="current.stages"
              [completedStages]="completedStages()"
              [currentIndex]="currentIndex()"
              [firstIncompleteIndex]="firstIncompleteIndex()"
              (navigate)="goTo($event)"
            />
          </aside>

          <main class="min-w-0 space-y-4">
            @if (currentStage(); as stage) {
              <app-stage-renderer
                [config]="stage"
                [stageIndex]="currentIndex()"
                [runtime]="runtime"
                (stageComplete)="onStageComplete($event)"
              />
            }

            <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <button
                type="button"
                class="rounded-nl border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-bg focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
                [disabled]="currentIndex() === 0"
                (click)="goTo(currentIndex() - 1)"
              >
                Etapa anterior
              </button>

              <span class="text-xs text-text/70">
                Etapa {{ currentIndex() + 1 }} de {{ current.stages.length }}
              </span>

              <button
                type="button"
                class="rounded-nl border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-bg focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
                [disabled]="currentIndex() >= current.stages.length - 1"
                (click)="goTo(currentIndex() + 1)"
              >
                Próxima etapa
              </button>
            </footer>
          </main>
        </div>

        @if (panelOpen()) {
          <aside class="rounded-nl border border-border bg-surface p-4">
            <app-under-the-hood-panel [runtime]="runtime" />
          </aside>
        }

        <app-modal
          [open]="selectedConceptId() !== null"
          heading="Glossário"
          (closed)="conceptModal.close()"
        >
          @if (selectedConceptId(); as conceptId) {
            <app-concept-detail [conceptId]="conceptId" (selectConcept)="conceptModal.open($event)" />
          }
          <div class="mt-4 border-t border-border pt-3">
            <button
              type="button"
              class="rounded-nl border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              (click)="conceptModal.close()"
            >
              Voltar ao laboratório
            </button>
          </div>
        </app-modal>
      </div>
    } @else {
      <section class="space-y-3">
        <h1 class="text-2xl font-bold tracking-tight">Laboratório não encontrado</h1>
        <p class="text-sm text-text/80">
          O laboratório solicitado ainda não está disponível.
        </p>
        <a
          routerLink="/jornada"
          class="text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
        >
          Voltar para a jornada
        </a>
      </section>
    }
  `,
})
export class LabShellComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly progress = inject(ProgressService);
  private readonly liveRegion = inject(LiveRegionService);
  private readonly destroyRef = inject(DestroyRef);
  private sessionStartedAt = 0;

  /**
   * The lab config is normally supplied through `LAB_CONFIG` by a lab feature.
   * Until per-lab features exist it is resolved from the `:slug` route param.
   */
  protected readonly lab: LaboratoryConfig | null =
    inject(LAB_CONFIG, { optional: true }) ?? this.resolveFromRoute();
  protected readonly runtime = inject(LabRuntimeService);
  protected readonly conceptModal = inject(ConceptModalService);
  protected readonly selectedConceptId = this.conceptModal.selectedConceptId;

  protected readonly currentIndex = signal(0);
  protected readonly panelOpen = signal(false);

  protected readonly completedStages = computed(() => {
    const lab = this.lab;
    return lab ? (this.progress.getLabProgress(lab.id)?.completedStages ?? []) : [];
  });

  protected readonly firstIncompleteIndex = computed(() => {
    const lab = this.lab;
    if (!lab) {
      return 0;
    }
    const completed = this.completedStages();
    const index = lab.stages.findIndex((stage) => !completed.includes(stage.type));
    return index === -1 ? lab.stages.length : index;
  });

  protected readonly currentStage = computed(() => {
    const lab = this.lab;
    return lab ? (lab.stages[this.currentIndex()] ?? null) : null;
  });

  protected readonly progressPercent = computed(() => {
    const lab = this.lab;
    if (!lab || lab.stages.length === 0) {
      return 0;
    }
    return (this.completedStages().length / lab.stages.length) * 100;
  });

  constructor() {
    const lab = this.lab;
    if (lab) {
      const queryStage = this.route.snapshot.queryParamMap.get('stage');
      const requestedIndex = queryStage
        ? lab.stages.findIndex((stage) => stage.type === queryStage)
        : -1;
      this.currentIndex.set(requestedIndex >= 0 ? requestedIndex : this.firstIncompleteIndex());
    }

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const lab = this.lab;
      if (!lab) {
        return;
      }
      const stage = params.get('stage');
      if (!stage) {
        return;
      }
      const index = lab.stages.findIndex((item) => item.type === stage);
      if (index >= 0 && index !== this.currentIndex()) {
        this.currentIndex.set(index);
      }
    });

    // Open the panel by default when the user enabled it in settings.
    this.panelOpen.set(this.progress.progress().settings.showUnderTheHood);

    // Tag analytics and time tracking for this lab session.
    const activeLab = this.lab;
    if (activeLab) {
      this.runtime.setLabId(activeLab.id);
      this.progress.markLabStarted(activeLab.id);
      this.sessionStartedAt = Date.now();
      this.destroyRef.onDestroy(() => this.flushTime());
    }
  }

  private resolveFromRoute(): LaboratoryConfig | null {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    return findLabConfigBySlug(slug) ?? null;
  }

  protected goTo(index: number): void {
    const lab = this.lab;
    if (!lab || index < 0 || index >= lab.stages.length) {
      return;
    }
    this.flushTime();
    this.currentIndex.set(index);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { stage: lab.stages[index].type },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected onStageComplete(event: StageCompletionEvent): void {
    const lab = this.lab;
    if (!lab) {
      return;
    }
    const stage = lab.stages[event.index];
    if (!stage) {
      return;
    }

    const wasCompleted = this.progress.getLabProgress(lab.id)?.status === 'completed';
    const now = new Date().toISOString();

    this.progress.updateLab(lab.id, (current) => {
      const completedStages = current.completedStages.includes(stage.type)
        ? current.completedStages
        : [...current.completedStages, stage.type];
      const status =
        completedStages.length >= lab.stages.length
          ? ('completed' as const)
          : ('in-progress' as const);
      return { ...current, completedStages, currentStageIndex: event.index, lastVisitedAt: now, status };
    });

    this.progress.recordAnalytics('stage-completed', {
      labId: lab.id,
      stageType: stage.type,
      stageIndex: event.index,
    });

    if (!wasCompleted && this.progress.getLabProgress(lab.id)?.status === 'completed') {
      this.progress.recordAnalytics('lab-completed', { labId: lab.id });
    }

    this.liveRegion.announce(`Etapa "${stage.title}" concluída.`);
  }

  /** Accumulates the time spent in the lab since the last flush. */
  private flushTime(): void {
    const lab = this.lab;
    if (!lab || this.sessionStartedAt === 0) {
      return;
    }
    const now = Date.now();
    const elapsed = now - this.sessionStartedAt;
    this.sessionStartedAt = now;
    this.progress.addLabTime(lab.id, elapsed);
  }
}
