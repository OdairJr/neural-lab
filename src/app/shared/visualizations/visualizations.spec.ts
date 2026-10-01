import { inputBinding, type Type } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import type { VisualizationConfig, VisualizationData } from '@domain/content';
import { TensorGridComponent } from './tensor-grid/tensor-grid.component';
import { MatrixHeatmapComponent } from './matrix-heatmap/matrix-heatmap.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { ScatterPlotComponent } from './scatter-plot/scatter-plot.component';
import { ActivationCurveComponent } from './activation-curve/activation-curve.component';
import { MemoryTimelineComponent } from './memory-timeline/memory-timeline.component';
import { NetworkGraphComponent } from './network-graph/network-graph.component';

function configFor(type: VisualizationConfig['type'], label: string): VisualizationConfig {
  return {
    type,
    accessibility: { ariaLabel: label, dataTableAlternative: true, colorBlindSafe: true },
  };
}

async function render(
  component: Type<unknown>,
  data: VisualizationData,
  config: VisualizationConfig,
): Promise<ComponentFixture<unknown>> {
  await TestBed.configureTestingModule({ imports: [component] }).compileComponents();
  const fixture = TestBed.createComponent(component, {
    bindings: [inputBinding('data', () => data), inputBinding('config', () => config)],
  });
  fixture.detectChanges();
  return fixture;
}

function openTable(fixture: ComponentFixture<unknown>): void {
  const button = [...fixture.nativeElement.querySelectorAll('button')].find((element) =>
    element.textContent?.includes('Ver tabela de dados'),
  ) as HTMLButtonElement | undefined;
  expect(button).toBeTruthy();
  button?.click();
  fixture.detectChanges();
}

const CASES: {
  name: string;
  component: Type<unknown>;
  config: VisualizationConfig;
  data: VisualizationData;
  expectedRows: number;
}[] = [
  {
    name: 'tensor-grid',
    component: TensorGridComponent,
    config: configFor('tensor-grid', 'Grade'),
    data: {
      type: 'tensor-grid',
      tensor: {
        shape: [2, 2],
        dtype: 'float32',
        values: [1, 2, 3, 4],
        size: 4,
        truncated: false,
        stats: { min: 1, max: 4, mean: 2.5, std: 1.1 },
      },
    },
    expectedRows: 4,
  },
  {
    name: 'matrix-heatmap',
    component: MatrixHeatmapComponent,
    config: configFor('matrix-heatmap', 'Mapa'),
    data: {
      type: 'matrix-heatmap',
      matrix: [
        [1, 2],
        [3, 4],
      ],
      rowLabels: ['a', 'b'],
      columnLabels: ['x', 'y'],
    },
    expectedRows: 4,
  },
  {
    name: 'line-chart',
    component: LineChartComponent,
    config: configFor('line-chart', 'Linhas'),
    data: {
      type: 'line-chart',
      series: [
        { label: 'loss', data: [1, 0.5, 0.25] },
        { label: 'acc', data: [0.2, 0.6, 0.9] },
      ],
    },
    expectedRows: 3,
  },
  {
    name: 'scatter-plot',
    component: ScatterPlotComponent,
    config: configFor('scatter-plot', 'Dispersão'),
    data: {
      type: 'scatter-plot',
      points: [
        { x: 0, y: 0, label: 'A' },
        { x: 1, y: 1, label: 'B' },
      ],
      boundary: { mesh: [[0, 1]], extent: [-1, 2, -1, 2], classes: ['A', 'B'] },
    },
    expectedRows: 2,
  },
  {
    name: 'activation-curve',
    component: ActivationCurveComponent,
    config: configFor('activation-curve', 'Ativação'),
    data: { type: 'activation-curve', fn: 'sigmoid', xRange: [-5, 5] },
    expectedRows: 11,
  },
  {
    name: 'memory-timeline',
    component: MemoryTimelineComponent,
    config: configFor('memory-timeline', 'Memória'),
    data: {
      type: 'memory-timeline',
      snapshots: [
        { timestamp: 1, usedMemoryMB: 1, tensorCount: 2 },
        { timestamp: 2, usedMemoryMB: 3, tensorCount: 5 },
      ],
      budgetMB: 50,
    },
    expectedRows: 2,
  },
  {
    name: 'network-graph',
    component: NetworkGraphComponent,
    config: configFor('network-graph', 'Rede'),
    data: {
      type: 'network-graph',
      layers: [{ size: 2 }, { size: 1 }],
      weights: [[[0.5], [-0.25]]],
    },
    expectedRows: 2,
  },
];

describe('visualization data-table alternatives', () => {
  for (const testCase of CASES) {
    it(`${testCase.name} exposes an accessible data table`, async () => {
      const fixture = await render(testCase.component, testCase.data, testCase.config);

      expect(fixture.nativeElement.querySelector('table')).toBeFalsy();
      openTable(fixture);

      const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
      expect(table).toBeTruthy();
      expect(table.querySelectorAll('tbody tr')).toHaveLength(testCase.expectedRows);
    });
  }
});

describe('ActivationCurveComponent overlay', () => {
  it('overlays several functions and exposes a column per function', async () => {
    const fixture = await render(
      ActivationCurveComponent,
      {
        type: 'activation-curve',
        fn: 'sigmoid',
        xRange: [-2, 2],
        fns: ['sigmoid', 'relu', 'tanh'],
      },
      configFor('activation-curve', 'Ativação'),
    );

    expect(fixture.nativeElement.textContent).toContain('relu');
    expect(fixture.nativeElement.textContent).toContain('tanh');

    openTable(fixture);
    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    expect(table.querySelectorAll('thead th')).toHaveLength(4);
  });
});

describe('visualization empty states', () => {
  it('shows a fallback when no data is provided', async () => {
    const fixture = await render(
      TensorGridComponent,
      { type: 'matrix-heatmap', matrix: [] } as VisualizationData,
      configFor('tensor-grid', 'Grade'),
    );

    expect(fixture.nativeElement.textContent).toContain('Sem dados de tensor');
  });
});

describe('TensorGridComponent rank-3 slicing', () => {
  it('renders a slice selector for rank-3 tensors', async () => {
    const fixture = await render(
      TensorGridComponent,
      {
        type: 'tensor-grid',
        tensor: {
          shape: [2, 2, 2],
          dtype: 'float32',
          values: [1, 2, 3, 4, 5, 6, 7, 8],
          size: 8,
          truncated: false,
          stats: { min: 1, max: 8, mean: 4.5, std: 2.3 },
        },
      },
      configFor('tensor-grid', 'Grade'),
    );

    expect(fixture.nativeElement.querySelector('input[type="range"]')).toBeTruthy();
  });
});
