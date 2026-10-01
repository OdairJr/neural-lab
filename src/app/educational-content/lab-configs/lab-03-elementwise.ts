import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 3: Operações Elemento a Elemento.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab03ElementwiseConfig: LaboratoryConfig = {
  id: 'lab-03-elementwise',
  number: 3,
  slug: '03-operacoes-elemento-a-elemento',
  title: 'Operações Elemento a Elemento',
  description: 'adição, subtração, multiplicação, divisão, potência e raiz.',
  estimatedMinutes: 20,
  prerequisites: ['lab-02-manipulation'],
  concepts: ['operacoes-elementares', 'broadcasting'],
  category: 'operations',
  memoryBudgetMB: 50,
  tags: ['operations'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que Operações Elemento a Elemento?',
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
      config: { conceptId: 'operacoes-elementares' },
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
