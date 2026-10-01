import { Injectable, type Type } from '@angular/core';
import { ChallengeStageComponent } from './challenge-stage.component';
import { CodeViewStageComponent } from './code-view-stage.component';
import { ConceptCardStageComponent } from './concept-card-stage.component';
import { ExperimentStageComponent } from './experiment-stage.component';
import { MarkdownStageComponent } from './markdown-stage.component';
import { VisualizationStageComponent } from './visualization-stage.component';

/** Component key used by a stage config to select its renderer. */
export type RegisteredStageComponent = Type<unknown>;

/**
 * Registry mapping `StageConfig.component` keys to the Angular component that
 * renders them. The six base stage components are registered by default; labs
 * may register additional, lab-specific stage components.
 */
@Injectable({ providedIn: 'root' })
export class ComponentRegistry {
  private readonly components = new Map<string, RegisteredStageComponent>();

  constructor() {
    this.register('markdown', MarkdownStageComponent);
    this.register('concept-card', ConceptCardStageComponent);
    this.register('visualization', VisualizationStageComponent);
    this.register('experiment', ExperimentStageComponent);
    this.register('challenge', ChallengeStageComponent);
    this.register('code-view', CodeViewStageComponent);
  }

  register(key: string, component: RegisteredStageComponent): void {
    this.components.set(key, component);
  }

  resolve(key: string): RegisteredStageComponent | undefined {
    return this.components.get(key);
  }

  has(key: string): boolean {
    return this.components.has(key);
  }

  keys(): string[] {
    return [...this.components.keys()];
  }
}
