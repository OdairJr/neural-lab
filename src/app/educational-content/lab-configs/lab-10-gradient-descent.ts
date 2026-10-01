import type { LaboratoryConfig } from '@domain/content';

/** Same tiny regression dataset used by Lab 9 (best fit w = 2, b = 1). */
export const GRADIENT_DESCENT_DATASET: readonly { x: number; y: number }[] = [
  { x: 1, y: 2 },
  { x: 2, y: 6 },
  { x: 3, y: 8 },
  { x: 4, y: 8 },
  { x: 5, y: 11 },
];

export const GRADIENT_DESCENT_OPTIMUM = { w: 2, b: 1 };

/** Learning-rate presets offered by the experiment. */
export const LEARNING_RATE_PRESETS = [0.0001, 0.001, 0.003, 0.01, 0.1, 0.5] as const;

/**
 * Precomputed `(w, b)` trajectories (starting at the origin) used by the static
 * "trajectory" visualization so learners can compare learning rates. Values are
 * illustrations generated from the batch gradient-descent update.
 */
export const TRAJECTORIES: readonly {
  label: string;
  color: string;
  points: readonly { x: number; y: number }[];
}[] = [
  {
    label: 'lr = 0,001 (lento)',
    color: '#0ea5e9',
    points: [
      { x: 0, y: 0 },
      { x: 0.05, y: 0.014 },
      { x: 0.099, y: 0.028 },
      { x: 0.146, y: 0.041 },
      { x: 0.193, y: 0.054 },
      { x: 0.238, y: 0.067 },
      { x: 0.283, y: 0.079 },
      { x: 0.326, y: 0.091 },
      { x: 0.368, y: 0.103 },
      { x: 0.41, y: 0.115 },
      { x: 0.45, y: 0.126 },
      { x: 0.489, y: 0.137 },
      { x: 0.528, y: 0.148 },
    ],
  },
  {
    label: 'lr = 0,003 (converge)',
    color: '#10b981',
    points: [
      { x: 0, y: 0 },
      { x: 0.15, y: 0.042 },
      { x: 0.289, y: 0.081 },
      { x: 0.419, y: 0.117 },
      { x: 0.539, y: 0.151 },
      { x: 0.651, y: 0.183 },
      { x: 0.755, y: 0.212 },
      { x: 0.851, y: 0.239 },
      { x: 0.94, y: 0.264 },
      { x: 1.024, y: 0.288 },
      { x: 1.101, y: 0.309 },
      { x: 1.173, y: 0.33 },
      { x: 1.239, y: 0.349 },
    ],
  },
  {
    label: 'lr = 0,05 (overshoot)',
    color: '#f97316',
    points: [
      { x: 0, y: 0 },
      { x: 2.5, y: 0.7 },
      { x: 2.04, y: 0.58 },
      { x: 2.122, y: 0.61 },
      { x: 2.105, y: 0.612 },
      { x: 2.106, y: 0.62 },
      { x: 2.104, y: 0.626 },
      { x: 2.102, y: 0.632 },
      { x: 2.1, y: 0.639 },
      { x: 2.098, y: 0.645 },
    ],
  },
  {
    label: 'lr = 0,1 (diverge)',
    color: '#e11d48',
    points: [
      { x: 0, y: 0 },
      { x: 5, y: 1.4 },
      { x: -1.84, y: -0.48 },
      { x: 7.5, y: 2.12 },
      { x: -5.27, y: -1.4 },
      { x: 12.16, y: 3.44 },
    ],
  },
];

