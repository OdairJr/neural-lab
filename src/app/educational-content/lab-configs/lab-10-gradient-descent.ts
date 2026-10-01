import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 10: Descida do Gradiente.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab10GradientDescentConfig: LaboratoryConfig = {
  id: 'lab-10-gradient-descent',
  number: 10,
  slug: '10-descida-do-gradiente',
  title: 'Descida do Gradiente',
  description: 'Superfície de custo, gradiente, learning rate e convergência.',
  estimatedMinutes: 35,
  prerequisites: ['lab-09-linear-regression'],
  concepts: ['gradiente', 'learning-rate', 'convergencia', 'minimo-local'],
  category: 'ml',
  memoryBudgetMB: 50,
  tags: ['ml'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que Descida do Gradiente?',
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
      config: { conceptId: 'gradiente' },
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
