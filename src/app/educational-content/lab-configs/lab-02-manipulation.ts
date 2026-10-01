import type { LaboratoryConfig } from '@domain/content';

const TENSOR_GRID_ACCESSIBILITY = {
  ariaLabel: 'Grade de tensor',
  dataTableAlternative: true,
  colorBlindSafe: true,
};

/** Laboratory 2: Manipulação de Tensores. */
export const lab02ManipulationConfig: LaboratoryConfig = {
  id: 'lab-02-manipulation',
  number: 2,
  slug: '02-manipulacao-de-tensores',
  title: 'Manipulação de Tensores',
  description: 'reshape, flatten, expandDims e squeeze para reorganizar dados.',
  estimatedMinutes: 20,
  prerequisites: ['lab-01-tensors'],
  concepts: ['reshape', 'flatten', 'expandDims', 'squeeze'],
  category: 'operations',
  memoryBudgetMB: 50,
  tags: ['operations'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Por que reorganizar tensores?',
      component: 'markdown',
      config: {
        content: `## Os dados raramente chegam no formato certo

Um sensor pode entregar uma lista de 42 temperaturas, mas o modelo precisa de uma matriz de **6 cidades × 7 dias**. Um classificador espera uma matriz de **amostras × features**, mas você tem um tensor de **altura × largura × canais**.

Nesses casos você **não precisa mudar os valores** — só a forma como eles estão organizados. É para isso que servem \`reshape\`, \`flatten\`, \`expandDims\` e \`squeeze\`.

Neste laboratório você vai reorganizar um mesmo conjunto de 6 números de várias maneiras, sempre verificando o shape resultante.`,
      },
    },
    {
      type: 'conceito',
      title: 'Conceito: reshape',
      component: 'concept-card',
      config: { conceptId: 'reshape' },
    },
    {
      type: 'analogia',
      title: 'Analogia: recipientes',
      component: 'markdown',
      config: {
        content: `## Água em recipientes diferentes

Imagine **6 litros de água**. Você pode colocá-los:

- em uma **fila de 6 copos** → shape \`[6]\`;
- em uma **bandeja 2 × 3** → shape \`[2, 3]\`;
- em uma **bandeja 3 × 2** → shape \`[3, 2]\`;
- em um único copo com uma **tampa extra** → shape \`[1, 6]\`.

A quantidade de água (os **valores**) nunca muda. Como \`reshape\` e as demais operações apenas mudam a "caixa", o número total de elementos (size) tem que ser preservado.`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'Antes: shape [2, 3]',
      component: 'visualization',
      config: {
        visualizationType: 'tensor-grid',
        initialData: {
          type: 'tensor-grid',
          title: '6 valores organizados como [2, 3]',
          tensor: {
            shape: [2, 3],
            dtype: 'float32',
            values: [1, 2, 3, 4, 5, 6],
            truncated: false,
          },
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'Dimensões de tamanho 1',
      component: 'visualization',
      config: {
        visualizationType: 'tensor-grid',
        initialData: {
          type: 'tensor-grid',
          title: 'shape [1, 2, 3] — a dimensão 1 é "elástica"',
          tensor: {
            shape: [1, 2, 3],
            dtype: 'float32',
            values: [1, 2, 3, 4, 5, 6],
            truncated: false,
          },
        },
      },
    },
    {
      type: 'experimentacao',
      title: 'Reorganize o tensor',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-02-reshape',
        parameters: [
          {
            name: 'operacao',
            type: 'string',
            label: 'Operação',
            defaultValue: 'reshape',
            options: [
              { value: 'reshape', label: 'reshape' },
              { value: 'flatten', label: 'flatten' },
              { value: 'expandDims', label: 'expandDims' },
              { value: 'squeeze', label: 'squeeze' },
            ],
            tfjsEquivalent: 'tf.reshape | tf.expandDims | tf.squeeze',
          },
          {
            name: 'shape',
            type: 'string',
            label: 'Shape alvo (reshape)',
            defaultValue: '3, 2',
            description: 'O produto das dimensões precisa ser 6.',
            tfjsEquivalent: 'tf.reshape(t, [3, 2])',
          },
          {
            name: 'axis',
            type: 'number',
            label: 'Eixo (expandDims / squeeze)',
            defaultValue: 0,
            min: 0,
            max: 3,
            step: 1,
            tfjsEquivalent: 'tf.expandDims(t, axis) | tf.squeeze(t, axis)',
          },
        ],
        visualization: {
          type: 'tensor-grid',
          accessibility: TENSOR_GRID_ACCESSIBILITY,
        },
        defaultState: { operacao: 'reshape', shape: '3, 2', axis: 0 },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: (3, 4, 5) → (5, 3, 4)',
      component: 'challenge',
      validation: {
        type: 'parameter-match',
        prompt:
          'Um tensor de shape [3, 4, 5] precisa virar [5, 3, 4]. A operação correta é tf.transpose com uma permutação. Informe o índice do eixo original que deve ocupar cada posição da nova ordem (por exemplo, eixo0=2 significa que o eixo de tamanho 5 vem primeiro).',
        criteria: { target: { eixo0: 2, eixo1: 0, eixo2: 1 } },
        hints: [
          'O shape de destino é [5, 3, 4]: o primeiro eixo vem do tamanho 5 (índice original 2).',
          'A nova ordem dos eixos originais é 2, 0, 1.',
        ],
        showSolutionAfter: 2,
      },
    },
    {
      type: 'explicacao',
      title: 'Como o shape é calculado',
      component: 'markdown',
      config: {
        content: `## Regras de cada operação

- **reshape**: o size (produto das dimensões) precisa ser preservado. \`reshape(t, [3, 2])\` transforma [2, 3] em [3, 2].
- **flatten**: caso especial de \`reshape(t, [-1])\`; sempre produz rank 1.
- **expandDims**: insere um eixo de tamanho 1 na posição \`axis\`, aumentando o rank em 1.
- **squeeze**: remove eixos de tamanho 1; se o eixo indicado não tiver tamanho 1, ocorre erro.

No desafio, a transformação [3, 4, 5] → [5, 3, 4] é uma **permutação de eixos** (não é reshape, pois a nova ordem muda). A permutação dos eixos originais \`[2, 0, 1]\` coloca primeiro o eixo de tamanho 5, depois o de tamanho 3 e por fim o de tamanho 4.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: operações de shape',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        'const t = tf.tensor([1, 2, 3, 4, 5, 6], [2, 3]); // [2, 3]',
        '',
        'tf.reshape(t, [3, 2]).print();   // [3, 2]',
        'tf.reshape(t, [-1]).print();     // [6] (flatten)',
        'tf.expandDims(t, 0).print();     // [1, 2, 3]',
        'tf.squeeze(tf.expandDims(t, 0)).print(); // [2, 3]',
      ].join('\n'),
      config: {
        essential: 'const flat = tf.reshape(t, [-1]);',
        annotated: [
          '// reshape preserva os valores e o size (6).',
          'const matriz = tf.reshape(t, [3, 2]);',
          '',
          '// flatten é reshape para rank 1.',
          'const plano = tf.reshape(t, [-1]);',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          "const t = tf.tensor([1, 2, 3, 4, 5, 6], [2, 3]);",
          '',
          'const matriz = tf.reshape(t, [3, 2]);',
          'const plano = tf.reshape(t, [-1]);',
          'const lote = tf.expandDims(t, 0);',
          'const voltou = tf.squeeze(lote);',
          '',
          '[matriz, plano, lote, voltou].forEach((tensor) => tensor.dispose());',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- \`reshape\` muda o shape preservando os valores e o **size**.
- \`flatten\` achata para um vetor de rank 1.
- \`expandDims\` **adiciona** um eixo de tamanho 1.
- \`squeeze\` **remove** eixos de tamanho 1.
- Permutar eixos (transpose) é diferente de reshape: muda a ordem dos dados.

Agora que você sabe moldar tensores, no próximo laboratório você vai **combiná-los** com operações elemento a elemento.`,
      },
    },
  ],
};
