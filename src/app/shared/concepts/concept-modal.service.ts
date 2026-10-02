import { Injectable, signal } from '@angular/core';

/**
 * Holds the concept currently shown in the inline glossary modal.
 *
 * Lab content (a shared stage component) requests the modal through this
 * service; the lab shell owns the actual `app-modal` host so opening a term
 * never navigates away from the laboratory and the scroll position is kept.
 */
@Injectable({ providedIn: 'root' })
export class ConceptModalService {
  private readonly selected = signal<string | null>(null);

  readonly selectedConceptId = this.selected.asReadonly();

  open(conceptId: string): void {
    this.selected.set(conceptId);
  }

  close(): void {
    this.selected.set(null);
  }
}
