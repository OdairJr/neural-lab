import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 4: Operações de Redução.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab04ReductionsConfig: LaboratoryConfig = {
  id: 'lab-04-reductions',
  number: 4,
  slug: '04-operacoes-de-reducao',
  title: 'Operações de Redução',
  description: 'sum, mean, min e max ao longo de eixos específicos.',
  estimatedMinutes: 20,
  prerequisites: ['lab-03-elementwise'],
  concepts: ['reducao', 'media', 'soma', 'eixo'],
  category: 'operations',
  memoryBudgetMB: 50,
  tags: ['operations'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que Operações de Redução?',
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
      config: { conceptId: 'reducao' },
    },
    {
      type: 'exemplo-visual',
      title: 'Veja na pratica',
      component: 'visualization',
      config: {
        visualizationType: 'matrix-heatmap',
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
