import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 15: Imagens como Tensores.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab15ImagesConfig: LaboratoryConfig = {
  id: 'lab-15-images',
  number: 15,
  slug: '15-imagens-como-tensores',
  title: 'Imagens como Tensores',
  description: 'Imagem → pixels → tensor, canais RGB, grayscale, resize e normalização.',
  estimatedMinutes: 35,
  prerequisites: ['lab-14-classification'],
  concepts: ['imagem', 'rgb', 'grayscale', 'normalizacao'],
  category: 'images',
  memoryBudgetMB: 50,
  tags: ['images'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que Imagens como Tensores?',
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
      config: { conceptId: 'imagem' },
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
