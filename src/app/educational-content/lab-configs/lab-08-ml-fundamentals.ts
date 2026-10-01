import type { LaboratoryConfig } from '@domain/content';

/** One row of the synthetic housing dataset (features + label). */
export interface HousingRow {
  area: number;
  quartos: number;
  idade: number;
  distancia: number;
  preco: number;
}

/**
 * Synthetic housing dataset used by Lab 8. Exported so the lab feature can
 * reuse the exact same rows; content stays pure data (no core/shared imports).
 */
export const HOUSING_DATASET: readonly HousingRow[] = [
  { area: 60, quartos: 2, idade: 20, distancia: 8, preco: 250 },
  { area: 80, quartos: 3, idade: 15, distancia: 6, preco: 320 },
  { area: 100, quartos: 3, idade: 10, distancia: 5, preco: 400 },
  { area: 120, quartos: 4, idade: 5, distancia: 4, preco: 470 },
  { area: 150, quartos: 4, idade: 8, distancia: 3, preco: 560 },
  { area: 200, quartos: 5, idade: 2, distancia: 2, preco: 720 },
];

export const HOUSING_FEATURES = ['area', 'quartos', 'idade', 'distancia'] as const;

const CORRELATION_LABELS = ['Área', 'Quartos', 'Idade', 'Distância', 'Preço'];
/** Pearson correlation matrix (features + price), precomputed from the rows. */
const CORRELATION_MATRIX = [
  [1, 0.96, -0.9, -0.95, 1],
  [0.96, 1, -0.95, -0.97, 0.96],
  [-0.9, -0.95, 1, 0.95, -0.91],
  [-0.95, -0.97, 0.95, 1, -0.96],
  [1, 0.96, -0.91, -0.96, 1],
];

const SCATTER_ACCESSIBILITY = {
  ariaLabel: 'Gráfico de dispersão de uma característica versus preço',
  dataTableAlternative: true,
  colorBlindSafe: true,
};

