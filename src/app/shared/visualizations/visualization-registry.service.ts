import { Injectable, type Type } from '@angular/core';
import type { VisualizationType } from '@domain/content';
import { ActivationCurveComponent } from './activation-curve/activation-curve.component';
import { ImageTensorComponent } from './image-tensor/image-tensor.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { MatrixHeatmapComponent } from './matrix-heatmap/matrix-heatmap.component';
import { MemoryTimelineComponent } from './memory-timeline/memory-timeline.component';
import { NetworkGraphComponent } from './network-graph/network-graph.component';
import { ScatterPlotComponent } from './scatter-plot/scatter-plot.component';
import { TensorGridComponent } from './tensor-grid/tensor-grid.component';

/**
 * Registry mapping content visualization types to their Angular component.
 *
 * The core set (Phase 1) is registered by default; labs may register
 * additional, lab-specific visualizations at runtime.
 */
@Injectable({ providedIn: 'root' })
export class VisualizationRegistry {
  private readonly components = new Map<VisualizationType, Type<unknown>>();

  constructor() {
    this.register('tensor-grid', TensorGridComponent);
    this.register('matrix-heatmap', MatrixHeatmapComponent);
    this.register('line-chart', LineChartComponent);
    this.register('scatter-plot', ScatterPlotComponent);
    this.register('activation-curve', ActivationCurveComponent);
    this.register('memory-timeline', MemoryTimelineComponent);
    this.register('network-graph', NetworkGraphComponent);
    this.register('image-tensor', ImageTensorComponent);
  }

  register(type: VisualizationType, component: Type<unknown>): void {
    this.components.set(type, component);
  }

  resolve(type: VisualizationType): Type<unknown> | undefined {
    return this.components.get(type);
  }

  has(type: VisualizationType): boolean {
    return this.components.has(type);
  }

  /** Snapshot of the registered types (used by tests/tooling). */
  registeredTypes(): VisualizationType[] {
    return [...this.components.keys()];
  }
}
