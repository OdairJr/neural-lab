import type { LaboratoryConfig } from '@domain/content';

/** Static illustrative series: creating tensors in a loop without disposing them. */
const LEAK_SNAPSHOTS = [
  { timestamp: 1, usedMemoryMB: 2, tensorCount: 60 },
  { timestamp: 2, usedMemoryMB: 6, tensorCount: 120 },
  { timestamp: 3, usedMemoryMB: 11, tensorCount: 180 },
  { timestamp: 4, usedMemoryMB: 17, tensorCount: 240 },
  { timestamp: 5, usedMemoryMB: 24, tensorCount: 300 },
  { timestamp: 6, usedMemoryMB: 32, tensorCount: 360 },
];

/** Static illustrative series: the same loop wrapped in `tf.tidy`. */
const TIDY_SNAPSHOTS = [
  { timestamp: 1, usedMemoryMB: 2, tensorCount: 6 },
  { timestamp: 2, usedMemoryMB: 2, tensorCount: 6 },
  { timestamp: 3, usedMemoryMB: 2, tensorCount: 6 },
  { timestamp: 4, usedMemoryMB: 2, tensorCount: 6 },
  { timestamp: 5, usedMemoryMB: 2, tensorCount: 6 },
  { timestamp: 6, usedMemoryMB: 2, tensorCount: 6 },
];

const TIMELINE_ACCESSIBILITY = {
  ariaLabel: 'Uso de memória do TensorFlow.js ao longo do tempo',
  dataTableAlternative: true,
  colorBlindSafe: true,
};

