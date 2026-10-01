import type { LaboratoryConfig } from '@domain/content';

const LINE_CHART_ACCESSIBILITY = {
  ariaLabel: 'Gráfico de linhas da média diária',
  dataTableAlternative: true,
  colorBlindSafe: true,
};

const CITY_TEMPERATURES = [
  [22, 23, 25, 24, 26, 27, 25], // São Paulo
  [30, 31, 32, 33, 32, 31, 30], // Rio de Janeiro
  [18, 17, 19, 20, 19, 18, 17], // Curitiba
];
const CITY_LABELS = ['São Paulo', 'Rio de Janeiro', 'Curitiba'];
const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const DAILY_AVERAGE = [23.33, 23.67, 25.33, 25.67, 25.67, 25.33, 24];

/** Laboratory 4: Operações de Redução. */
export const lab04ReductionsConfig: LaboratoryConfig = {
  id: 'lab-04-reductions',
  number: 4,
  slug: '04-operacoes-de-reducao',
  title: 'Operações de Redução',
  description: 'sum, mean, min e max ao longo de eixos específicos.',
  estimatedMinutes: 20,
  prerequisites: ['lab-03-elementwise'],
  concepts: ['reducao', 'media', 'soma', 'eixo'],
  category: 'operations',
  memoryBudgetMB: 50,
  tags: ['operations'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Resumindo dados',
      component: 'markdown',
      config: {
        content: `## De muitos números a poucos

Uma tabela de temperaturas de 3 cidades × 7 dias tem 21 valores. Às vezes queremos **resumir**: qual foi a média diária? Qual a temperatura máxima de cada cidade?

Operações de **redução** transformam muitos valores em menos: \`sum\`, \`mean\`, \`min\` e \`max\`. A parte que confunde é o **eixo (axis)**: a mesma matriz reduzida no eixo 0 ou no eixo 1 dá resultados completamente diferentes.

Neste laboratório você vai reduzir a mesma tabela de temperaturas por diferentes eixos.`,
      },
    },
    {
      type: 'conceito',
      title: 'Conceito: redução',
      component: 'concept-card',
      config: { conceptId: 'reducao' },
    },
    {
      type: 'analogia',
      title: 'Analogia: somar colunas ou linhas',
      component: 'markdown',
      config: {
        content: `## Duas direções

Pense na planilha de temperaturas com **dias nas colunas** e **cidades nas linhas**:

- \`axis = 0\` "puxa para baixo": combina as cidades e sobra **um valor por dia**.
- \`axis = 1\` "puxa para o lado": combina os dias e sobra **um valor por cidade**.
- \`axis = -1\` significa **a última dimensão**, que aqui é a mesma coisa que \`axis = 1\`.

Escolher o eixo errado responde a pergunta errada.`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'A tabela completa',
      component: 'visualization',
      config: {
        visualizationType: 'matrix-heatmap',
        initialData: {
          type: 'matrix-heatmap',
          title: 'Temperaturas (°C): cidade × dia',
          matrix: CITY_TEMPERATURES,
          rowLabels: CITY_LABELS,
          columnLabels: DAY_LABELS,
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'Média diária (axis 0)',
      component: 'visualization',
      config: {
        visualizationType: 'line-chart',
        initialData: {
          type: 'line-chart',
          title: 'Média das cidades, dia a dia',
          series: [{ label: 'média diária', data: DAILY_AVERAGE }],
          xLabels: DAY_LABELS,
        },
      },
    },
    {
      type: 'experimentacao',
      title: 'Reduza por eixo',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-04-reductions',
        parameters: [
          {
            name: 'reducao',
            type: 'string',
            label: 'Redução',
            defaultValue: 'mean',
            options: [
              { value: 'sum', label: 'sum' },
              { value: 'mean', label: 'mean' },
              { value: 'min', label: 'min' },
              { value: 'max', label: 'max' },
            ],
            tfjsEquivalent: 'tf.sum | tf.mean | tf.min | tf.max',
          },
          {
            name: 'axis',
            type: 'number',
            label: 'Eixo',
            defaultValue: 0,
            min: -1,
            max: 1,
            step: 1,
            description: '0 = combina cidades (resultado por dia); 1 ou -1 = combina dias (resultado por cidade).',
            tfjsEquivalent: 'tf.mean(t, axis)',
          },
        ],
        visualization: {
          type: 'line-chart',
          accessibility: LINE_CHART_ACCESSIBILITY,
        },
        defaultState: { reducao: 'mean', axis: 0 },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: maior variância',
      component: 'challenge',
      validation: {
        type: 'multiple-choice',
        prompt:
          'Usando a tabela de temperaturas das 3 cidades, qual cidade apresenta a MAIOR variância (maior dispersão em torno da própria média)?',
        criteria: {
          options: [
            { id: 'sp', label: 'São Paulo' },
            { id: 'rio', label: 'Rio de Janeiro' },
            { id: 'cwb', label: 'Curitiba' },
            { id: 'same', label: 'As três têm a mesma variância' },
          ],
          correctOptionIds: ['sp'],
        },
        hints: [
          'Variância mede o quão longe os valores ficam da média.',
          'Rio e Curitiba têm exatamente a mesma variação dia a dia (diferem por uma constante).',
          'São Paulo alterna mais entre dias, então tem a maior variância.',
        ],
        showSolutionAfter: 3,
      },
    },
    {
      type: 'explicacao',
      title: 'Entendendo o axis',
      component: 'markdown',
      config: {
        content: `## O eixo determina o que sobra

A matriz tem shape \`[3, 7]\` (3 cidades, 7 dias):

- \`tf.mean(t, 0)\` combina as **3 cidades** → shape \`[7]\` (um valor por dia).
- \`tf.mean(t, 1)\` combina os **7 dias** → shape \`[3]\` (um valor por cidade).
- \`tf.mean(t, -1)\` é igual a \`tf.mean(t, 1)\`, pois -1 é a última dimensão.
- Sem o parâmetro \`axis\`, a redução acontece sobre **todos** os elementos e devolve um escalar.

Por isso a variância: São Paulo varia de 22 a 27, enquanto Rio e Curitiba variam de forma idêntica (apenas deslocadas por 12 °C). A variância de SP é maior.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: reduções por eixo',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        'const t = tf.tensor2d([',
        '  [22, 23, 25, 24, 26, 27, 25],',
        '  [30, 31, 32, 33, 32, 31, 30],',
        '  [18, 17, 19, 20, 19, 18, 17],',
        ']);',
        '',
        'tf.mean(t, 0).print(); // [7] média por dia',
        'tf.max(t, 1).print();  // [3] máxima por cidade',
      ].join('\n'),
      config: {
        essential: 'const mediaPorDia = tf.mean(t, 0);',
        annotated: [
          '// axis 0: combina as linhas (cidades) → um valor por dia.',
          'const mediaPorDia = tf.mean(t, 0); // [7]',
          '',
          '// axis 1: combina as colunas (dias) → um valor por cidade.',
          'const maximaPorCidade = tf.max(t, 1); // [3]',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          'const t = tf.tensor2d([',
          '  [22, 23, 25, 24, 26, 27, 25],',
          '  [30, 31, 32, 33, 32, 31, 30],',
          '  [18, 17, 19, 20, 19, 18, 17],',
          ']);',
          '',
          'const mediaPorDia = tf.mean(t, 0);',
          'const maximaPorCidade = tf.max(t, 1);',
          'mediaPorDia.print();',
          'maximaPorCidade.print();',
          '',
          't.dispose();',
          'mediaPorDia.dispose();',
          'maximaPorCidade.dispose();',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- Reduções transformam muitos valores em menos: \`sum\`, \`mean\`, \`min\`, \`max\`.
- O **axis** define ao longo de qual dimensão a agregação ocorre.
- \`axis=0\` combina as **linhas**; \`axis=1\` (ou \`-1\`) combina as **colunas**.
- Sem \`axis\`, o resultado é um escalar com a redução de todos os elementos.

Agora você sabe resumir dados. No próximo laboratório você vai **combinar** matrizes inteiras com \`transpose\` e \`matMul\`.`,
      },
    },
  ],
};
