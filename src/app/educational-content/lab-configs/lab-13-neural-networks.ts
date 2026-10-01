import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 13: Redes Neurais.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab13NeuralNetworksConfig: LaboratoryConfig = {
  id: 'lab-13-neural-networks',
  number: 13,
  slug: '13-redes-neurais',
  title: 'Redes Neurais',
  description: 'Camadas, propagação direta, loss, backpropagation e treino.',
  estimatedMinutes: 40,
  prerequisites: ['lab-12-activations'],
  concepts: ['camada', 'forward-propagation', 'backpropagation', 'treino'],
  category: 'neural-networks',
  memoryBudgetMB: 50,
  tags: ['neural-networks'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que Redes Neurais?',
      component: 'markdown',
      config: {
        content:
          '## Contexto\n\nEste laboratorio faz parte da jornada de aprendizado. Em breve traremos o conteudo completo desta etapa.',
      },
    },
    {
      type: 'conceito',
      title: 'Conceitos-chave',
      component: 'concept-card',
      config: { conceptId: 'camada' },
    },
    {
      type: 'exemplo-visual',
      title: 'Veja na pratica',
      component: 'visualization',
      config: {
        visualizationType: 'line-chart',
        initialData: {},
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: '## Resumo\n\nRevise os principais pontos deste laboratorio antes de seguir.',
      },
    },
  ],
};
