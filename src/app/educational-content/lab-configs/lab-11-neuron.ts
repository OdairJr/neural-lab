import type { LaboratoryConfig } from '@domain/content';

/**
 * Two linearly separable clusters of 2D points for Lab 11. The target neuron
 * `z = w1·x + w2·y + b` with `(w1, w2, b) = (1, 1, -1)` draws the decision line
 * `x + y = 1`, with class 0 below it and class 1 above it.
 */
export const NEURON_CLUSTERS: readonly { x: number; y: number; label: number }[] = [
  { x: 0, y: 0, label: 0 },
  { x: 1, y: -0.5, label: 0 },
  { x: -0.5, y: 1, label: 0 },
  { x: 0.5, y: 0.2, label: 0 },
  { x: 0.2, y: 0.5, label: 0 },
  { x: 2, y: 2, label: 1 },
  { x: 3, y: 1, label: 1 },
  { x: 1, y: 3, label: 1 },
  { x: 2.5, y: 2.5, label: 1 },
  { x: 1.5, y: 2, label: 1 },
];

/** The clean separating solution used by the challenge and the demo. */
export const NEURON_TARGET = { w1: 1, w2: 1, b: -1 } as const;

const SCATTER_ACCESSIBILITY = {
  ariaLabel: 'Dispersão de pontos com a reta de decisão do neurônio',
  dataTableAlternative: true,
  colorBlindSafe: true,
};

