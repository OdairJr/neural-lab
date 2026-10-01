import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 1: Fundamentos de Tensores.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab01TensorsConfig: LaboratoryConfig = {
  id: 'lab-01-tensors',
  number: 1,
  slug: '01-fundamentos-de-tensores',
  title: 'Fundamentos de Tensores',
  description: 'O que são tensores, rank, shape, dtype e como os dados viram tensores.',
  estimatedMinutes: 20,
  prerequisites: [],
  concepts: ['tensor', 'escalar', 'vetor', 'matriz', 'rank', 'shape', 'size', 'dtype'],
  category: 'tensors',
  memoryBudgetMB: 50,
  tags: ['tensors'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que Fundamentos de Tensores?',
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
      config: { conceptId: 'tensor' },
    },
    {
      type: 'exemplo-visual',
      title: 'Veja na pratica',
      component: 'visualization',
      config: {
        visualizationType: 'tensor-grid',
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
