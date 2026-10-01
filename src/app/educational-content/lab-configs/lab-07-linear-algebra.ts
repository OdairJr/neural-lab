import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 7: Álgebra Linear Aplicada.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab07LinearAlgebraConfig: LaboratoryConfig = {
  id: 'lab-07-linear-algebra',
  number: 7,
  slug: '07-algebra-linear-aplicada',
  title: 'Álgebra Linear Aplicada',
  description: 'Vetores, produto escalar e transformações lineares em 2D.',
  estimatedMinutes: 30,
  prerequisites: ['lab-06-broadcasting'],
  concepts: ['transformacao-linear', 'produto-escalar', 'vetor'],
  category: 'operations',
  memoryBudgetMB: 50,
  tags: ['operations'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que Álgebra Linear Aplicada?',
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
      config: { conceptId: 'transformacao-linear' },
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