/** Laboratory 8: Fundamentos de Machine Learning. */
export const lab08MlFundamentalsConfig: LaboratoryConfig = {
  id: 'lab-08-ml-fundamentals',
  number: 8,
  slug: '08-fundamentos-de-machine-learning',
  title: 'Fundamentos de Machine Learning',
  description: 'dataset, features, labels, treino/validação, loss, época e batch.',
  estimatedMinutes: 30,
  prerequisites: ['lab-07-linear-algebra'],
  concepts: ['dataset', 'feature', 'label', 'loss', 'epoca', 'batch', 'learning-rate'],
  category: 'ml',
  memoryBudgetMB: 50,
  tags: ['ml'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Dados antes de modelos',
      component: 'markdown',
      config: {
        content: `## Antes de treinar, entenda os dados

Até aqui manipulamos tensores e operações. Mas todo modelo de Machine Learning começa com uma pergunta simples: **quais informações eu tenho e o que quero prever?**

Imagine avaliar casas. Você tem uma tabela em que cada linha é uma casa e cada coluna é uma **característica** (área, número de quartos, idade, distância do centro). O que queremos prever — o **preço** — é o **rótulo** (label).

Neste laboratório você vai explorar um *dataset* de casas: distribuições, correlações e a separação entre treino e validação. Sem entender os dados, nenhum ajuste de modelo faz sentido.`,
      },
    },
    {
      type: 'conceito',
      title: 'Conceito: dataset',
      component: 'concept-card',
      config: { conceptId: 'dataset' },
    },
    {
      type: 'analogia',
      title: 'Analogia: fichas de imóveis',
      component: 'markdown',
      config: {
        content: `## Features e label

Pense em um corretor com fichas de imóveis:

- Cada **ficha** é um **exemplo** (\`x\`).
- Os campos da ficha (área, quartos, idade, distância) são as **features**.
- A resposta anotada no fim da ficha (o preço) é o **label** (\`y\`).

O conjunto de fichas é o **dataset**. Antes de aprender, medimos:

- a **distribuição** de cada feature (mín/máx/média);
- a **correlação** entre cada feature e o preço.

Uma feature altamente correlacionada tende a ser mais útil para a previsão.`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'Correlações com o preço',
      component: 'visualization',
      config: {
        visualizationType: 'matrix-heatmap',
        initialData: {
          type: 'matrix-heatmap',
          title: 'Matriz de correlação (Pearson) — features × preço',
          matrix: CORRELATION_MATRIX,
          rowLabels: CORRELATION_LABELS,
          columnLabels: CORRELATION_LABELS,
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'Área × preço',
      component: 'visualization',
      config: {
        visualizationType: 'scatter-plot',
        initialData: {
          type: 'scatter-plot',
          title: 'Área (m²) versus preço (mil R$) — correlação 0,999',
          points: HOUSING_DATASET.map((row) => ({
            x: row.area,
            y: row.preco,
            label: 'casas',
          })),
          xLabel: 'área (m²)',
          yLabel: 'preço (mil R$)',
        },
      },
    },
    {
      type: 'experimentacao',
      title: 'Explore as features',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-08-housing',
        parameters: [
          {
            name: 'feature',
            type: 'string',
            label: 'Característica',
            defaultValue: 'area',
            options: [
              { value: 'area', label: 'Área (m²)' },
              { value: 'quartos', label: 'Quartos' },
              { value: 'idade', label: 'Idade (anos)' },
              { value: 'distancia', label: 'Distância do centro (km)' },
            ],
            description: 'Escolha a feature do eixo x; o eixo y é sempre o preço.',
            tfjsEquivalent: 'tf.tensor(feature)',
          },
        ],
        visualization: {
          type: 'scatter-plot',
          accessibility: SCATTER_ACCESSIBILITY,
        },
        defaultState: { feature: 'area' },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: qual feature explica o preço?',
      component: 'challenge',
      validation: {
        type: 'multiple-choice',
        prompt:
          'Com base na matriz de correlação do dataset de casas, qual característica tem a MAIOR correlação (em valor absoluto) com o preço?',
        criteria: {
          options: [
            { id: 'area', label: 'Área (m²)' },
            { id: 'quartos', label: 'Quartos' },
            { id: 'idade', label: 'Idade (anos)' },
            { id: 'distancia', label: 'Distância do centro (km)' },
          ],
          correctOptionIds: ['area'],
        },
        hints: [
          'Procure na última coluna da matriz de correlação o valor mais próximo de 1 ou -1.',
          'Idade e distância têm correlação negativa; compare os módulos.',
          'Área ≈ 0,999 é a correlação mais forte.',
        ],
        showSolutionAfter: 2,
      },
    },
    {
      type: 'explicacao',
      title: 'Treino, validação e loss',
      component: 'markdown',
      config: {
        content: `## Do dataset ao aprendizado

Depois de explorar os dados, dividimos o dataset:

- **Treino**: os exemplos usados para ajustar os parâmetros.
- **Validação/Teste**: exemplos guardados para medir a generalização.

O treino acontece em **épocas**: uma época é uma passagem completa pelo conjunto de treino. Quando o conjunto é grande, ele é dividido em **batches** (lotes); atualizar os pesos a cada lote, em vez de a cada época, é o *mini-batch gradient descent*.

O **loss** (função de custo) mede o erro do modelo. O **learning rate** controla o tamanho do passo de atualização. Nos próximos laboratórios usaremos o **MSE** como loss da regressão linear.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: carregando e explorando',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        '// Cada feature vira uma coluna; o preço é o label.',
        'const features = tf.tensor2d([',
        '  [60, 2, 20, 8],',
        '  [80, 3, 15, 6],',
        '  [100, 3, 10, 5],',
        ']);',
        'const labels = tf.tensor1d([250, 320, 400]);',
        '',
        '// Estatísticas simples por feature.',
        'const mean = tf.mean(features, 0); // [3]',
        'const max = tf.max(features, 0);',
      ].join('\n'),
      config: {
        essential: 'const features = tf.tensor2d(dados); const labels = tf.tensor1d(precos);',
        annotated: [
          '// Matriz de features [amostras, features] e vetor de labels.',
          'const features = tf.tensor2d(dados); // [n, 4]',
          'const labels = tf.tensor1d(precos);  // [n]',
          '',
          '// Média de cada feature ao longo das amostras (axis 0).',
          'const means = tf.mean(features, 0);',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          'const features = tf.tensor2d(dados); // [n, 4]',
          'const labels = tf.tensor1d(precos);  // [n]',
          '',
          'tf.mean(features, 0).print();',
          'tf.max(features, 0).print();',
          '',
          'features.dispose();',
          'labels.dispose();',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- Um **dataset** reúne exemplos; cada exemplo tem **features** (\`x\`) e um **label** (\`y\`).
- Explorar **distribuições** e **correlações** orienta a escolha de features.
- O dataset é dividido em **treino** e **validação**.
- O treino ocorre em **épocas** e, opcionalmente, em **batches**; o **loss** mede o erro e o **learning rate** o passo.

No próximo laboratório você vai ajustar uma reta aos dados: a **regressão linear**.`,
      },
    },
  ],
};
