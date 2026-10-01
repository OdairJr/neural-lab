import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 12: Funções de Ativação.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab12ActivationsConfig: LaboratoryConfig = {
  id: 'lab-12-activations',
  number: 12,
  slug: '12-funcoes-de-ativacao',
  title: 'Funções de Ativação',
  description: 'Sigmoid, ReLU, Tanh e Softmax: fórmulas, gráficos e derivadas.',
  estimatedMinutes: 30,
  prerequisites: ['lab-11-neuron'],
  concepts: ['sigmoid', 'relu', 'tanh', 'softmax', 'derivada'],
  category: 'neural-networks',
  memoryBudgetMB: 50,
  tags: ['neural-networks'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que Funções de Ativação?',
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
      config: { conceptId: 'sigmoid' },
    },
    {
      type: 'exemplo-visual',
      title: 'Veja na pratica',
      component: 'visualization',
      config: {
        visualizationType: 'activation-curve',
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
