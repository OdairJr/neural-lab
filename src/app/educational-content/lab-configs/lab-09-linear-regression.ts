import type { LaboratoryConfig } from '@domain/content';

/**
 * Tiny regression dataset: house size (`x`) versus price (`y`). Chosen so the
 * least-squares fit is exactly w = 2, b = 1 with MSE = 0.8, giving learners
 * clean target values to reason about.
 */
export const REGRESSION_DATASET: readonly { x: number; y: number }[] = [
  { x: 1, y: 2 },
  { x: 2, y: 6 },
  { x: 3, y: 8 },
  { x: 4, y: 8 },
  { x: 5, y: 11 },
];

export const REGRESSION_BEST_FIT = { w: 2, b: 1 };
export const REGRESSION_BEST_MSE = 0.8;

/** MSE as a function of `w` with `b = 1`, sampled for the cost curve. */
const MSE_CURVE_W = [-1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const MSE_CURVE_VALUES = [
  99.8, 69.55, 44.8, 25.55, 11.8, 3.55, 0.8, 3.55, 11.8, 25.55, 44.8, 69.55, 99.8,
];

const SCATTER_ACCESSIBILITY = {
  ariaLabel: 'Gráfico de dispersão com reta de regressão',
  dataTableAlternative: true,
  colorBlindSafe: true,
};

/** Laboratory 9: Regressão Linear. */
export const lab09LinearRegressionConfig: LaboratoryConfig = {
  id: 'lab-09-linear-regression',
  number: 9,
  slug: '09-regressao-linear',
  title: 'Regressão Linear',
  description: 'y = wx + b, MSE e ajuste de uma reta aos dados.',
  estimatedMinutes: 30,
  prerequisites: ['lab-08-ml-fundamentals'],
  concepts: ['regressao-linear', 'mse', 'predicao'],
  category: 'ml',
  memoryBudgetMB: 50,
  tags: ['ml'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Ajustando uma reta',
      component: 'markdown',
      config: {
        content: `## Prever um número

Muitos problemas de Machine Learning pedem um **número** como resposta: o preço de uma casa, a temperatura de amanhã, o consumo de energia. O modelo mais simples para isso é a **regressão linear**: uma reta \`ŷ = w·x + b\`.

- \`w\` (peso) é a **inclinação**: quanto \`y\` muda quando \`x\` aumenta 1.
- \`b\` (viés) é o **intercepto**: o valor previsto quando \`x = 0\`.

Neste laboratório você vai ajustar \`w\` e \`b\` manualmente e ver o erro mudar — antes de, no próximo laboratório, deixar o **gradiente** encontrar esses valores sozinho.`,
      },
    },
    {
      type: 'conceito',
      title: 'Conceito: regressão linear',
      component: 'concept-card',
      config: { conceptId: 'regressao-linear' },
    },
    {
      type: 'analogia',
      title: 'Analogia: a régua',
      component: 'markdown',
      config: {
        content: `## A régua que passa pelos pontos

Imagine uma régua transparente sobre um gráfico de pontos:

- **Inclinar** a régua muda \`w\`.
- **Subir ou descer** a régua inteira muda \`b\`.

Queremos a posição em que as distâncias verticais entre os pontos e a régua sejam as menores possíveis. Essas distâncias são os **resíduos**, e a média dos seus quadrados é o **MSE**.

O melhor ajuste é aquele que minimiza o MSE.`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'Dados e melhor reta',
      component: 'visualization',
      config: {
        visualizationType: 'scatter-plot',
        initialData: {
          type: 'scatter-plot',
          title: 'A melhor reta: ŷ = 2x + 1 (MSE = 0,8)',
          points: REGRESSION_DATASET.map((point) => ({ ...point, label: 'dados' })),
          lines: [
            {
              label: 'reta ajustada',
              color: '#111827',
              points: [
                { x: 1, y: 3 },
                { x: 5, y: 11 },
              ],
            },
          ],
          xLabel: 'x (tamanho)',
          yLabel: 'y (preço)',
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'A curva do erro',
      component: 'visualization',
      config: {
        visualizationType: 'line-chart',
        initialData: {
          type: 'line-chart',
          title: 'MSE em função de w (com b = 1)',
          series: [{ label: 'MSE', data: MSE_CURVE_VALUES }],
          xLabels: MSE_CURVE_W.map((value) => String(value)),
        },
      },
    },
    {
      type: 'experimentacao',
      title: 'Ajuste a reta',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-09-linear-fit',
        parameters: [
          {
            name: 'w',
            type: 'number',
            label: 'Peso w (inclinação)',
            defaultValue: 0,
            min: -2,
            max: 4,
            step: 0.25,
            tfjsEquivalent: 'pred = tf.mul(x, w)',
          },
          {
            name: 'b',
            type: 'number',
            label: 'Viés b (intercepto)',
            defaultValue: 0,
            min: -4,
            max: 6,
            step: 0.25,
            tfjsEquivalent: 'pred = tf.add(tf.mul(x, w), b)',
          },
        ],
        visualization: {
          type: 'scatter-plot',
          accessibility: SCATTER_ACCESSIBILITY,
        },
        defaultState: { w: 0, b: 0 },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: encontre a melhor reta',
      component: 'challenge',
      validation: {
        type: 'parameter-match',
        prompt:
          'Ajuste w e b até o MSE ficar abaixo de 1,0. Informe o par que minimiza o erro quadrático médio para o dataset mostrado (a solução é exata).',
        criteria: { target: { w: 2, b: 1 } },
        hints: [
          'O MSE cai até um ponto de mínimo e volta a subir: procure o fundo da parábola.',
          'Com b = 1, o MSE é mínimo quando w = 2 (a curva do erro mostra isso).',
          'A melhor reta é ŷ = 2x + 1.',
        ],
        showSolutionAfter: 3,
      },
    },
    {
      type: 'explicacao',
      title: 'O gradiente do MSE',
      component: 'markdown',
      config: {
        content: `## De onde vem a direção de melhora

O MSE médio é

\`\`\`
MSE = (1/n) Σ (ŷᵢ - yᵢ)²,  com ŷᵢ = w·xᵢ + b
\`\`\`

As derivadas parciais em relação a \`w\` e \`b\` são:

\`\`\`
∂MSE/∂w = (2/n) Σ (ŷᵢ - yᵢ)·xᵢ
∂MSE/∂b = (2/n) Σ (ŷᵢ - yᵢ)
\`\`\`

O **gradiente** aponta para onde o erro **aumenta**. Para diminuir o erro, damos um passo no sentido contrário:

\`\`\`
w ← w - lr · ∂MSE/∂w
b ← b - lr · ∂MSE/∂b
\`\`\`

Abra o painel "Por baixo dos panos" durante o experimento para ver os resíduos e os gradientes calculados. No próximo laboratório é exatamente esse passo que será repetido muitas vezes.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: MSE e gradientes',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        'const xs = tf.tensor1d([1, 2, 3, 4, 5]);',
        'const ys = tf.tensor1d([2, 6, 8, 8, 11]);',
        '',
        'const w = 0;',
        'const b = 0;',
        'const predictions = tf.add(tf.mul(xs, w), b);',
        'const errors = tf.sub(predictions, ys);',
        'const mse = tf.mean(tf.square(errors));',
        '',
        'const dw = tf.mean(tf.mul(errors, xs)).mul(2);',
        'const db = tf.mean(errors).mul(2);',
      ].join('\n'),
      config: {
        essential: 'const mse = tf.mean(tf.square(tf.sub(predictions, ys)));',
        annotated: [
          '// Predições e resíduos.',
          'const predictions = tf.add(tf.mul(xs, w), b);',
          'const errors = tf.sub(predictions, ys);',
          '',
          '// MSE e seus gradientes em relação a w e b.',
          'const mse = tf.mean(tf.square(errors));',
          'const dw = tf.mul(tf.mean(tf.mul(errors, xs)), 2);',
          'const db = tf.mul(tf.mean(errors), 2);',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          'const xs = tf.tensor1d([1, 2, 3, 4, 5]);',
          'const ys = tf.tensor1d([2, 6, 8, 8, 11]);',
          '',
          'const w = 0;',
          'const b = 0;',
          '',
          'const mse = tf.tidy(() => {',
          '  const predictions = tf.add(tf.mul(xs, w), b);',
          '  const errors = tf.sub(predictions, ys);',
          '  return tf.mean(tf.square(errors));',
          '});',
          '',
          'mse.print();',
          'xs.dispose(); ys.dispose(); mse.dispose();',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- A **regressão linear** prevê \`ŷ = w·x + b\`.
- O **MSE** mede o erro médio ao quadrado e forma uma parábola em \`w\`.
- **Resíduos** são as distâncias verticais \`ŷ - y\`.
- O **gradiente** do MSE indica como ajustar \`w\` e \`b\` para reduzir o erro.

No próximo laboratório o gradiente vai atualizar os parâmetros automaticamente, repetidamente: a **descida do gradiente**.`,
      },
    },
  ],
};