/** MSE as a function of `w` with `b = 1` (a slice of the cost surface). */
const MSE_BOWL_W = [-1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const MSE_BOWL_VALUES = [
  99.8, 69.55, 44.8, 25.55, 11.8, 3.55, 0.8, 3.55, 11.8, 25.55, 44.8, 69.55, 99.8,
];

const LINE_CHART_ACCESSIBILITY = {
  ariaLabel: 'Curva do erro em função do aprendizado',
  dataTableAlternative: true,
  colorBlindSafe: true,
};

/** Laboratory 10: Descida do Gradiente. */
export const lab10GradientDescentConfig: LaboratoryConfig = {
  id: 'lab-10-gradient-descent',
  number: 10,
  slug: '10-descida-do-gradiente',
  title: 'Descida do Gradiente',
  description: 'Superfície de custo, gradiente, learning rate e convergência.',
  estimatedMinutes: 35,
  prerequisites: ['lab-09-linear-regression'],
  concepts: ['gradiente', 'learning-rate', 'convergencia', 'minimo-local'],
  category: 'ml',
  memoryBudgetMB: 50,
  tags: ['ml'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Deixando o gradiente trabalhar',
      component: 'markdown',
      config: {
        content: `## O robô que desce a montanha

Na regressão linear manual você ajustou \`w\` e \`b\` e viu o MSE cair. Mas como um programa encontra esses valores automaticamente, quando há milhares de parâmetros?

A resposta é a **descida do gradiente** (*gradient descent*). A ideia:

1. Calcule o **gradiente** do erro (a direção em que ele aumenta).
2. Dê um pequeno passo na direção **oposta**.
3. Repita.

O tamanho do passo é o **learning rate**. Se for pequeno demais, o treino demora; se for grande demais, ele **diverge**. Neste laboratório o treino roda em um **Web Worker**, sem travar a interface, e transmite o erro de cada **época** em tempo real.`,
      },
    },
    {
      type: 'conceito',
      title: 'Conceito: gradiente',
      component: 'concept-card',
      config: { conceptId: 'gradiente' },
    },
    {
      type: 'analogia',
      title: 'Analogia: a bola na tigela',
      component: 'markdown',
      config: {
        content: `## Rolando até o fundo

Imagine uma bola numa tigela. A **superfície de custo** tem a forma de uma tigela (um "bowl") porque a MSE é uma função quadrática de \`w\` e \`b\`.

- A **inclinação** da tigela sob a bola é o gradiente.
- A bola rola no sentido da descida.
- O **learning rate** é o tamanho do passo.

Passos minúsculos fazem a bola demorar; passos gigantes fazem a bola pular fora da tigela. Em problemas com "vales" irregulares, ela pode parar num **mínimo local** — mas a superfície do MSE é **convexa**, com um único mínimo global.`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'A superfície de custo (corte)',
      component: 'visualization',
      config: {
        visualizationType: 'line-chart',
        initialData: {
          type: 'line-chart',
          title: 'Corte da superfície de custo: MSE em função de w (b = 1)',
          series: [{ label: 'MSE', data: MSE_BOWL_VALUES }],
          xLabels: MSE_BOWL_W.map((value) => String(value)),
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'Trajetórias por learning rate',
      component: 'visualization',
      config: {
        visualizationType: 'scatter-plot',
        initialData: {
          type: 'scatter-plot',
          title: 'Trajetórias no plano (w, b) — partindo de (0, 0)',
          points: [{ x: 2, y: 1, label: 'mínimo (w=2, b=1)' }],
          lines: TRAJECTORIES.map((trajectory) => ({
            label: trajectory.label,
            color: trajectory.color,
            points: trajectory.points.map((point) => ({ ...point })),
          })),
          xLabel: 'w',
          yLabel: 'b',
        },
      },
    },
    {
      type: 'experimentacao',
      title: 'Treine e veja o erro por época',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-10-gradient-descent',
        parameters: [
          {
            name: 'lr',
            type: 'string',
            label: 'Learning rate',
            defaultValue: 0.003,
            options: LEARNING_RATE_PRESETS.map((value) => ({
              value,
              label: String(value),
            })),
            description: 'Passo de atualização dos parâmetros.',
            tfjsEquivalent: 'w = w - lr * dMSE/dw',
          },
          {
            name: 'epochs',
            type: 'number',
            label: 'Épocas',
            defaultValue: 50,
            min: 1,
            max: 200,
            step: 10,
            tfjsEquivalent: 'for (let epoch = 0; epoch < epochs; epoch++) { ... }',
          },
        ],
        visualization: {
          type: 'line-chart',
          accessibility: LINE_CHART_ACCESSIBILITY,
        },
        defaultState: { lr: 0.003, epochs: 50 },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: escolha o learning rate',
      component: 'challenge',
      validation: {
        type: 'multiple-choice',
        prompt:
          'Qual learning rate faz o treino convergir em MENOS de 50 épocas, sem overshoot (a trajetória de (w, b) não ultrapassa o mínimo e depois volta)?',
        criteria: {
          options: [
            { id: 'a', label: '0,0001' },
            { id: 'b', label: '0,003' },
            { id: 'c', label: '0,1' },
            { id: 'd', label: '1,0' },
          ],
          correctOptionIds: ['b'],
        },
        hints: [
          'Learning rates muito pequenos exigem centenas de épocas.',
          'Valores grandes demais fazem o erro crescer (divergência).',
          '0,003 converge em cerca de 40 épocas sem ultrapassar o mínimo.',
        ],
        showSolutionAfter: 3,
      },
    },
    {
      type: 'explicacao',
      title: 'Convergência e divergência',
      component: 'markdown',
      config: {
        content: `## O que controla a estabilidade

A atualização é

\`\`\`
w ← w - lr · ∂MSE/∂w
b ← b - lr · ∂MSE/∂b
\`\`\`

Se \`lr\` for **pequeno**, cada passo é minúsculo e são necessárias muitas épocas. Se \`lr\` for **grande**, o passo passa do fundo da tigela e o erro aumenta a cada época até \`Infinity\` — a **divergência**.

Existe uma faixa estável que depende da curvatura da função de custo. Para este dataset:

- \`lr = 0,001\`: converge, mas leva mais de 100 épocas.
- \`lr = 0,003\`: converge em ~40 épocas, sem overshoot.
- \`lr = 0,1\`: diverge rapidamente.

Na prática, técnicas como *normalização das features* e *learning-rate schedules* alargam a faixa estável.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: descida do gradiente',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        'const xs = tf.tensor1d([1, 2, 3, 4, 5]);',
        'const ys = tf.tensor1d([2, 6, 8, 8, 11]);',
        '',
        'let w = 0;',
        'let b = 0;',
        'const lr = 0.003;',
        '',
        'for (let epoch = 0; epoch < 40; epoch++) {',
        '  const { value, grads } = tf.variableGrads(() => {',
        '    const errors = tf.sub(tf.add(tf.mul(xs, w), b), ys);',
        '    return tf.mean(tf.square(errors));',
        '  });',
        '  w -= lr * grads["w"].dataSync()[0];',
        '  b -= lr * grads["b"].dataSync()[0];',
        '  tf.dispose([value, grads["w"], grads["b"]]);',
        '}',
      ].join('\n'),
      config: {
        essential: 'w -= lr * dw; b -= lr * db;',
        annotated: [
          '// Uma época = calcular o gradiente e dar um passo.',
          'const { dw, db } = mseGradients(data, w, b);',
          'w -= lr * dw;',
          'b -= lr * db;',
          '',
          '// Repita por várias épocas (aqui em um Web Worker).',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          'const xs = tf.tensor1d([1, 2, 3, 4, 5]);',
          'const ys = tf.tensor1d([2, 6, 8, 8, 11]);',
          '',
          'let w = 0;',
          'let b = 0;',
          'const lr = 0.003;',
          '',
          'for (let epoch = 0; epoch < 40; epoch++) {',
          '  const predictions = tf.add(tf.mul(xs, w), b);',
          '  const errors = tf.sub(predictions, ys);',
          '  const dw = tf.mul(tf.mean(tf.mul(errors, xs)), 2).dataSync()[0];',
          '  const db = tf.mul(tf.mean(errors), 2).dataSync()[0];',
          '  w -= lr * dw;',
          '  b -= lr * db;',
          '  tf.dispose([predictions, errors]);',
          '}',
          '',
          'xs.dispose(); ys.dispose();',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- A **descida do gradiente** minimiza o custo repetindo \`parâmetro -= lr · gradiente\`.
- O **learning rate** controla o tamanho do passo: pequeno demora, grande diverge.
- A **convergência** é o erro estabilizar; a **divergência** é o erro crescer sem limite.
- O treino roda em um **Web Worker** e transmite métricas por época, mantendo a interface responsiva.

Você concluiu a fase de **ML e Regressão**. Nos próximos laboratórios os mesmos passos vão treinar **neurônios** e redes neurais.`,
      },
    },
  ],
};
