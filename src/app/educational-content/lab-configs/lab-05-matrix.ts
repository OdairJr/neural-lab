import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 5: Operações Matriciais.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab05MatrixConfig: LaboratoryConfig = {
  id: 'lab-05-matrix',
  number: 5,
  slug: '05-operacoes-matriciais',
  title: 'Operações Matriciais',
  description: 'transpose e multiplicação de matrizes (matMul).',
  estimatedMinutes: 25,
  prerequisites: ['lab-04-reductions'],
  concepts: ['transpose', 'matMul', 'produto-escalar'],
  category: 'operations',
  memoryBudgetMB: 50,
  tags: ['operations'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que Operações Matriciais?',
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
      config: { conceptId: 'transpose' },
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
