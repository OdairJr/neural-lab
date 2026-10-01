import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 9: Regressão Linear.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab09LinearRegressionConfig: LaboratoryConfig = {
  id: 'lab-09-linear-regression',
  number: 9,
  slug: '09-regressao-linear',
  title: 'Regressão Linear',
  description: 'y = wx + b, MSE e ajuste de uma reta aos dados.',
  estimatedMinutes: 30,
  prerequisites: ['lab-08-ml-fundamentals'],
  concepts: ['regressao-linear', 'mse', 'predicao'],
  category: 'ml',
  memoryBudgetMB: 50,
  tags: ['ml'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que Regressão Linear?',
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
      config: { conceptId: 'regressao-linear' },
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
