import type { LaboratoryConfig } from '@domain/content';

/** Temperaturas (°C) de três cidades ao longo de sete dias (linhas × dias). */
const CITY_TEMPERATURES = [
  [22, 23, 25, 24, 26, 27, 25], // São Paulo
  [30, 31, 32, 33, 32, 31, 30], // Rio de Janeiro
  [18, 17, 19, 20, 19, 18, 17], // Curitiba
];

const TENSOR_GRID_ACCESSIBILITY = {
  ariaLabel: 'Grade de tensor',
  dataTableAlternative: true,
  colorBlindSafe: true,
};

/** Laboratory 1: Fundamentos de Tensores. */
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
      title: 'Por que tensores?',
      component: 'markdown',
      config: {
        content: `## Por que tensores?

Todo modelo de Machine Learning trabalha com números organizados de alguma forma. Uma previsão de temperatura é **um número**, o histórico de uma cidade é **uma lista**, e várias cidades em vários dias formam **uma tabela**.

TensorFlow.js dá um nome a essas estruturas: **tensor**. Antes de treinar qualquer rede neural, você precisa entender como os dados são organizados — porque shapes incompatíveis são a causa número um de erros em código de ML.

Neste laboratório você vai representar temperaturas de cidades como tensores e inspecionar suas propriedades fundamentais: **rank**, **shape**, **size** e **dtype**.`,
      },
    },
    {
      type: 'conceito',
      title: 'O que é um tensor',
      component: 'concept-card',
      config: { conceptId: 'tensor' },
    },
    {
      type: 'analogia',
      title: 'Analogia: a planilha',
      component: 'markdown',
      config: {
        content: `## Uma caixa de valores

Imagine uma planilha:

- Uma **célula** isolada guarda um número → **escalar** (rank 0).
- Uma **linha** de células é uma lista → **vetor** (rank 1).
- A **planilha** inteira, com linhas e colunas, é uma tabela → **matriz** (rank 2).
- Uma **pilha de planilhas** adiciona uma terceira dimensão → tensor de **rank 3**.

O tensor não muda os dados: ele só descreve *quantas dimensões* existem e *quantos elementos* há em cada uma.`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'Temperaturas como tensor',
      component: 'visualization',
      config: {
        visualizationType: 'tensor-grid',
        initialData: {
          type: 'tensor-grid',
          title: 'Temperaturas (°C): 3 cidades × 7 dias',
          tensor: {
            shape: [3, 7],
            dtype: 'float32',
            values: CITY_TEMPERATURES.flat(),
            truncated: false,
          },
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'Do array ao shape',
      component: 'visualization',
      config: {
        visualizationType: 'tensor-grid',
        initialData: {
          type: 'tensor-grid',
          title: 'Array de 8 valores reorganizado como shape [2, 4]',
          tensor: {
            shape: [2, 4],
            dtype: 'float32',
            values: [1, 2, 3, 4, 5, 6, 7, 8],
            truncated: false,
          },
        },
      },
    },
    {
      type: 'experimentacao',
      title: 'Crie o seu tensor',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-01-create-tensor',
        parameters: [
          {
            name: 'values',
            type: 'string',
            label: 'Valores',
            defaultValue: '22, 23, 25, 24, 26, 27',
            description: 'Números separados por vírgula.',
            tfjsEquivalent: 'tf.tensor(values, shape, dtype)',
          },
          {
            name: 'shape',
            type: 'string',
            label: 'Shape',
            defaultValue: '2, 3',
            description:
              'Dimensões separadas por vírgula. O produto deve ser igual ao número de valores.',
            tfjsEquivalent: 'tf.tensor(...).shape',
          },
          {
            name: 'dtype',
            type: 'string',
            label: 'dtype',
            defaultValue: 'float32',
            options: [
              { value: 'float32', label: 'float32' },
              { value: 'int32', label: 'int32' },
            ],
            tfjsEquivalent: "tf.tensor(values, shape, 'float32' | 'int32')",
          },
        ],
        visualization: {
          type: 'tensor-grid',
          accessibility: TENSOR_GRID_ACCESSIBILITY,
        },
        defaultState: { values: '22, 23, 25, 24, 26, 27', shape: '2, 3', dtype: 'float32' },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: qual é o shape?',
      component: 'challenge',
      validation: {
        type: 'multiple-choice',
        criteria: {
          options: [
            { id: 'a', label: '[6]' },
            { id: 'b', label: '[2, 3]' },
            { id: 'c', label: '[3, 2]' },
            { id: 'd', label: '[2, 3, 1]' },
          ],
          correctOptionIds: ['b'],
        },
        hints: [
          'Conte quantas linhas e quantas colunas o array tem.',
          'Duas linhas e três colunas → [linhas, colunas].',
        ],
        showSolutionAfter: 3,
      },
    },
    {
      type: 'explicacao',
      title: 'Por que isso importa',
      component: 'markdown',
      config: {
        content: `## Lendo o shape

O array \`[[1, 2, 3], [4, 5, 6]]\` tem **2 linhas** e **3 colunas**, então seu shape é \`[2, 3]\`. O **rank** é 2 (dois eixos) e o **size** é 6 (2 × 3).

O TensorFlow.js lê o array "por fora para dentro": o primeiro número do shape é a dimensão mais externa. É por isso que \`[3, 2]\` estaria errado: seria 3 linhas de 2 elementos.

Sempre que um erro de shape aparecer, verifique primeiro se a **ordem das dimensões** corresponde à organização dos seus dados.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: criando tensores',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        'const temperatures = tf.tensor(',
        '  [22, 23, 25, 24, 26, 27],',
        '  [2, 3],',
        "  'float32',",
        ');',
        '',
        'console.log(temperatures.shape); // [2, 3]',
        'console.log(temperatures.rank); // 2',
        'console.log(temperatures.size); // 6',
        'console.log(temperatures.dtype); // float32',
      ].join('\n'),
      config: {
        essential:
          "const t = tf.tensor([22, 23, 25, 24, 26, 27], [2, 3], 'float32');",
        annotated: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          '// O array plano é reorganizado no shape [2 linhas, 3 colunas].',
          "const t = tf.tensor([22, 23, 25, 24, 26, 27], [2, 3], 'float32');",
          '',
          '// shape: [2, 3] | rank: 2 | size: 6 | dtype: float32',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          "const t = tf.tensor([22, 23, 25, 24, 26, 27], [2, 3], 'float32');",
          '',
          't.print();',
          '',
          '// Sempre libere tensores criados fora de tf.tidy.',
          't.dispose();',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- Um **tensor** é um array multidimensional com **shape** e **dtype**.
- **Rank** é o número de dimensões; **size** é o total de elementos.
- Escalar (rank 0), vetor (rank 1) e matriz (rank 2) são casos particulares.
- O shape é lido "de fora para dentro" e precisa combinar com a organização dos dados.

No próximo laboratório você vai **reorganizar** tensores com \`reshape\`, \`flatten\`, \`expandDims\` e \`squeeze\`.`,
      },
    },
  ],
};
