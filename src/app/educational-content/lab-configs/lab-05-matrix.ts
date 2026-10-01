import type { LaboratoryConfig } from '@domain/content';

const HEATMAP_ACCESSIBILITY = {
  ariaLabel: 'Mapa de calor de matriz',
  dataTableAlternative: true,
  colorBlindSafe: true,
};

const QUANTITIES = [
  [10, 12, 14, 16, 18], // Produto A
  [20, 18, 16, 14, 12], // Produto B
  [5, 7, 9, 11, 13], // Produto C
];
const PRODUCT_LABELS = ['Produto A', 'Produto B', 'Produto C'];
const REGION_LABELS = ['N', 'NE', 'CO', 'S', 'SE'];

/** Laboratory 5: Operações Matriciais. */
export const lab05MatrixConfig: LaboratoryConfig = {
  id: 'lab-05-matrix',
  number: 5,
  slug: '05-operacoes-matriciais',
  title: 'Operações Matriciais',
  description: 'transpose e multiplicação de matrizes (matMul).',
  estimatedMinutes: 25,
  prerequisites: ['lab-04-reductions'],
  concepts: ['transpose', 'matMul', 'produto-escalar'],
  category: 'operations',
  memoryBudgetMB: 50,
  tags: ['operations'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Combinando tabelas inteiras',
      component: 'markdown',
      config: {
        content: `## Quando a multiplicação é entre matrizes

Até agora combinamos tensores posição a posição. Mas e quando cada **linha** de uma tabela precisa ser combinada com cada **coluna** de outra? Isso é a **multiplicação de matrizes** (\`matMul\`), a operação central das camadas densas de uma rede neural.

Ela obedece a uma regra de shape rígida: \`[m, n] × [n, p] = [m, p]\`. Se o \`n\` não bater, o TensorFlow.js lança um erro.

Neste laboratório você vai calcular a receita de 3 produtos em 5 regiões e descobrir por que o **transpose** ajuda a alinhar shapes.`,
      },
    },
    {
      type: 'conceito',
      title: 'Conceito: matMul',
      component: 'concept-card',
      config: { conceptId: 'matMul' },
    },
    {
      type: 'analogia',
      title: 'Analogia: linha × coluna',
      component: 'markdown',
      config: {
        content: `## Cruzando linhas e colunas

Pense na matriz de **quantidades** (3 produtos × 5 regiões) e em um vetor de **preços** (5 regiões). Para saber a receita de um produto, você percorre a linha de quantidades multiplicando pelo preço de cada região e **soma**.

\`matMul\` faz exatamente isso para todas as linhas de uma vez: cada elemento do resultado é um **produto escalar** de uma linha de A por uma coluna de B.

Por isso a segunda dimensão de A (regiões) tem que ser igual à primeira de B (regiões).`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'Quantidades: [3, 5]',
      component: 'visualization',
      config: {
        visualizationType: 'matrix-heatmap',
        initialData: {
          type: 'matrix-heatmap',
          title: 'Quantidades por produto × região — shape [3, 5]',
          matrix: QUANTITIES,
          rowLabels: PRODUCT_LABELS,
          columnLabels: REGION_LABELS,
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'Preços: [5, 1]',
      component: 'visualization',
      config: {
        visualizationType: 'matrix-heatmap',
        initialData: {
          type: 'matrix-heatmap',
          title: 'Preços por região — shape [5, 1]',
          matrix: [[2], [3], [2.5], [4], [1.5]],
          rowLabels: REGION_LABELS,
          columnLabels: ['preço'],
        },
      },
    },
    {
      type: 'experimentacao',
      title: 'matMul e transpose',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-05-matrix',
        parameters: [
          {
            name: 'operacao',
            type: 'string',
            label: 'Operação',
            defaultValue: 'matMul',
            options: [
              { value: 'matMul', label: 'matMul' },
              { value: 'transpose', label: 'transpose' },
            ],
            tfjsEquivalent: 'tf.matMul | tf.transpose',
          },
          {
            name: 'forcarErro',
            type: 'boolean',
            label: 'Forçar shape incompatível',
            defaultValue: false,
            description: 'Usa preços [4, 1] em vez de [5, 1] para demonstrar a regra de shape.',
            tfjsEquivalent: 'tf.matMul(quantidades, precosIncompativeis)',
          },
        ],
        visualization: {
          type: 'matrix-heatmap',
          accessibility: HEATMAP_ACCESSIBILITY,
        },
        defaultState: { operacao: 'matMul', forcarErro: false },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: receita por produto',
      component: 'challenge',
      validation: {
        type: 'tensor-value',
        prompt:
          'As quantidades dos 3 produtos por região são [[10, 12, 14, 16, 18], [20, 18, 16, 14, 12], [5, 7, 9, 11, 13]] e os preços por região são [2, 3, 2.5, 4, 1.5]. Calcule matMul(quantidades [3, 5], precos [5, 1]) e informe o shape e os três totais.',
        criteria: {
          expectedShape: [3, 1],
          expectedValues: [182, 208, 117],
          tolerance: 0.01,
        },
        hints: [
          'Cada linha do resultado é o produto escalar da linha de quantidades com a coluna de preços.',
          'Produto A: 10×2 + 12×3 + 14×2.5 + 16×4 + 18×1.5 = 182.',
          'Produto B = 208 e Produto C = 117.',
        ],
        showSolutionAfter: 3,
      },
    },
    {
      type: 'explicacao',
      title: 'A regra de shape',
      component: 'markdown',
      config: {
        content: `## [3, 5] × [5, 1] = [3, 1]

A multiplicação de matrizes só é definida quando o número de **colunas de A** é igual ao número de **linhas de B**. Repare que o shape do resultado usa as dimensões "externas": \`[m, n] × [n, p] = [m, p]\`.

- Compatível: \`[3, 5] × [5, 1]\` → \`[3, 1]\`.
- Incompatível: \`[3, 5] × [4, 1]\` → erro, porque 5 ≠ 4.
- \`transpose\` troca linhas por colunas: \`[3, 5] → [5, 3]\`. Ele é usado justamente para alinhar dimensões.

Um tenso comum é usar \`matMul\` separando o eixo n (a dimensão compartilhada) e o resultado perde essa dimensão.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: matMul',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        'const quantidades = tf.tensor2d([',
        '  [10, 12, 14, 16, 18],',
        '  [20, 18, 16, 14, 12],',
        '  [5, 7, 9, 11, 13],',
        ']);',
        'const precos = tf.tensor2d([[2], [3], [2.5], [4], [1.5]]);',
        '',
        'const receita = tf.matMul(quantidades, precos); // [3, 1]',
        'receita.print(); // [[182], [208], [117]]',
      ].join('\n'),
      config: {
        essential: 'const receita = tf.matMul(quantidades, precos); // [3, 1]',
        annotated: [
          '// [3, 5] × [5, 1] → [3, 1]: a dimensão 5 some.',
          'const receita = tf.matMul(quantidades, precos);',
          '',
          '// transpose troca as dimensões:',
          'const regioes = tf.transpose(quantidades); // [5, 3]',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          'const quantidades = tf.tensor2d([',
          '  [10, 12, 14, 16, 18],',
          '  [20, 18, 16, 14, 12],',
          '  [5, 7, 9, 11, 13],',
          ']);',
          'const precos = tf.tensor2d([[2], [3], [2.5], [4], [1.5]]);',
          '',
          'const receita = tf.matMul(quantidades, precos);',
          'receita.print();',
          '',
          'quantidades.dispose();',
          'precos.dispose();',
          'receita.dispose();',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- \`matMul\` multiplica matrizes: \`[m, n] × [n, p] = [m, p]\`.
- Cada elemento do resultado é um **produto escalar** entre uma linha de A e uma coluna de B.
- A regra de shape é obrigatória: a dimensão compartilhada deve coincidir.
- \`transpose\` troca linhas por colunas e ajuda a alinhar shapes.

No próximo laboratório você vai generalizar essa ideia: o **broadcasting** permite combinar shapes diferentes sem escrever \`matMul\`.`,
      },
    },
  ],
};