/** Laboratory 11: O Neurônio. */
export const lab11NeuronConfig: LaboratoryConfig = {
  id: 'lab-11-neuron',
  number: 11,
  slug: '11-o-neuronio',
  title: 'O Neurônio',
  description: 'Entradas, pesos, bias, soma ponderada e ativação.',
  estimatedMinutes: 30,
  prerequisites: ['lab-10-gradient-descent'],
  concepts: ['neuronio', 'peso', 'bias', 'soma-ponderada', 'ativacao'],
  category: 'neural-networks',
  memoryBudgetMB: 50,
  tags: ['neural-networks'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Do gradiente ao neurônio',
      component: 'markdown',
      config: {
        content: `## A menor unidade que "decide"

Você já sabe ajustar pesos com a **descida do gradiente**. Agora vamos montar a peça que compõe qualquer rede neural: o **neurônio artificial**.

Um neurônio recebe entradas, combina-as com **pesos** e um **bias**, e aplica uma **ativação**. O resultado é uma saída — no nosso caso, a probabilidade de um ponto pertencer a uma classe.

Neste laboratório você vai ajustar \`w1\`, \`w2\` e \`b\` e ver a **reta de decisão** girar e deslizar até separar dois grupos de pontos.`,
      },
    },
    {
      type: 'conceito',
      title: 'Conceito: neurônio',
      component: 'concept-card',
      config: { conceptId: 'neuronio' },
    },
    {
      type: 'analogia',
      title: 'Analogia: a votação ponderada',
      component: 'markdown',
      config: {
        content: `## Uma votação com pesos

Imagine três pessoas votando se um ponto pertence ao grupo "azul":

- Cada voto tem um **peso** (importância).
- Há um **bias**: uma opinião inicial que soma mesmo sem votos.
- O total passa por um limiar: se for alto o bastante, a resposta é "azul".

A **soma ponderada** é a contagem; o **bias** desloca o limiar; a **ativação** suaviza a decisão. Com duas entradas, a fronteira de decisão é uma **reta**.`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'O neurônio por dentro',
      component: 'visualization',
      config: {
        visualizationType: 'network-graph',
        initialData: {
          type: 'network-graph',
          title: 'Duas entradas (x1, x2) → pesos → soma ponderada + bias → sigmoid → saída',
          layers: [
            { size: 2, activation: 'entrada' },
            { size: 1, activation: 'sigmoid' },
          ],
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'A curva da ativação sigmoid',
      component: 'visualization',
      config: {
        visualizationType: 'activation-curve',
        initialData: {
          type: 'activation-curve',
          fn: 'sigmoid',
          xRange: [-6, 6],
          showDerivative: true,
        },
      },
    },
    {
      type: 'experimentacao',
      title: 'Ajuste os pesos do neurônio',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-11-neuron',
        parameters: [
          {
            name: 'w1',
            type: 'number',
            label: 'Peso w1',
            defaultValue: 0.5,
            min: -3,
            max: 3,
            step: 0.25,
            tfjsEquivalent: 'z = tf.add(tf.mul(x1, w1), tf.mul(x2, w2))',
          },
          {
            name: 'w2',
            type: 'number',
            label: 'Peso w2',
            defaultValue: 0.5,
            min: -3,
            max: 3,
            step: 0.25,
          },
          {
            name: 'b',
            type: 'number',
            label: 'Bias b',
            defaultValue: 0,
            min: -5,
            max: 2,
            step: 0.25,
          },
        ],
        visualization: {
          type: 'scatter-plot',
          accessibility: SCATTER_ACCESSIBILITY,
        },
        defaultState: { w1: 0.5, w2: 0.5, b: 0 },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: separe os dois grupos',
      component: 'challenge',
      validation: {
        type: 'parameter-match',
        prompt:
          'Encontre pesos e bias que coloquem a reta de decisão exatamente sobre x₁ + x₂ = 1, separando os dois grupos.',
        criteria: { target: { w1: 1, w2: 1, b: -1 } },
        hints: [
          'A fronteira é o conjunto de pontos em que a soma ponderada é zero: w1·x1 + w2·x2 + b = 0.',
          'Para a reta x1 + x2 = 1, os pesos são iguais e positivos.',
          'A solução é w1 = 1, w2 = 1, b = -1.',
        ],
        showSolutionAfter: 3,
      },
    },
    {
      type: 'explicacao',
      title: 'Por baixo dos panos: soma + ativação',
      component: 'markdown',
      config: {
        content: `## Passo a passo de um neurônio

Para cada ponto \`(x1, x2)\`:

\`\`\`
z = w1·x1 + w2·x2 + b      (soma ponderada)
a = sigmoid(z)              (ativação)
classe = a >= 0.5 ? 1 : 0   (decisão)
\`\`\`

A **fronteira de decisão** fica onde \`z = 0\`. A ativação **sigmoid** transforma \`z\` numa probabilidade entre 0 e 1.

Abra o painel "Por baixo dos panos" durante o experimento para ver a soma ponderada e a ativação de cada ponto.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: um neurônio com TF.js',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        'const xs = tf.tensor2d([[0, 0], [2, 2], [1, 3]]);',
        '',
        'const neuron = tf.layers.dense({ units: 1, activation: "sigmoid" });',
        'const output = neuron.apply(xs) as tf.Tensor;',
        'output.print();',
        '',
        'xs.dispose(); output.dispose();',
      ].join('\n'),
      config: {
        essential: 'const z = tf.add(tf.matMul(xs, w), b); const a = tf.sigmoid(z);',
        annotated: [
          '// Entradas: cada linha é um ponto (x1, x2).',
          'const xs = tf.tensor2d([[0, 0], [2, 2]]);',
          '',
          '// Soma ponderada + bias, seguida da ativação.',
          'const z = tf.add(tf.matMul(xs, w), b);',
          'const a = tf.sigmoid(z);',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          'const xs = tf.tensor2d([[0, 0], [2, 2], [1, 3]]);',
          'const w = tf.tensor2d([[1], [1]]);',
          'const b = tf.scalar(-1);',
          '',
          'const z = tf.tidy(() => tf.add(tf.matMul(xs, w), b));',
          'const a = tf.tidy(() => tf.sigmoid(z));',
          'a.print();',
          '',
          'xs.dispose(); w.dispose(); b.dispose(); z.dispose(); a.dispose();',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- Um **neurônio** calcula \`a = f(Σ wᵢxᵢ + b)\`: soma ponderada e ativação.
- **Pesos** controlam a influência de cada entrada; o **bias** desloca a fronteira.
- A **ativação** (sigmoid) transforma \`z\` em probabilidade.
- Com duas entradas, a **fronteira de decisão** é uma reta (\`z = 0\`).

No próximo laboratório você compara as principais funções de ativação e descobre quando usar cada uma.`,
      },
    },
  ],
};
