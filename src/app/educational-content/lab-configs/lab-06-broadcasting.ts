import type { LaboratoryConfig } from '@domain/content';

const TENSOR_GRID_ACCESSIBILITY = {
  ariaLabel: 'Grade de tensor',
  dataTableAlternative: true,
  colorBlindSafe: true,
};

const CELSIUS = [
  [22, 23, 25, 24, 26, 27, 25], // São Paulo
  [30, 31, 32, 33, 32, 31, 30], // Rio de Janeiro
  [18, 17, 19, 20, 19, 18, 17], // Curitiba
];
const CALIBRATED = [
  [21, 22, 24, 23, 25, 26, 24],
  [30, 31, 32, 33, 32, 31, 30],
  [19, 18, 20, 21, 20, 19, 18],
];

/** Laboratory 6: Broadcasting. */
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
      title: 'Shapes diferentes, mesma operação',
      component: 'markdown',
      config: {
        content: `## O TensorFlow.js "inventa" dimensões

No laboratório anterior, um vetor de preços \`[4]\` se combinou com uma matriz \`[3, 4]\`. Nós não escrevemos nenhum loop — o TensorFlow.js **esticou** o vetor automaticamente. Esse mecanismo se chama **broadcasting**.

Ele evita código repetitivo e é essencial para converter unidades (Celsius → Fahrenheit) ou aplicar correções por cidade/coluna. Mas também é uma fonte silenciosa de bugs: um broadcast inesperado pode produzir um shape errado sem lançar erro.

Neste laboratório você vai entender as regras de alinhamento e prever o shape de saída.`,
      },
    },
    {
      type: 'conceito',
      title: 'Conceito: broadcasting',
      component: 'concept-card',
      config: { conceptId: 'broadcasting' },
    },
    {
      type: 'analogia',
      title: 'Analogia: alinhando à direita',
      component: 'markdown',
      config: {
        content: `## Compare da direita para a esquerda

Coloque os dois shapes um embaixo do outro, alinhados pela **direita**:

\`\`\`
    3  7
       7
\`\`\`

Regras para cada par de dimensões:

- Iguais → ok.
- Uma delas é 1 → ela é **esticada**.
- Faltando (tratada como 1) → também é esticada.

Se alguma dimensão for diferente de 1 e da outra, o TensorFlow.js lança erro de incompatibilidade.`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'Temperaturas em Celsius: [3, 7]',
      component: 'visualization',
      config: {
        visualizationType: 'tensor-grid',
        initialData: {
          type: 'tensor-grid',
          title: 'Celsius — shape [3, 7]',
          tensor: {
            shape: [3, 7],
            dtype: 'float32',
            values: CELSIUS.flat(),
            truncated: false,
          },
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'Matriz + vetor alinhado',
      component: 'visualization',
      config: {
        visualizationType: 'tensor-grid',
        initialData: {
          type: 'tensor-grid',
          title: '[3, 7] + [3, 1] → [3, 7] (correção por cidade)',
          tensor: {
            shape: [3, 7],
            dtype: 'float32',
            values: CALIBRATED.flat(),
            truncated: false,
          },
        },
      },
    },
    {
      type: 'experimentacao',
      title: 'Celsius → Fahrenheit',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-06-broadcasting',
        parameters: [
          {
            name: 'modo',
            type: 'string',
            label: 'Modo de broadcast',
            defaultValue: 'vetor-escalar',
            options: [
              { value: 'vetor-escalar', label: 'vetor [4] × escalar' },
              { value: 'matriz-vetor', label: 'matriz [3, 7] + vetor [3, 1]' },
            ],
            tfjsEquivalent: 'tf.mul(vetor, 1.8) + 32 | tf.add(matriz, correcao)',
          },
        ],
        visualization: {
          type: 'tensor-grid',
          accessibility: TENSOR_GRID_ACCESSIBILITY,
        },
        defaultState: { modo: 'vetor-escalar' },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: preveja o shape',
      component: 'challenge',
      validation: {
        type: 'multiple-choice',
        prompt:
          'Analise os 5 cenários de broadcast abaixo e escolha o único em que o shape de saída está CORRETO.',
        criteria: {
          options: [
            { id: 'a', label: '[3, 1] + [1, 4] → [3, 4]' },
            { id: 'b', label: '[2, 3] + [3, 2] → [2, 2]' },
            { id: 'c', label: '[5] + [3, 5] → [5]' },
            { id: 'd', label: '[2, 3] + [2, 1] → [2, 1]' },
            { id: 'e', label: '[4, 2] + [3, 2] → [4, 2]' },
          ],
          correctOptionIds: ['a'],
        },
        hints: [
          'Alinhe os shapes pela direita e compare cada dimensão.',
          'Uma dimensão 1 combina com qualquer outra e determina o tamanho final.',
          'Em (c), [5] é tratado como [1, 5] e vira [3, 5]; em (d), [2, 1] vira [2, 3].',
        ],
        showSolutionAfter: 3,
      },
    },
    {
      type: 'explicacao',
      title: 'Alinhando as dimensões',
      component: 'markdown',
      config: {
        content: `## Exemplos passo a passo

- \`[3, 1] + [1, 4]\` → \`[3, 4]\`: cada dimensão 1 é esticada para o tamanho da outra.
- \`[2, 3] + [3, 2]\` → **erro**: 3 e 2 não combinam na última dimensão.
- \`[5] + [3, 5]\` → \`[3, 5]\`: o vetor \`[5]\` é tratado como \`[1, 5]\` e repetido 3 vezes.
- \`[2, 3] + [2, 1]\` → \`[2, 3]\`: a coluna única é repetida 3 vezes.
- \`[4, 2] + [3, 2]\` → **erro**: 4 e 3 não combinam.

No experimento, \`vetor [4]\` e um escalar produzem \`[4]\` porque o escalar é tratado como shape \`[]\` e se expande para qualquer shape. Já \`[3, 1]\` com \`[3, 7]\` resulta em \`[3, 7]\`.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: broadcast na conversão',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        "const celsius = tf.tensor1d([0, 10, 20, 30]);",
        'const fahrenheit = tf.add(tf.mul(celsius, 1.8), 32); // [4]',
        '',
        'const matriz = tf.tensor2d([[22, 23, 25, 24, 26, 27, 25]]);',
        'const correcao = tf.tensor2d([[1], [2], [3]]); // [3, 1]',
        'const calibrada = tf.add(matriz, correcao); // [3, 7]',
      ].join('\n'),
      config: {
        essential: 'const fahrenheit = tf.add(tf.mul(celsius, 1.8), 32);',
        annotated: [
          '// O escalar 32 é tratado como shape [] e se expande para [4].',
          'const fahrenheit = tf.add(tf.mul(celsius, 1.8), 32);',
          '',
          '// [3, 1] é repetido em todas as colunas: matriz + correcao → [3, 7].',
          'const calibrada = tf.add(matriz, correcao);',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          'const celsius = tf.tensor1d([0, 10, 20, 30]);',
          'const fahrenheit = tf.add(tf.mul(celsius, 1.8), 32);',
          '',
          'const matriz = tf.tensor2d([[22, 23, 25, 24, 26, 27, 25]]);',
          'const correcao = tf.tensor2d([[1], [2], [3]]);',
          'const calibrada = tf.add(matriz, correcao);',
          '',
          'fahrenheit.print();',
          'calibrada.print();',
          '',
          'celsius.dispose(); fahrenheit.dispose();',
          'matriz.dispose(); correcao.dispose(); calibrada.dispose();',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- Broadcasting alinha shapes **da direita para a esquerda**.
- Dimensões iguais ou de tamanho 1 são compatíveis; a de tamanho 1 é esticada.
- Escalares têm shape \`[]\` e se expandem para qualquer shape.
- Broadcasting substitui loops, mas exige atenção ao shape de saída.

No próximo laboratório você vai usar vetores e matrizes para **transformar** pontos no plano — a base geométrica das redes neurais.`,
      },
    },
  ],
};
