import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 2: Manipulação de Tensores.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab02ManipulationConfig: LaboratoryConfig = {
  id: 'lab-02-manipulation',
  number: 2,
  slug: '02-manipulacao-de-tensores',
  title: 'Manipulação de Tensores',
  description: 'reshape, flatten, expandDims e squeeze para reorganizar dados.',
  estimatedMinutes: 20,
  prerequisites: ['lab-01-tensors'],
  concepts: ['reshape', 'flatten', 'expandDims', 'squeeze'],
  category: 'operations',
  memoryBudgetMB: 50,
  tags: ['operations'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que Manipulação de Tensores?',
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
      config: { conceptId: 'reshape' },
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