/** Laboratory 16: Gerenciamento de Memória. */
export const lab16MemoryConfig: LaboratoryConfig = {
  id: 'lab-16-memory',
  number: 16,
  slug: '16-gerenciamento-de-memoria',
  title: 'Gerenciamento de Memória',
  description: 'tf.memory(), tf.dispose(), tf.tidy() e boas práticas contra vazamentos.',
  estimatedMinutes: 30,
  prerequisites: ['lab-15-images'],
  concepts: ['memoria', 'dispose', 'tidy', 'vazamento'],
  category: 'memory',
  memoryBudgetMB: 50,
  tags: ['memory'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'A memória que ninguém vê',
      component: 'markdown',
      config: {
        content: `## Todo tensor ocupa memória

Cada \`tf.tensor(...)\` reserva memória na GPU ou na CPU e **só é liberado quando você descarta o tensor** (\`.dispose()\`) ou o cria dentro de \`tf.tidy(...)\`.

Um loop que cria tensores sem limpá-los parece inofensivo, mas a memória cresce a cada iteração. Em uma sessão longa — exatamente o que este laboratório faz — isso termina em lentidão ou travamento.

Neste laboratório você provoca um **vazamento de memória** de propósito e depois o conserta com \`tf.tidy\`, observando a diferença ao vivo.`,
      },
    },
    {
      type: 'conceito',
      title: 'Conceito: memória',
      component: 'concept-card',
      config: { conceptId: 'memoria' },
    },
    {
      type: 'analogia',
      title: 'Analogia: a louça na pia',
      component: 'markdown',
      config: {
        content: `## Lavar a louça em vez de empilhar

Cada tensor é um prato usado no preparo. Se você **nunca lava**, a pia entope — mesmo com pratos que não usa mais.

- \`dispose()\` é lavar um prato específico na hora.
- \`tf.tidy()\` é lavar **tudo** que foi usado dentro do bloco, deixando de fora só o prato final.
- \`tf.memory().numTensors\` é o "medidor da pia".

O vazamento não é um erro que o JavaScript acusa: é memória esquecida, acumulando silenciosamente.`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'Assim é um vazamento',
      component: 'visualization',
      config: {
        visualizationType: 'memory-timeline',
        initialData: {
          type: 'memory-timeline',
          title: 'Sem descarte: a memória cresce a cada rodada',
          snapshots: LEAK_SNAPSHOTS,
          budgetMB: 50,
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'Assim fica com tf.tidy',
      component: 'visualization',
      config: {
        visualizationType: 'memory-timeline',
        initialData: {
          type: 'memory-timeline',
          title: 'Com tf.tidy: os tensores são liberados a cada rodada',
          snapshots: TIDY_SNAPSHOTS,
          budgetMB: 50,
        },
      },
    },
    {
      type: 'experimentacao',
      title: 'Vaze memória — e depois conserte',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-16-memory',
        parameters: [
          {
            name: 'strategy',
            type: 'string',
            label: 'Estratégia',
            defaultValue: 'leak',
            options: [
              { value: 'leak', label: 'Vazamento (sem dispose)' },
              { value: 'tidy', label: 'Corrigido (tf.tidy)' },
            ],
            description: 'Mude de "vazamento" para "tf.tidy" e veja a memória parar de crescer.',
          },
          {
            name: 'rounds',
            type: 'number',
            label: 'Rodadas',
            defaultValue: 10,
            min: 5,
            max: 20,
            step: 5,
          },
          {
            name: 'tensorsPerRound',
            type: 'number',
            label: 'Tensores por rodada',
            defaultValue: 50,
            min: 10,
            max: 200,
            step: 10,
          },
          {
            name: 'size',
            type: 'number',
            label: 'Elementos por tensor',
            defaultValue: 1000,
            min: 100,
            max: 5000,
            step: 100,
          },
        ],
        visualization: {
          type: 'memory-timeline',
          accessibility: TIMELINE_ACCESSIBILITY,
        },
        defaultState: { strategy: 'leak', rounds: 10, tensorsPerRound: 50, size: 1000 },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: conserte o código que vaza',
      component: 'challenge',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        'const antes = tf.memory().numTensors;',
        '',
        '// ❌ Cada tensor criado aqui fica vivo até o fim do programa.',
        'for (let i = 0; i < 100; i++) {',
        '  tf.tensor(new Float32Array(1000));',
        '}',
        '',
        'console.log("tensores restantes:", tf.memory().numTensors - antes);',
      ].join('\n'),
      validation: {
        type: 'code-output',
        prompt:
          'O trecho acima vaza memória. Reescreva o loop dentro de tf.tidy (sem retornar os tensores do loop) e responda: qual linha o programa corrigido imprime no console? Digite a saída exata, no formato "tensores restantes: N".',
        criteria: { expectedOutput: 'tensores restantes: 0' },
        hints: [
          'tf.tidy descarta automaticamente todos os tensores criados dentro dele e não retornados.',
          'Como nenhum tensor do loop é retornado, todos são liberados quando o bloco termina.',
          'Com todos os tensores intermediários liberados, a diferença é zero: "tensores restantes: 0".',
        ],
        showSolutionAfter: 3,
      },
    },
    {
      type: 'explicacao',
      title: 'O que conta como vazamento',
      component: 'markdown',
      config: {
        content: `## Detectando e corrigindo

\`tf.memory()\` expõe o estado atual:

\`\`\`
tf.memory().numTensors    // quantos tensores estão vivos
tf.memory().numBytes      // bytes reservados
tf.memory().unreliable    // true se o backend perdeu a contagem
\`\`\`

**Causas comuns de vazamento:**

- criar tensores em loops sem \`dispose()\` nem \`tidy()\`;
- guardar tensores intermediários em variáveis e esquecê-los;
- treinar várias épocas sem descartar ativações e gradientes.

**Correções:**

- envolver o cálculo em \`tf.tidy(() => ...)\` e retornar só o resultado;
- \`tensor.dispose()\` em tensores de vida longa;
- usar \`indexedDB\`/variáveis reutilizáveis em vez de recriar a cada passo.

No experimento, repare que a estratégia "tf.tidy" mantém a linha **plana** enquanto "vazamento" sobe. Voltar de "vazamento" para "tf.tidy" libera os tensores da rodada anterior.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: vazamento vs tf.tidy',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        '// ❌ Vaza: cada tensor criado fica vivo.',
        'function vaza() {',
        '  for (let i = 0; i < 100; i++) {',
        '    tf.tensor(new Float32Array(1000));',
        '  }',
        '}',
        '',
        '// ✅ Correto: tudo dentro de tf.tidy é liberado.',
        'function correto() {',
        '  return tf.tidy(() => {',
        '    let soma = tf.zeros([1000]);',
        '    for (let i = 0; i < 100; i++) {',
        '      soma = soma.add(tf.tensor(new Float32Array(1000)));',
        '    }',
        '    return soma; // só este sobrevive',
        '  });',
        '}',
        '',
        'console.log(tf.memory().numTensors);',
      ].join('\n'),
      config: {
        essential: 'return tf.tidy(() => { /* cria e usa tensores */ });',
        annotated: [
          '// Antes: memória viva.',
          'const antes = tf.memory().numTensors;',
          '',
          '// tf.tidy libera tudo que não for retornado.',
          'const resultado = tf.tidy(() => {',
          '  const a = tf.ones([1000]);',
          '  const b = tf.ones([1000]);',
          '  return a.add(b);',
          '});',
          '',
          'console.log(tf.memory().numTensors - antes); // 1',
          'resultado.dispose();',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          'const antes = tf.memory().numTensors;',
          'const resultado = tf.tidy(() => {',
          '  const a = tf.ones([1000]);',
          '  const b = tf.ones([1000]);',
          '  return a.add(b);',
          '});',
          '',
          'console.log("tensores criados:", tf.memory().numTensors - antes);',
          'resultado.dispose();',
          'console.log("tensores finais:", tf.memory().numTensors);',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- Todo **tensor ocupa memória** e precisa ser descartado.
- \`tf.memory()\` mostra \`numTensors\`, \`numBytes\` e \`unreliable\`.
- \`tensor.dispose()\` libera um tensor; \`tf.tidy()\` libera um bloco inteiro.
- Criar tensores em loops **sem** descarte vaza memória.
- \`tf.tidy\` mantém a memória **estável** — e voltar de "vazamento" para "tidy" recupera a memória.

Você concluiu a jornada de **Imagens & Memória**. Com tensores, redes, imagens e memória sob controle, você tem a base para aplicar TensorFlow.js em problemas reais.`,
      },
    },
  ],
};
