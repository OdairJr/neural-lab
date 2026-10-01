import { Injectable } from '@angular/core';
import type { Concept } from '@domain/content';

/**
 * In-memory registry of glossary concepts. The application seeds it from
 * `educational-content/concepts` at startup; stages and the glossary read
 * from it so content stays decoupled from presentation.
 */
@Injectable({ providedIn: 'root' })
export class ConceptRegistry {
  private readonly concepts = new Map<string, Concept>();

  register(concept: Concept): void {
    this.concepts.set(concept.id, concept);
  }

  registerMany(concepts: readonly Concept[]): void {
    for (const concept of concepts) {
      this.register(concept);
    }
  }

  get(id: string): Concept | undefined {
    return this.concepts.get(id);
  }

  has(id: string): boolean {
    return this.concepts.has(id);
  }

  all(): Concept[] {
    return [...this.concepts.values()];
  }

  clear(): void {
    this.concepts.clear();
  }
}
