import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 6: Broadcasting.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab06BroadcastingConfig: LaboratoryConfig = {
  id: 'lab-06-broadcasting',
  number: 6,
  slug: '06-broadcasting',
  title: 'Broadcasting',
  description: 'Regras de broadcast, formas compatíveis e expansão implícita.',
  estimatedMinutes: 25,
  prerequisites: ['lab-05-matrix'],
  concepts: ['broadcasting', 'shape'],
  category: 'operations',
  memoryBudgetMB: 50,
  tags: ['operations'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que Broadcasting?',
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
      config: { conceptId: 'broadcasting' },
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
