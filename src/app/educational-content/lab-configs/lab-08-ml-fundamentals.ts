import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 8: Fundamentos de Machine Learning.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab08MlFundamentalsConfig: LaboratoryConfig = {
  id: 'lab-08-ml-fundamentals',
  number: 8,
  slug: '08-fundamentos-de-machine-learning',
  title: 'Fundamentos de Machine Learning',
  description: 'dataset, features, labels, treino/validação, loss, época e batch.',
  estimatedMinutes: 30,
  prerequisites: ['lab-07-linear-algebra'],
  concepts: ['dataset', 'feature', 'label', 'loss', 'epoca', 'batch', 'learning-rate'],
  category: 'ml',
  memoryBudgetMB: 50,
  tags: ['ml'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que Fundamentos de Machine Learning?',
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
      config: { conceptId: 'dataset' },
    },
    {
      type: 'exemplo-visual',
      title: 'Veja na pratica',
      component: 'visualization',
      config: {
        visualizationType: 'scatter-plot',
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
