import type { LaboratoryConfig } from '@domain/content';

const SCATTER_ACCESSIBILITY = {
  ariaLabel: 'Gráfico de dispersão dos pontos antes e depois da transformação',
  dataTableAlternative: true,
  colorBlindSafe: true,
};

const ORIGINAL_POINTS = [
  { x: 1, y: 0, label: 'conjunto A' },
  { x: 0, y: 1, label: 'conjunto A' },
  { x: -1, y: 0, label: 'conjunto A' },
  { x: 0, y: -1, label: 'conjunto A' },
  { x: 1, y: 1, label: 'conjunto A' },
];

/** Laboratory 7: Álgebra Linear Aplicada. */
export const lab07LinearAlgebraConfig: LaboratoryConfig = {
  id: 'lab-07-linear-algebra',
  number: 7,
  slug: '07-algebra-linear-aplicada',
  title: 'Álgebra Linear Aplicada',
  description: 'Vetores, produto escalar e transformações lineares em 2D.',
  estimatedMinutes: 30,
  prerequisites: ['lab-06-broadcasting'],
  concepts: ['transformacao-linear', 'produto-escalar', 'vetor'],
  category: 'operations',
  memoryBudgetMB: 50,
  tags: ['operations'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Geometria dos dados',
      component: 'markdown',
      config: {
        content: `## Matrizes que movem pontos

Uma multiplicação de matriz não é só uma conta: ela **transforma o espaço**. Uma matriz 2 × 2 pode girar, esticar, encolher, refletir ou cisalhar um conjunto de pontos no plano.

Essa é a essência de uma camada densa de rede neural: os pesos formam uma matriz que transforma os dados de entrada, e o treino ajusta essa matriz. Entender a geometria ajuda a intuir por que certos pesos funcionam e outros não.

Neste laboratório você vai aplicar rotação e escala a um conjunto de pontos e ver a transformação ao vivo — além de calcular produtos escalares.`,
      },
    },
    {
      type: 'conceito',
      title: 'Conceito: transformação linear',
      component: 'concept-card',
      config: { conceptId: 'transformacao-linear' },
    },
    {
      type: 'analogia',
      title: 'Analogia: a lente',
      component: 'markdown',
      config: {
        content: `## Uma lente para os pontos

Pense na matriz de transformação como uma **lente deformante**:

- **Escala** aproxima (aumenta) ou afasta (diminui) todos os pontos.
- **Rotação** gira o conjunto em torno da origem, sem deformar.

A multiplicação \`M · p\` aplica a lente ao ponto \`p\`. O produto escalar, por sua vez, mede **o quanto** um vetor aponta na direção de outro: se for zero, eles são perpendiculares.`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'Conjunto A original',
      component: 'visualization',
      config: {
        visualizationType: 'scatter-plot',
        initialData: {
          type: 'scatter-plot',
          title: 'Pontos originais (conjunto A)',
          points: ORIGINAL_POINTS,
          xLabel: 'x',
          yLabel: 'y',
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'A matriz identidade',
      component: 'visualization',
      config: {
        visualizationType: 'matrix-heatmap',
        initialData: {
          type: 'matrix-heatmap',
          title: 'Matriz identidade: nenhuma transformação',
          matrix: [
            [1, 0],
            [0, 1],
          ],
          rowLabels: ['x', 'y'],
          columnLabels: ['x', 'y'],
        },
      },
    },
    {
      type: 'experimentacao',
      title: 'Rotação e escala ao vivo',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-07-linear-transform',
        parameters: [
          {
            name: 'angulo',
            type: 'number',
            label: 'Ângulo (graus)',
            defaultValue: 0,
            min: -180,
            max: 180,
            step: 15,
            tfjsEquivalent: 'M = [[s·cosθ, -s·sinθ], [s·sinθ, s·cosθ]]',
          },
          {
            name: 'escala',
            type: 'number',
            label: 'Escala',
            defaultValue: 1,
            min: 0.25,
            max: 3,
            step: 0.25,
            tfjsEquivalent: 'tf.matMul(pontos, M)',
          },
        ],
        visualization: {
          type: 'scatter-plot',
          accessibility: SCATTER_ACCESSIBILITY,
        },
        defaultState: { angulo: 0, escala: 1 },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: encontre a matriz',
      component: 'challenge',
      validation: {
        type: 'parameter-match',
        prompt:
          'O conjunto A tem os pontos (1,0), (0,1), (-1,0), (0,-1) e (1,1). Encontre os parâmetros da transformação M = escala × rotação(θ) que levam o conjunto A ao conjunto B, onde B é A girado 90° no sentido anti-horário, sem mudar o tamanho. Informe o ângulo (graus) e a escala.',
        criteria: { target: { angulo: 90, escala: 1 } },
        hints: [
          'Uma rotação de 90° leva (1, 0) em (0, 1).',
          'Como o tamanho dos pontos não muda, a escala é 1.',
        ],
        showSolutionAfter: 2,
      },
    },
    {
      type: 'explicacao',
      title: 'Do produto escalar à matriz',
      component: 'markdown',
      config: {
        content: `## Produto escalar e transformação

O **produto escalar** de dois vetores \`a · b = a₁b₁ + a₂b₂\` gera um número. Quando vale 0, os vetores são perpendiculares; quando é positivo, apontam para o mesmo lado.

Com os pontos armazenados como **linhas** (\`p = [x, y]\`), a multiplicação \`p · M\` produz cada coordenada como o **produto escalar** de \`p\` com uma coluna de \`M\`.

Para uma rotação de ângulo θ e escala s (convenção de vetor-linha):

\`\`\`
M = [ s·cosθ   s·sinθ ]
    [ -s·sinθ  s·cosθ ]
\`\`\`

Com θ = 90° e s = 1, \`M = [[0, 1], [-1, 0]]\`, que leva (1,0) → (0,1) e (0,1) → (-1,0): exatamente o conjunto B.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: transformação e dot',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        'const pontos = tf.tensor2d([[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1]]);',
        'const angulo = (90 * Math.PI) / 180;',
        'const s = 1;',
        'const M = tf.tensor2d([',
        '  [s * Math.cos(angulo), s * Math.sin(angulo)],',
        '  [-s * Math.sin(angulo), s * Math.cos(angulo)],',
        ']);',
        '',
        'const transformados = tf.matMul(pontos, M); // [5, 2]',
        'const alinhamento = tf.dot(tf.tensor1d([1, 0]), tf.tensor1d([0, 1])); // 0',
      ].join('\n'),
      config: {
        essential: 'const transformados = tf.matMul(pontos, M);',
        annotated: [
          '// M gira os pontos em torno da origem.',
          'const transformados = tf.matMul(pontos, M); // [5, 2]',
          '',
          '// Produto escalar: 0 significa vetores perpendiculares.',
          'const alinhamento = tf.dot(tf.tensor1d([1, 0]), tf.tensor1d([0, 1]));',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          'const pontos = tf.tensor2d([[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1]]);',
          'const angulo = (90 * Math.PI) / 180;',
          'const s = 1;',
          'const M = tf.tensor2d([',
          '  [s * Math.cos(angulo), s * Math.sin(angulo)],',
          '  [-s * Math.sin(angulo), s * Math.cos(angulo)],',
          ']);',
          '',
          'const transformados = tf.matMul(pontos, M);',
          'transformados.print();',
          '',
          'pontos.dispose(); M.dispose(); transformados.dispose();',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- Uma matriz 2 × 2 **transforma** pontos: rotação, escala, reflexão, cisalhamento.
- \`M · p\` é o **produto escalar** de p com as linhas de M.
- O produto escalar mede alinhamento; zero significa perpendicularidade.
- Rotação de 90° e escala 1 mapeiam o conjunto A no conjunto B.

Você concluiu a fase de **Tensores e Operações**. No próximo laboratório os conceitos de tensor, shape, broadcasting e transformação linear vão fundamentar o **aprendizado de máquina**.`,
      },
    },
  ],
};
