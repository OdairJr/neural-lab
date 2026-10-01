import type { LaboratoryConfig } from '@domain/content';

/**
 * Illustrative weight magnitudes for the network-graph stage: a 2 → 4 → 1
 * network (4 hidden neurons) with the sign/magnitude pattern expected after
 * training on the moons dataset.
 */
const ILLUSTRATIVE_WEIGHTS: number[][][] = [
  [
    [0.8, -0.5],
    [0.3, 0.9],
    [-0.7, 0.4],
    [0.2, -0.8],
  ],
  [[0.9, -0.6, 0.5, 0.7]],
];

/** Illustrative per-epoch loss and accuracy for the demonstration chart. */
const DEMO_LOSS = [0.69, 0.62, 0.55, 0.45, 0.36, 0.28, 0.22, 0.17, 0.13, 0.1, 0.08];
const DEMO_ACCURACY = [0.5, 0.55, 0.6, 0.68, 0.74, 0.8, 0.85, 0.89, 0.92, 0.94, 0.95];

const SCATTER_ACCESSIBILITY = {
  ariaLabel: 'Fronteira de decisão da rede durante o treino',
  dataTableAlternative: true,
  colorBlindSafe: true,
};

/** Laboratory 13: Redes Neurais. */
export const lab13NeuralNetworksConfig: LaboratoryConfig = {
  id: 'lab-13-neural-networks',
  number: 13,
  slug: '13-redes-neurais',
  title: 'Redes Neurais',
  description: 'Camadas, propagação direta, loss, backpropagation e treino.',
  estimatedMinutes: 40,
  prerequisites: ['lab-12-activations'],
  concepts: ['camada', 'forward-propagation', 'backpropagation', 'treino'],
  category: 'neural-networks',
  memoryBudgetMB: 60,
  tags: ['neural-networks'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Muito além de um neurônio',
      component: 'markdown',
      config: {
        content: `## Da peça à máquina

Um neurônio só traça uma reta. Para aprender fronteiras curvas, empilhamos neurônios em **camadas**:

- **Entrada** → recebe as features.
- **Ocultas** → transformam a representação.
- **Saída** → produz a predição.

O treino repete um ciclo: **forward** (prever), **loss** (medir o erro), **backpropagation** (calcular gradientes) e **atualização dos pesos**.

Neste laboratório a rede treina em um **Web Worker** e transmite métricas por época, animando a fronteira de decisão em tempo real.`,
      },
    },
    {
      type: 'conceito',
      title: 'Conceito: camada',
      component: 'concept-card',
      config: { conceptId: 'camada' },
    },
    {
      type: 'analogia',
      title: 'Analogia: a linha de montagem',
      component: 'markdown',
      config: {
        content: `## Estações em série

Imagine uma linha de montagem em que cada estação transforma o que recebe:

- A **camada oculta** combina as matérias-primas de formas novas.
- A **camada de saída** dá o veredito.

Quando o produto final sai errado, um boletim percorre a linha **ao contrário**, avisando cada estação de quanto ela contribuiu para o erro. Esse é o **backpropagation**.`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'A rede e seus pesos',
      component: 'visualization',
      config: {
        visualizationType: 'network-graph',
        initialData: {
          type: 'network-graph',
          title: 'Rede 2 → 4 (tanh) → 1 (sigmoid): espessura = magnitude do peso',
          layers: [
            { size: 2, activation: 'entrada' },
            { size: 4, activation: 'tanh' },
            { size: 1, activation: 'sigmoid' },
          ],
          weights: ILLUSTRATIVE_WEIGHTS,
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'Perda e acurácia por época',
      component: 'visualization',
      config: {
        visualizationType: 'line-chart',
        initialData: {
          type: 'line-chart',
          title: 'Convergência típica no dataset moons',
          series: [
            { label: 'loss', data: DEMO_LOSS, color: '#ef4444' },
            { label: 'acurácia', data: DEMO_ACCURACY, color: '#10b981' },
          ],
          xLabels: DEMO_LOSS.map((_, index) => String(index)),
        },
      },
    },
    {
      type: 'experimentacao',
      title: 'Construa e treine a rede',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-13-network',
        parameters: [
          {
            name: 'dataset',
            type: 'string',
            label: 'Dataset',
            defaultValue: 'moons',
            options: [
              { value: 'moons', label: 'Moons (2 classes)' },
              { value: 'spiral', label: 'Spiral (2 classes)' },
            ],
          },
          {
            name: 'hidden',
            type: 'number',
            label: 'Camadas ocultas',
            defaultValue: 1,
            min: 0,
            max: 3,
            step: 1,
          },
          {
            name: 'neurons',
            type: 'number',
            label: 'Neurônios por camada oculta',
            defaultValue: 8,
            min: 2,
            max: 16,
            step: 1,
          },
          {
            name: 'activation',
            type: 'string',
            label: 'Ativação oculta',
            defaultValue: 'tanh',
            options: [
              { value: 'tanh', label: 'Tanh' },
              { value: 'relu', label: 'ReLU' },
            ],
          },
          {
            name: 'lr',
            type: 'number',
            label: 'Learning rate',
            defaultValue: 0.5,
            min: 0.01,
            max: 2,
            step: 0.05,
          },
          {
            name: 'epochs',
            type: 'number',
            label: 'Épocas',
            defaultValue: 120,
            min: 20,
            max: 300,
            step: 20,
          },
        ],
        visualization: {
          type: 'scatter-plot',
          accessibility: SCATTER_ACCESSIBILITY,
        },
        defaultState: {
          dataset: 'moons',
          hidden: 1,
          neurons: 8,
          activation: 'tanh',
          lr: 0.5,
          epochs: 120,
        },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: configure a rede',
      component: 'challenge',
      validation: {
        type: 'multiple-choice',
        prompt:
          'Para superar 90% de acurácia no dataset moons usando menos de 3 camadas ocultas, qual configuração funciona?',
        criteria: {
          options: [
            {
              id: 'a',
              label: 'Uma camada oculta com 8 neurônios e ativação tanh.',
            },
            {
              id: 'b',
              label: 'Nenhuma camada oculta (apenas a saída sigmoid).',
            },
            {
              id: 'c',
              label: 'Três camadas ocultas com 2 neurônios cada.',
            },
            {
              id: 'd',
              label: 'Uma camada oculta com 1 neurônio e ativação linear.',
            },
          ],
          correctOptionIds: ['a'],
        },
        hints: [
          'Moons não é linearmente separável: a camada oculta é necessária.',
          'Poucos neurônios limitam a capacidade; 8 são suficientes para moons.',
          'Com 1 camada oculta de 8 neurônios (tanh) o treino passa de 90%.',
        ],
        showSolutionAfter: 3,
      },
    },
    {
      type: 'explicacao',
      title: 'Por baixo dos panos: um passo de backprop',
      component: 'markdown',
      config: {
        content: `## O ciclo de treino

Para cada época:

\`\`\`
a⁰ = x
para cada camada l:  zˡ = Wˡ·aˡ⁻¹ + bˡ ; aˡ = fˡ(zˡ)
loss = -Σ yₖ·log(ŷₖ)              (entropia cruzada)
δᴸ = ŷ - y                         (delta da saída)
δˡ = (Wˡ⁺¹·δˡ⁺¹) ⊙ fˡ'(zˡ)          (retropropagação)
Wˡ ← Wˡ - η · δˡ · (aˡ⁻¹)ᵀ
\`\`\`

O **backpropagation** aplica a regra da cadeia de trás para frente para descobrir quanto cada peso contribuiu para o erro.

Abra "Por baixo dos panos" durante o experimento para ver os pesos e as métricas vindos do worker.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: criar e treinar uma rede',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        'const model = tf.sequential();',
        "model.add(tf.layers.dense({ inputShape: [2], units: 8, activation: 'tanh' }));",
        "model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));",
        '',
        "model.compile({ optimizer: tf.train.sgd(0.5), loss: 'binaryCrossentropy', metrics: ['accuracy'] });",
        '',
        'await model.fit(xs, ys, { epochs: 120, shuffle: true });',
      ].join('\n'),
      config: {
        essential: 'model.add(tf.layers.dense({ units: 8, activation: "tanh" }));',
        annotated: [
          '// Rede densa: entrada → 1 camada oculta → saída.',
          'const model = tf.sequential();',
          'model.add(tf.layers.dense({ inputShape: [2], units: 8, activation: "tanh" }));',
          'model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));',
          '',
          '// O fit faz forward + loss + backprop automaticamente.',
          'await model.fit(xs, ys, { epochs: 120 });',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          'const model = tf.sequential();',
          "model.add(tf.layers.dense({ inputShape: [2], units: 8, activation: 'tanh' }));",
          "model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));",
          '',
          'model.compile({',
          '  optimizer: tf.train.sgd(0.5),',
          "  loss: 'binaryCrossentropy',",
          "  metrics: ['accuracy'],",
          '});',
          '',
          'const history = await model.fit(xs, ys, {',
          '  epochs: 120,',
          '  batchSize: 32,',
          '  shuffle: true,',
          '});',
          'console.log(history.history.loss);',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- **Camadas densas** empilham neurônios: entrada, ocultas e saída.
- O **forward** produz a predição; a **loss** mede o erro.
- O **backpropagation** calcula os gradientes aplicando a regra da cadeia.
- O **treino** repete o ciclo e atualiza os pesos, animando a fronteira.
- O treino roda em um **Web Worker** e transmite métricas sem travar a interface.

No próximo laboratório você foca em **classificação**: fronteiras de decisão, o problema XOR e a saída softmax multiclasse.`,
      },
    },
  ],
};
