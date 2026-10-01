import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 11: O Neurônio.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab11NeuronConfig: LaboratoryConfig = {
  id: 'lab-11-neuron',
  number: 11,
  slug: '11-o-neuronio',
  title: 'O Neurônio',
  description: 'Entradas, pesos, bias, soma ponderada e ativação.',
  estimatedMinutes: 30,
  prerequisites: ['lab-10-gradient-descent'],
  concepts: ['neuronio', 'peso', 'bias', 'soma-ponderada', 'ativacao'],
  category: 'neural-networks',
  memoryBudgetMB: 50,
  tags: ['neural-networks'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que O Neurônio?',
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
      config: { conceptId: 'neuronio' },
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
