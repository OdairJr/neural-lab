import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 14: Classificação e Fronteiras de Decisão.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab14ClassificationConfig: LaboratoryConfig = {
  id: 'lab-14-classification',
  number: 14,
  slug: '14-classificacao-e-fronteiras-de-decisao',
  title: 'Classificação e Fronteiras de Decisão',
  description: 'Classificação binária/multiclasse, fronteiras de decisão e o problema XOR.',
  estimatedMinutes: 40,
  prerequisites: ['lab-13-neural-networks'],
  concepts: ['classificacao', 'fronteira-de-decisao', 'xor'],
  category: 'neural-networks',
  memoryBudgetMB: 50,
  tags: ['neural-networks'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que Classificação e Fronteiras de Decisão?',
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
      config: { conceptId: 'classificacao' },
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
