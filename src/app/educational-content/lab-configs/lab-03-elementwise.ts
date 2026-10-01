import type { LaboratoryConfig } from '@domain/content';

const TENSOR_GRID_ACCESSIBILITY = {
  ariaLabel: 'Grade de tensor',
  dataTableAlternative: true,
  colorBlindSafe: true,
};

/** Laboratory 3: Operações Elemento a Elemento. */
export const lab03ElementwiseConfig: LaboratoryConfig = {
  id: 'lab-03-elementwise',
  number: 3,
  slug: '03-operacoes-elemento-a-elemento',
  title: 'Operações Elemento a Elemento',
  description: 'adição, subtração, multiplicação, divisão, potência e raiz.',
  estimatedMinutes: 20,
  prerequisites: ['lab-02-manipulation'],
  concepts: ['operacoes-elementares', 'broadcasting'],
  category: 'operations',
  memoryBudgetMB: 50,
  tags: ['operations'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Operações que combinam valores',
      component: 'markdown',
      config: {
        content: `## Aritmética posição a posição

Depois de moldar os dados, o próximo passo é **combiná-los**. As operações elemento a elemento aplicam uma conta a cada posição: somar, subtrair, multiplicar, dividir, elevar a uma potência ou tirar a raiz.

Elas aparecem em toda parte no Machine Learning: atualizar pesos (\`w = w - lr * grad\`), calcular resíduos (\`y - ŷ\`) e normalizar dados (\`x / 255\`) são operações elemento a elemento.

Neste laboratório você vai usar uma **matriz de quantidades** de receitas e um **vetor de preços** para calcular custos — e verá como shapes diferentes se combinam.`,
      },
    },
    {
      type: 'conceito',
      title: 'Conceito: operações elementares',
      component: 'concept-card',
      config: { conceptId: 'operacoes-elementares' },
    },
    {
      type: 'analogia',
      title: 'Analogia: a lista de compras',
      component: 'markdown',
      config: {
        content: `## Quantidades × preços

Uma lista de compras tem duas colunas: **quantidade** e **preço unitário**. O custo de cada item é a multiplicação, posição a posição, das duas colunas.

- Quantidades: \`[2, 3, 1, 1]\` (farinha, ovos, leite, açúcar)
- Preços: \`[2, 0.5, 3, 4]\`

Multiplicando cada item: \`[4, 1.5, 3, 4]\`. O custo total da compra é a **soma** desses valores.`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'Antes: quantidades',
      component: 'visualization',
      config: {
        visualizationType: 'tensor-grid',
        initialData: {
          type: 'tensor-grid',
          title: 'Quantidades por receita — shape [3, 4]',
          tensor: {
            shape: [3, 4],
            dtype: 'float32',
            values: [2, 3, 1, 1, 4, 0, 2, 0.5, 1, 1, 0.5, 2],
            truncated: false,
          },
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'Depois: custo por ingrediente',
      component: 'visualization',
      config: {
        visualizationType: 'tensor-grid',
        initialData: {
          type: 'tensor-grid',
          title: 'Quantidades × preços [2, 0.5, 3, 4] — shape [3, 4]',
          tensor: {
            shape: [3, 4],
            dtype: 'float32',
            values: [4, 1.5, 3, 4, 8, 0, 6, 2, 2, 0.5, 1.5, 8],
            truncated: false,
          },
        },
      },
    },
    {
      type: 'experimentacao',
      title: 'Experimente as operações',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-03-elementwise',
        parameters: [
          {
            name: 'operacao',
            type: 'string',
            label: 'Operação',
            defaultValue: 'mul',
            options: [
              { value: 'add', label: 'add' },
              { value: 'sub', label: 'sub' },
              { value: 'mul', label: 'mul' },
              { value: 'div', label: 'div' },
              { value: 'pow', label: 'pow' },
              { value: 'sqrt', label: 'sqrt' },
            ],
            tfjsEquivalent: 'tf.add | tf.sub | tf.mul | tf.div | tf.pow | tf.sqrt',
          },
          {
            name: 'precos',
            type: 'string',
            label: 'Preços',
            defaultValue: '2, 0.5, 3, 4',
            description: 'Quatro preços separados por vírgula (aplicados por broadcast).',
            tfjsEquivalent: 'tf.tensor([2, 0.5, 3, 4])',
          },
        ],
        visualization: {
          type: 'tensor-grid',
          accessibility: TENSOR_GRID_ACCESSIBILITY,
        },
        defaultState: { operacao: 'mul', precos: '2, 0.5, 3, 4' },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: custo total por receita',
      component: 'challenge',
      validation: {
        type: 'tensor-value',
        prompt:
          'Com os preços [2, 0.5, 3, 4] e as quantidades [[2, 3, 1, 1], [4, 0, 2, 0.5], [1, 1, 0.5, 2]], calcule o custo total de cada uma das 3 receitas somando os custos dos seus ingredientes. Informe o shape [3] e os três custos.',
        criteria: {
          expectedShape: [3],
          expectedValues: [12.5, 16, 12],
          tolerance: 0.01,
        },
        hints: [
          'Multiplique cada quantidade pelo preço correspondente e some a linha.',
          'Bolo: 2×2 + 3×0.5 + 1×3 + 1×4 = 12.5.',
          'Pão: 4×2 + 0×0.5 + 2×3 + 0.5×4 = 16; Biscoito: 1×2 + 1×0.5 + 0.5×3 + 2×4 = 12.',
        ],
        showSolutionAfter: 3,
      },
    },
    {
      type: 'explicacao',
      title: 'Broadcasting em ação',
      component: 'markdown',
      config: {
        content: `## Como [3, 4] × [4] funciona

A matriz de quantidades tem shape \`[3, 4]\` e o vetor de preços tem shape \`[4]\`. O TensorFlow.js compara os shapes **da direita para a esquerda**:

- 4 e 4 → compatíveis.
- 3 e (nada) → o vetor é tratado como \`[1, 4]\` e **esticado** para todas as 3 receitas.

O resultado é \`[3, 4]\`. Esse é o **broadcasting**: nenhuma cópia explícita é criada, mas a operação se comporta como se o vetor tivesse sido repetido.

Para \`sqrt\` não há segundo operando: a raiz é aplicada a cada elemento da matriz. Para \`pow\`, o vetor de preços é usado como expoente.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: operações e broadcast',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        'const quantidades = tf.tensor2d([',
        '  [2, 3, 1, 1],',
        '  [4, 0, 2, 0.5],',
        '  [1, 1, 0.5, 2],',
        ']);',
        'const precos = tf.tensor1d([2, 0.5, 3, 4]);',
        '',
        'const custos = tf.mul(quantidades, precos); // [3, 4]',
        'const totais = tf.sum(custos, 1);           // [3]',
        'totais.print(); // [12.5, 16, 12]',
      ].join('\n'),
      config: {
        essential: 'const totais = tf.sum(tf.mul(quantidades, precos), 1);',
        annotated: [
          '// O vetor [4] é esticado para cada uma das 3 linhas (broadcast).',
          'const custos = tf.mul(quantidades, precos); // [3, 4]',
          '',
          '// Somando ao longo do eixo 1 obtemos o custo de cada receita.',
          'const totais = tf.sum(custos, 1); // [3]',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          'const quantidades = tf.tensor2d([',
          '  [2, 3, 1, 1],',
          '  [4, 0, 2, 0.5],',
          '  [1, 1, 0.5, 2],',
          ']);',
          'const precos = tf.tensor1d([2, 0.5, 3, 4]);',
          '',
          'const totais = tf.sum(tf.mul(quantidades, precos), 1);',
          'totais.print();',
          '',
          'quantidades.dispose();',
          'precos.dispose();',
          'totais.dispose();',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- Operações elementares aplicam a conta **posição a posição**: \`add\`, \`sub\`, \`mul\`, \`div\`, \`pow\`, \`sqrt\`.
- Quando os shapes diferem, o **broadcasting** alinha as dimensões da direita para a esquerda.
- \`[3, 4] × [4] → [3, 4]\`; um vetor é esticado por todas as linhas.
- Combinar \`mul\` com uma redução (\`sum\`) calcula custos totais.

No próximo laboratório você vai aprofundar as **reduções** ao longo de eixos.`,
      },
    },
  ],
};
