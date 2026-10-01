import { TestBed } from '@angular/core/testing';
import { ComponentRegistry } from './stages/component-registry.service';
import { VisualizationRegistry } from './visualizations/visualization-registry.service';

describe('ComponentRegistry', () => {
  it('resolves every registered base stage component by key', () => {
    const registry = TestBed.inject(ComponentRegistry);

    expect(registry.resolve('markdown')).toBeTruthy();
    expect(registry.resolve('concept-card')).toBeTruthy();
    expect(registry.resolve('visualization')).toBeTruthy();
    expect(registry.resolve('experiment')).toBeTruthy();
    expect(registry.resolve('challenge')).toBeTruthy();
    expect(registry.resolve('code-view')).toBeTruthy();
  });

  it('returns undefined and false for unknown keys', () => {
    const registry = TestBed.inject(ComponentRegistry);

    expect(registry.resolve('nope')).toBeUndefined();
    expect(registry.has('nope')).toBe(false);
  });

  it('allows labs to register additional components', () => {
    const registry = TestBed.inject(ComponentRegistry);
    class CustomStage {}

    registry.register('custom', CustomStage);

    expect(registry.resolve('custom')).toBe(CustomStage);
  });
});

describe('VisualizationRegistry', () => {
  it('resolves the Phase 1 core visualization set', () => {
    const registry = TestBed.inject(VisualizationRegistry);

    for (const type of [
      'tensor-grid',
      'matrix-heatmap',
      'line-chart',
      'scatter-plot',
      'activation-curve',
      'memory-timeline',
    ] as const) {
      expect(registry.has(type)).toBe(true);
      expect(registry.resolve(type)).toBeTruthy();
    }
  });

  it('returns undefined for an unregistered visualization type', () => {
    const registry = TestBed.inject(VisualizationRegistry);

    expect(registry.resolve('image-tensor')).toBeUndefined();
  });
});
