import type { LaboratoryConfig } from '@domain/content';

/**
 * Laboratory 16: Gerenciamento de Memória.
 *
 * Phase 1 stub: contains the stage skeleton so the lab shell, stage renderer
 * and content validator have real data to work with. Rich content (real
 * visualizations, experiments and challenges) is authored in later phases.
 */
export const lab16MemoryConfig: LaboratoryConfig = {
  id: 'lab-16-memory',
  number: 16,
  slug: '16-gerenciamento-de-memoria',
  title: 'Gerenciamento de Memória',
  description: 'tf.memory(), tf.dispose(), tf.tidy() e boas práticas contra vazamentos.',
  estimatedMinutes: 30,
  prerequisites: ['lab-15-images'],
  concepts: ['memoria', 'dispose', 'tidy', 'vazamento'],
  category: 'memory',
  memoryBudgetMB: 50,
  tags: ['memory'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que Gerenciamento de Memória?',
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
      config: { conceptId: 'memoria' },
    },
    {
      type: 'exemplo-visual',
      title: 'Veja na pratica',
      component: 'visualization',
      config: {
        visualizationType: 'memory-timeline',
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
