import type { LaboratoryConfig } from '@domain/content';

const ACTIVATION_ACCESSIBILITY = {
  ariaLabel: 'Curva das funções de ativação',
  dataTableAlternative: true,
  colorBlindSafe: true,
};

/** Laboratory 12: Funções de Ativação. */
export const lab12ActivationsConfig: LaboratoryConfig = {
  id: 'lab-12-activations',
  number: 12,
  slug: '12-funcoes-de-ativacao',
  title: 'Funções de Ativação',
  description: 'Sigmoid, ReLU, Tanh e Softmax: fórmulas, gráficos e derivadas.',
  estimatedMinutes: 30,
  prerequisites: ['lab-11-neuron'],
  concepts: ['sigmoid', 'relu', 'tanh', 'softmax', 'derivada'],
  category: 'neural-networks',
  memoryBudgetMB: 50,
  tags: ['neural-networks'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que não basta somar?',
      component: 'markdown',
      config: {
        content: `## A peça que cria as curvas

Um neurônio soma entradas ponderadas e adiciona o bias. Se parássemos aí, empilhar camadas não ajudaria: a composição de funções lineares continua **linear**.

A **função de ativação** é o que introduz não-linearidade. Cada uma tem um formato, uma derivada e um caso de uso:

- **Sigmoid** → probabilidade de uma classificação binária.
- **ReLU** → padrão nas camadas ocultas.
- **Tanh** → como a sigmoid, mas centrada em zero.
- **Softmax** → distribuição de probabilidade em várias classes.`,
      },
    },
    {
      type: 'conceito',
      title: 'Conceito: ativação',
      component: 'concept-card',
      config: { conceptId: 'ativacao' },
    },
    {
      type: 'analogia',
      title: 'Analogia: as portas do sinal',
      component: 'markdown',
      config: {
        content: `## Quatro maneiras de transformar um sinal

Pense em \`z\` como a intensidade de um sinal. Cada ativação responde de um jeito:

- **Sigmoid**: comprime tudo entre 0 e 1, como um dimmer.
- **ReLU**: deixa passar só o que é positivo, como uma catraca.
- **Tanh**: comprime entre −1 e 1, com o zero no meio.
- **Softmax**: reparte 100% de "confiança" entre várias saídas.

A escolha depende do que a camada precisa representar.`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'As quatro funções lado a lado',
      component: 'visualization',
      config: {
        visualizationType: 'activation-curve',
        initialData: {
          type: 'activation-curve',
          fn: 'sigmoid',
          xRange: [-6, 6],
          fns: ['sigmoid', 'relu', 'tanh', 'softmax'],
          showDerivative: false,
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'Saturação e derivada',
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
      title: 'Explore uma ativação',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-12-activation',
        parameters: [
          {
            name: 'fn',
            type: 'string',
            label: 'Função',
            defaultValue: 'sigmoid',
            options: [
              { value: 'sigmoid', label: 'Sigmoid' },
              { value: 'relu', label: 'ReLU' },
              { value: 'tanh', label: 'Tanh' },
              { value: 'softmax', label: 'Softmax' },
            ],
            tfjsEquivalent: 'tf.sigmoid / tf.relu / tf.tanh / tf.softmax',
          },
          {
            name: 'derivative',
            type: 'boolean',
            label: 'Mostrar derivada',
            defaultValue: true,
            description: 'Exibe f′(z) em laranja, revelando as zonas de saturação.',
          },
        ],
        visualization: {
          type: 'activation-curve',
          accessibility: ACTIVATION_ACCESSIBILITY,
        },
        defaultState: { fn: 'sigmoid', derivative: true },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: escolha a ativação certa',
      component: 'challenge',
      validation: {
        type: 'multiple-choice',
        prompt:
          'Você vai treinar um classificador binário com camadas ocultas. Qual combinação de ativações é a escolha típica?',
        criteria: {
          options: [
            {
              id: 'a',
              label: 'ReLU nas camadas ocultas e sigmoid na saída.',
            },
            {
              id: 'b',
              label: 'Sigmoid em todas as camadas, inclusive na saída.',
            },
            {
              id: 'c',
              label: 'Linear nas camadas ocultas e linear na saída.',
            },
            {
              id: 'd',
              label: 'Softmax nas camadas ocultas e ReLU na saída.',
            },
          ],
          correctOptionIds: ['a'],
        },
        hints: [
          'A saída binária precisa de uma probabilidade entre 0 e 1.',
          'A ReLU acelera o treino nas camadas ocultas e evita saturação.',
          'Softmax é para várias classes; linear não introduz não-linearidade.',
        ],
        showSolutionAfter: 3,
      },
    },
    {
      type: 'explicacao',
      title: 'Derivadas e gradiente que desaparece',
      component: 'markdown',
      config: {
        content: `## As derivadas

\`\`\`
sigmoid: σ'(z) = σ(z)·(1 - σ(z))      máximo 0,25 em z = 0
tanh:    tanh'(z) = 1 - tanh(z)²       máximo 1 em z = 0
ReLU:    ReLU'(z) = 1 se z > 0, 0 caso contrário
\`\`\`

Para \`|z|\` grande, as derivadas da sigmoid e da tanh ficam **próximas de zero**. Na retropropagação, multiplicar muitos números pequenos faz o gradiente **desaparecer** — por isso a ReLU virou padrão nas camadas ocultas.

Abra "Por baixo dos panos" para ver \`z\`, \`f(z)\` e \`f'(z)\` em pontos amostrados.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: aplicando ativações',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        'const z = tf.tensor1d([-2, -1, 0, 1, 2]);',
        '',
        'tf.sigmoid(z).print();',
        'tf.relu(z).print();',
        'tf.tanh(z).print();',
        'tf.softmax(z).print();',
        '',
        'z.dispose();',
      ].join('\n'),
      config: {
        essential: 'const a = tf.tanh(z);',
        annotated: [
          '// Cada ativação transforma os mesmos logits z.',
          'const sigmoid = tf.sigmoid(z);',
          'const relu = tf.relu(z);',
          'const tanh = tf.tanh(z);',
          'const softmax = tf.softmax(z); // soma 1',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          'const z = tf.tensor1d([-2, -1, 0, 1, 2]);',
          '',
          'const outputs = tf.tidy(() => ({',
          '  sigmoid: tf.sigmoid(z),',
          '  relu: tf.relu(z),',
          '  tanh: tf.tanh(z),',
          '  softmax: tf.softmax(z),',
          '}));',
          '',
          'Object.values(outputs).forEach((tensor) => tensor.print());',
          'z.dispose();',
          'Object.values(outputs).forEach((tensor) => tensor.dispose());',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- A **ativação** introduz não-linearidade e permite fronteiras curvas.
- **Sigmoid** (0, 1) e **Tanh** (−1, 1) saturam para \`|z|\` grande.
- **ReLU** é barata e evita saturação no lado positivo.
- **Softmax** gera probabilidades que somam 1 para várias classes.
- Derivadas pequenas em cadeia causam o **vanishing gradient**.

No próximo laboratório você empilha neurônios em **camadas** e treina uma rede completa com forward, perda e backprop.`,
      },
    },
  ],
};
