import type { LaboratoryConfig } from '@domain/content';

/**
 * The four XOR clusters in 2D. Classes cannot be separated by a single line:
 * class 0 groups the "same sign" corners and class 1 the "opposite sign" ones.
 */
export const XOR_POINTS: readonly { x: number; y: number; label: number }[] = [
  { x: -0.7, y: -0.7, label: 0 },
  { x: -0.5, y: -0.9, label: 0 },
  { x: 0.7, y: 0.7, label: 0 },
  { x: 0.9, y: 0.5, label: 0 },
  { x: -0.7, y: 0.7, label: 1 },
  { x: -0.5, y: 0.9, label: 1 },
  { x: 0.7, y: -0.7, label: 1 },
  { x: 0.9, y: -0.5, label: 1 },
];

/** Confusion matrix of a linear model on XOR: it guesses right ~half the time. */
export const XOR_LINEAR_CONFUSION = {
  matrix: [
    [2, 2],
    [2, 2],
  ],
  rowLabels: ['Real 0', 'Real 1'],
  columnLabels: ['Previsto 0', 'Previsto 1'],
};

const SCATTER_ACCESSIBILITY = {
  ariaLabel: 'Pontos do XOR com a fronteira de decisão do modelo',
  dataTableAlternative: true,
  colorBlindSafe: true,
};

