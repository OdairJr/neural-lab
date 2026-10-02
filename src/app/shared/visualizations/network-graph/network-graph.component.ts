import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import type { VisualizationConfig, VisualizationData } from '@domain/content';
import { VisualizationTableComponent } from '../visualization-table.component';
import { VisualizationInteraction } from '../visualization-contract';
import { useReducedMotion } from '../use-reduced-motion';

interface GraphNode {
  layer: number;
  index: number;
  x: number;
  y: number;
  activation: string;
}

interface GraphEdge {
  layer: number;
  from: number;
  to: number;
  weight: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const WIDTH = 360;
const HEIGHT = 220;
const NODE_RADIUS = 7;
const COLORS = ['#6366f1', '#f97316', '#10b981', '#ef4444', '#0ea5e9'];

/**
 * Draws the topology of a fully-connected network as SVG columns of neurons
 * with weight-scaled edges. Ships an accessible data-table alternative and
 * disables transitions when reduced motion is preferred.
 */
@Component({
  selector: 'app-network-graph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VisualizationTableComponent],
  template: `
    @if (graph(); as current) {
      <figure class="space-y-3">
        @if (current.title) {
          <figcaption class="text-xs text-text/70">{{ current.title }}</figcaption>
        }

        <svg
          role="img"
          [attr.aria-label]="ariaLabel()"
          [attr.viewBox]="'0 0 ' + width + ' ' + height"
          class="h-64 w-full rounded-nl border border-border bg-bg"
        >
          @for (edge of current.edges; track $index) {
            <line
              [attr.x1]="edge.x1"
              [attr.y1]="edge.y1"
              [attr.x2]="edge.x2"
              [attr.y2]="edge.y2"
              [attr.stroke]="edge.weight >= 0 ? '#6366f1' : '#ef4444'"
              [attr.stroke-width]="edgeWidth(edge.weight)"
              [attr.stroke-opacity]="0.75"
              [class]="reducedMotion() ? '' : 'transition-opacity'"
            />
          }
          @for (node of current.nodes; track node.layer + '-' + node.index) {
            <circle
              [attr.cx]="node.x"
              [attr.cy]="node.y"
              [attr.r]="nodeRadius"
              [attr.fill]="nodeColor(node.layer)"
              stroke="#0f172a"
              stroke-width="1"
            />
            <title>{{ node.activation }}</title>
          }
        </svg>

        <p class="text-xs text-text/70">
          {{ current.layers.length }} camada(s) · {{ current.edgeCount }} conexão(ões)
        </p>

        <button
          type="button"
          class="text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
          [attr.aria-expanded]="showTable()"
          (click)="showTable.set(!showTable())"
        >
          {{ showTable() ? 'Ocultar tabela de dados' : 'Ver tabela de dados' }}
        </button>

        @if (showTable()) {
          <app-visualization-table
            caption="Conexões da rede"
            [columns]="tableColumns()"
            [rows]="tableRows()"
          />
        }
      </figure>
    } @else {
      <p class="text-sm text-text/70">Sem dados de rede para exibir.</p>
    }
  `,
})
export class NetworkGraphComponent {
  readonly data = input<VisualizationData>();
  readonly config = input<VisualizationConfig>();
  readonly interaction = output<VisualizationInteraction>();

  protected readonly width = WIDTH;
  protected readonly height = HEIGHT;
  protected readonly nodeRadius = NODE_RADIUS;
  protected readonly showTable = signal(false);
  protected readonly reducedMotion = useReducedMotion();

  protected readonly ariaLabel = computed(
    () => this.config()?.accessibility.ariaLabel ?? 'Grafo da rede neural',
  );

  protected readonly graph = computed(() => {
    const data = this.data();
    if (data?.type !== 'network-graph' || data.layers.length === 0) {
      return null;
    }
    const layers = data.layers;
    const maxSize = Math.max(...layers.map((layer) => layer.size), 1);
    const columnGap = layers.length > 1 ? WIDTH / (layers.length + 0.5) : 0;
    const rowGap = HEIGHT / (maxSize + 1);

    const nodes: GraphNode[] = [];
    layers.forEach((layer, layerIndex) => {
      const count = Math.max(1, layer.size);
      for (let index = 0; index < count; index++) {
        nodes.push({
          layer: layerIndex,
          index,
          x: layers.length === 1 ? WIDTH / 2 : columnGap * (layerIndex + 0.75),
          y: rowGap * (index + 1),
          activation: layer.activation ?? 'linear',
        });
      }
    });

    const position = (layerIndex: number, neuron: number): { x: number; y: number } => {
      const count = Math.max(1, layers[layerIndex].size);
      const x = layers.length === 1 ? WIDTH / 2 : columnGap * (layerIndex + 0.75);
      if (count === 1) {
        return { x, y: HEIGHT / 2 };
      }
      return { x, y: rowGap * (neuron + 1) };
    };

    const edges: GraphEdge[] = [];
    let edgeCount = 0;
    for (let layer = 0; layer < layers.length - 1; layer++) {
      const fromSize = Math.max(1, layers[layer].size);
      const toSize = Math.max(1, layers[layer + 1].size);
      for (let to = 0; to < toSize; to++) {
        for (let from = 0; from < fromSize; from++) {
          const start = position(layer, from);
          const end = position(layer + 1, to);
          const weight = data.weights?.[layer]?.[to]?.[from] ?? 0;
          edges.push({
            layer,
            from,
            to,
            weight,
            x1: start.x,
            y1: start.y,
            x2: end.x,
            y2: end.y,
          });
          edgeCount++;
        }
      }
    }

    return { nodes, edges, layers, edgeCount, title: data.title };
  });

  protected nodeColor(layerIndex: number): string {
    return COLORS[layerIndex % COLORS.length];
  }

  protected edgeWidth(weight: number): number {
    return 0.5 + Math.min(4, Math.abs(weight) * 3);
  }

  protected readonly tableColumns = computed(() => {
    const current = this.graph();
    return current && current.edgeCount > 0
      ? ['Camada', 'De', 'Para', 'Peso']
      : ['Camada', 'Neurônio', 'Ativação'];
  });

  protected readonly tableRows = computed(() => {
    const current = this.graph();
    if (!current) {
      return [];
    }
    if (current.edgeCount > 0) {
      return current.edges.map((edge) => [
        edge.layer,
        `N${edge.from}`,
        `N${edge.to}`,
        Number(edge.weight.toFixed(3)),
      ]);
    }
    return current.nodes.map((node) => [node.layer, `N${node.index}`, node.activation]);
  });
}
