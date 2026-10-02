export {
  VisualizationRegistry,
} from './visualization-registry.service';
export { VisualizationTableComponent } from './visualization-table.component';
export { useReducedMotion } from './use-reduced-motion';
export type { VisualizationInteraction } from './visualization-contract';
export { TensorGridComponent } from './tensor-grid/tensor-grid.component';
export { MatrixHeatmapComponent, heatmapColor } from './matrix-heatmap/matrix-heatmap.component';
export { LineChartComponent } from './line-chart/line-chart.component';
export { ScatterPlotComponent, nearestPointIndex } from './scatter-plot/scatter-plot.component';
export { ActivationCurveComponent } from './activation-curve/activation-curve.component';
export {
  activationDerivative,
  activationSeries,
  activationValue,
  sampleRange,
  type ActivationFunction,
  type ActivationSeries,
} from './activation-curve/activation-functions';
export { MemoryTimelineComponent } from './memory-timeline/memory-timeline.component';
export { ImageTensorComponent } from './image-tensor/image-tensor.component';
export { NetworkGraphComponent } from './network-graph/network-graph.component';