/** Laboratory 14: Classificação e Fronteiras de Decisão. */
export const lab14ClassificationConfig: LaboratoryConfig = {
  id: 'lab-14-classification',
  number: 14,
  slug: '14-classificacao-e-fronteiras-de-decisao',
  title: 'Classificação e Fronteiras de Decisão',
  description: 'Classificação binária/multiclasse, fronteiras de decisão e o problema XOR.',
  estimatedMinutes: 40,
  prerequisites: ['lab-13-neural-networks'],
  concepts: ['classificacao', 'fronteira-de-decisao', 'xor'],
  category: 'neural-networks',
  memoryBudgetMB: 60,
  tags: ['neural-networks'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Separar o inseparável',
      component: 'markdown',
      config: {
        content: `## Quando uma reta não basta

Classificar é atribuir uma **classe** a cada entrada. Com uma saída sigmoid resolvemos dois grupos; com **softmax** resolvemos vários.

Mas existe um caso famoso em que uma reta jamais separa as classes: o **XOR**. Seus quatro cantos formam um padrão de "xadrez" que nenhum modelo linear resolve.

Neste laboratório você vai ver o modelo linear **falhar** no XOR, adicionar uma **camada oculta** e assistir a **fronteira de decisão** evoluir até resolver o problema.`,
      },
    },
    {
      type: 'conceito',
      title: 'Conceito: classificação',
      component: 'concept-card',
      config: { conceptId: 'classificacao' },
    },
    {
      type: 'analogia',
      title: 'Analogia: a cerca no terreno',
      component: 'markdown',
      config: {
        content: `## Cercas retas e cercas curvas

Imagine separar ovelhas de cabras num terreno. Se cada rebanho ocupa um lado, uma **cerca reta** basta. Mas no XOR os animais do mesmo grupo estão em **cantos opostos**:

- um modelo **linear** só sabe erguer uma cerca reta — e sempre deixa um grupo do lado errado;
- com uma **camada oculta**, a rede dobra a cerca em duas retas e isola cada canto.

A **fronteira de decisão** é essa cerca. Visualizá-la mostra exatamente o que o modelo aprendeu.`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'O XOR e uma fronteira linear',
      component: 'visualization',
      config: {
        visualizationType: 'scatter-plot',
        initialData: {
          type: 'scatter-plot',
          title: 'XOR: a reta y = x não separa as duas classes',
          points: XOR_POINTS.map((point) => ({
            ...point,
            label: point.label === 1 ? 'Classe 1' : 'Classe 0',
          })),
          lines: [
            {
              label: 'fronteira linear',
              color: '#111827',
              points: [
                { x: -1, y: -1 },
                { x: 1, y: 1 },
              ],
            },
          ],
          xLabel: 'x1',
          yLabel: 'x2',
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'Matriz de confusão do modelo linear',
      component: 'visualization',
      config: {
        visualizationType: 'matrix-heatmap',
        initialData: {
          type: 'matrix-heatmap',
          title: 'XOR com um modelo linear: acurácia 50% (equivalente ao acaso)',
          matrix: XOR_LINEAR_CONFUSION.matrix,
          rowLabels: XOR_LINEAR_CONFUSION.rowLabels,
          columnLabels: XOR_LINEAR_CONFUSION.columnLabels,
        },
      },
    },
    {
      type: 'experimentacao',
      title: 'Resolva o XOR com uma camada oculta',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-14-classification',
        parameters: [
          {
            name: 'dataset',
            type: 'string',
            label: 'Dataset',
            defaultValue: 'xor',
            options: [
              { value: 'xor', label: 'XOR (não linear)' },
              { value: 'moons', label: 'Moons (não linear)' },
              { value: 'blobs', label: 'Blobs (3 classes, softmax)' },
            ],
          },
          {
            name: 'hidden',
            type: 'number',
            label: 'Camadas ocultas',
            defaultValue: 1,
            min: 0,
            max: 2,
            step: 1,
            description: 'Use 0 para ver o modelo linear falhar no XOR.',
          },
          {
            name: 'neurons',
            type: 'number',
            label: 'Neurônios por camada oculta',
            defaultValue: 2,
            min: 2,
            max: 8,
            step: 1,
          },
          {
            name: 'lr',
            type: 'number',
            label: 'Learning rate',
            defaultValue: 0.5,
            min: 0.05,
            max: 1,
            step: 0.05,
          },
          {
            name: 'epochs',
            type: 'number',
            label: 'Épocas (evolução da fronteira)',
            defaultValue: 120,
            min: 20,
            max: 200,
            step: 20,
          },
        ],
        visualization: {
          type: 'scatter-plot',
          accessibility: SCATTER_ACCESSIBILITY,
        },
        defaultState: { dataset: 'xor', hidden: 1, neurons: 2, lr: 0.5, epochs: 120 },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: a menor rede que resolve o XOR',
      component: 'challenge',
      validation: {
        type: 'multiple-choice',
        prompt:
          'Qual é a menor arquitetura capaz de resolver o XOR (fronteira não-linear)?',
        criteria: {
          options: [
            { id: 'a', label: 'Uma camada oculta com 2 neurônios e ativação tanh.' },
            { id: 'b', label: 'Nenhuma camada oculta (apenas a saída).' },
            { id: 'c', label: 'Uma camada oculta com 1 neurônio.' },
            { id: 'd', label: 'Duas camadas de saída softmax.' },
          ],
          correctOptionIds: ['a'],
        },
        hints: [
          'Sem camada oculta a fronteira é uma reta — e nenhuma reta separa o XOR.',
          'Um único neurônio oculto ainda produz uma única dobra.',
          'Dois neurônios ocultos combinam duas dobras e isolam os cantos opostos.',
        ],
        showSolutionAfter: 3,
      },
    },
    {
      type: 'explicacao',
      title: 'Fronteiras, softmax e one-hot',
      component: 'markdown',
      config: {
        content: `## Como a rede separa o inseparável

Cada neurônio da camada oculta cria uma **dobra** (\`z = 0\`). Duas dobras bastam para "recortar" os cantos opostos do XOR — é o mesmo motivo pelo qual "NÃO-OU-exclusivo" é composto por OR/AND/NOT.

Para **várias classes**, a saída usa **softmax**:

\`\`\`
p_k = exp(z_k) / Σ_j exp(z_j)      (probabilidades que somam 1)
\`\`\`

Os rótulos viram **one-hot**: classe 1 de 3 → \`[0, 1, 0]\`. A perda é a entropia cruzada categórica.

Lembre-se da matriz de confusão: cada linha é a classe real e cada coluna a prevista; a diagonal são os acertos.

Abra "Por baixo dos panos" durante o experimento para ver a fronteira e os pesos.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: XOR e classificação multiclasse',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        '// XOR: nenhuma reta separa as classes.',
        'const xs = tf.tensor2d([[0, 0], [0, 1], [1, 0], [1, 1]]);',
        'const ys = tf.tensor2d([[0], [1], [1], [0]]);',
        '',
        'const model = tf.sequential();',
        "model.add(tf.layers.dense({ inputShape: [2], units: 2, activation: 'tanh' }));",
        "model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));",
        "model.compile({ optimizer: tf.train.sgd(0.5), loss: 'binaryCrossentropy', metrics: ['accuracy'] });",
        '',
        'await model.fit(xs, ys, { epochs: 200 });',
      ].join('\n'),
      config: {
        essential:
          "model.add(tf.layers.dense({ units: 2, activation: 'tanh' })); // a camada que resolve o XOR",
        annotated: [
          '// Sem camada oculta, loss fica presa em ~0,69 (acurácia 50%).',
          'const linear = tf.sequential();',
          'linear.add(tf.layers.dense({ inputShape: [2], units: 1, activation: "sigmoid" }));',
          '',
          '// Com 2 neurônios ocultos, o XOR é resolvido.',
          'const model = tf.sequential();',
          'model.add(tf.layers.dense({ inputShape: [2], units: 2, activation: "tanh" }));',
          'model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          'const xs = tf.tensor2d([[0, 0], [0, 1], [1, 0], [1, 1]]);',
          'const ys = tf.tensor2d([[0], [1], [1], [0]]);',
          '',
          'const model = tf.sequential();',
          "model.add(tf.layers.dense({ inputShape: [2], units: 2, activation: 'tanh' }));",
          "model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));",
          "model.compile({ optimizer: tf.train.sgd(0.5), loss: 'binaryCrossentropy', metrics: ['accuracy'] });",
          '',
          'await model.fit(xs, ys, { epochs: 200 });',
          "const accuracy = model.evaluate(xs, ys)[1].dataSync()[0];",
          'console.log("acurácia no XOR:", accuracy);',
          '',
          'xs.dispose(); ys.dispose(); model.dispose();',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- **Classificação** prevê classes: sigmoid (binária) ou softmax (multiclasse).
- A **fronteira de decisão** é onde o modelo troca de classe prevista.
- **XOR não é linearmente separável**: sem camada oculta, o modelo fica em ~50%.
- Uma camada oculta com **2 neurônios** já resolve o XOR.
- A **matriz de confusão** mostra acertos e erros por classe; softmax usa rótulos **one-hot**.

Você concluiu a fase de **Neurônios, Ativações e Redes**. Agora as redes podem ver dados com estrutura: no próximo laboratório as imagens viram tensores.`,
      },
    },
  ],
};
