import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import type { StageConfig } from '@domain/content';
import { renderMarkdown } from '@core/utils';
import { ConceptLinkerService, ConceptModalService, conceptIdFromHref } from '../concepts';
import type { LabRuntimeService } from '../runtime/lab-runtime.service';
import { StageLayoutComponent } from './stage-layout.component';
import { StageCompletionEvent } from './stage-contract';

/** Renders a markdown stage body (with optional frontmatter). */
@Component({
  selector: 'app-markdown-stage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StageLayoutComponent],
  template: `
    <app-stage-layout [title]="config().title" [type]="config().type" (complete)="complete()">
      <div
        class="space-y-3 text-sm leading-relaxed text-text/90 [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-surface [&_code]:px-1 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed"
        [innerHTML]="html()"
      ></div>
    </app-stage-layout>
  `,
})
export class MarkdownStageComponent {
  readonly config = input.required<StageConfig>();
  readonly stageIndex = input(0);
  readonly runtime = input.required<LabRuntimeService>();
  readonly stageComplete = output<StageCompletionEvent>();

  private readonly linker = inject(ConceptLinkerService);
  private readonly conceptModal = inject(ConceptModalService);

  protected readonly html = computed(() =>
    this.linker.linkify(renderMarkdown(this.content())),
  );

  private content(): string {
    const value = this.config().config?.['content'];
    return typeof value === 'string' ? value : '';
  }

  /**
   * Opens the glossary detail modal for inline concept links. The click is
   * intercepted so the laboratory is not left and the scroll position is kept;
   * the modal host lives in the lab shell.
   */
  @HostListener('click', ['$event'])
  protected onContentClick(event: Event): void {
    const target = event.target as Element | null;
    const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!anchor) {
      return;
    }
    const conceptId = conceptIdFromHref(anchor.getAttribute('href'));
    if (!conceptId) {
      return;
    }
    event.preventDefault();
    this.conceptModal.open(conceptId);
  }

  protected complete(): void {
    this.stageComplete.emit({ type: this.config().type, index: this.stageIndex() });
  }
}
