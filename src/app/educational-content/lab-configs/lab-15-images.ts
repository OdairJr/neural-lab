import type { LaboratoryConfig } from '@domain/content';

/**
 * A tiny 4×4 grayscale "image" (0–255) used by the static visual example to
 * show that an image is just a grid of numbers.
 */
const GRAYSCALE_MATRIX = [
  [10, 60, 120, 200],
  [30, 90, 150, 230],
  [50, 110, 180, 245],
  [80, 140, 210, 255],
];

const DEMO_SIZE = 4;

/**
 * Builds a deterministic 4×4 RGB gradient plus its serialized tensor.
 *
 * The content layer is pure data (no imports beyond the domain types), so the
 * sample image is generated locally instead of using `@core/images`.
 */
function buildDemoImage(): {
  image: { name: string; width: number; height: number; data: number[] };
  tensor: {
    shape: number[];
    dtype: string;
    values: number[];
    size: number;
    truncated: boolean;
    stats: { min: number; max: number; mean: number; std: number };
  };
} {
  const data: number[] = [];
  const values: number[] = [];
  for (let y = 0; y < DEMO_SIZE; y++) {
    for (let x = 0; x < DEMO_SIZE; x++) {
      const red = Math.round((x / (DEMO_SIZE - 1)) * 255);
      const green = Math.round((y / (DEMO_SIZE - 1)) * 255);
      const blue = 128;
      data.push(red, green, blue, 255);
      values.push(red, green, blue);
    }
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const std = Math.sqrt(
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length,
  );

  return {
    image: { name: 'exemplo-gradiente', width: DEMO_SIZE, height: DEMO_SIZE, data },
    tensor: {
      shape: [DEMO_SIZE, DEMO_SIZE, 3],
      dtype: 'float32',
      values,
      size: values.length,
      truncated: false,
      stats: { min, max, mean, std },
    },
  };
}

const DEMO = buildDemoImage();

const IMAGE_TENSOR_ACCESSIBILITY = {
  ariaLabel: 'Imagem original ao lado dos valores do tensor correspondente',
  dataTableAlternative: true,
  colorBlindSafe: true,
  reducedMotionAlternative: 'A imagem e a tabela de valores não dependem de animação.',
};

/** Laboratory 15: Imagens como Tensores. */
export const lab15ImagesConfig: LaboratoryConfig = {
  id: 'lab-15-images',
  number: 15,
  slug: '15-imagens-como-tensores',
  title: 'Imagens como Tensores',
  description: 'Imagem → pixels → tensor, canais RGB, grayscale, resize e normalização.',
  estimatedMinutes: 35,
  prerequisites: ['lab-14-classification'],
  concepts: ['imagem', 'rgb', 'grayscale', 'normalizacao'],
  category: 'images',
  memoryBudgetMB: 50,
  tags: ['images'],
  stages: [
    {
      type: 'contextualizacao',
      title: 'Máquinas também enxergam pixels',
      component: 'markdown',
      config: {
        content: `## De uma foto a um tensor

Para uma pessoa, uma foto é uma cena. Para um modelo, é **um tensor de números**. Cada pixel guarda a intensidade de três canais — **vermelho, verde e azul** — e o conjunto forma uma grade de altura × largura × 3.

Antes de uma CNN (ou de uma MobileNet) "ver" qualquer coisa, alguém precisa converter a imagem em tensor e **pré-processá-la**: redimensionar, converter para tons de cinza e normalizar.

Neste laboratório você carrega uma imagem, observa os pixels virarem tensor e reproduz exatamente o pré-processamento que a MobileNet espera.`,
      },
    },
    {
      type: 'conceito',
      title: 'Conceito: imagem',
      component: 'concept-card',
      config: { conceptId: 'imagem' },
    },
    {
      type: 'analogia',
      title: 'Analogia: o mosaico de azulejos',
      component: 'markdown',
      config: {
        content: `## Um mosaico de três camadas

Imagine um **mosaico** de azulejos quadrados. Cada azulejo tem uma cor, e a imagem inteira é a soma dos azulejos.

Uma imagem digital é isso: uma grade. Só que cada azulejo é descrito por **três números** (quanto de vermelho, de verde e de azul) em vez de um nome de cor.

- **Altura × largura** dizem quantos azulejos existem.
- **3 canais** dizem quantas "camadas" o mosaico tem.
- Converter para **escala de cinza** é substituir as três camadas por uma só: o brilho.

O computador não "vê" o mosaico; ele multiplica os números dos azulejos.`,
      },
    },
    {
      type: 'exemplo-visual',
      title: 'Uma imagem é uma matriz de números',
      component: 'visualization',
      config: {
        visualizationType: 'matrix-heatmap',
        initialData: {
          type: 'matrix-heatmap',
          title: 'Imagem 4×4 em escala de cinza: cada célula é a intensidade de um pixel',
          matrix: GRAYSCALE_MATRIX,
          rowLabels: ['linha 0', 'linha 1', 'linha 2', 'linha 3'],
          columnLabels: ['col 0', 'col 1', 'col 2', 'col 3'],
        },
      },
    },
    {
      type: 'demonstracao',
      title: 'Imagem e tensor lado a lado',
      component: 'visualization',
      config: {
        visualizationType: 'image-tensor',
        initialData: {
          type: 'image-tensor',
          original: DEMO.image,
          tensor: DEMO.tensor,
          channels: 'RGB',
        },
      },
    },
    {
      type: 'experimentacao',
      title: 'Carregue uma imagem e veja o tensor',
      component: 'experiment',
      experimentConfig: {
        experimentFnId: 'lab-15-images',
        parameters: [
          {
            name: 'image',
            type: 'image',
            label: 'Imagem de entrada',
            description: 'Envie um PNG/JPG. Sem upload, usamos uma imagem de exemplo.',
          },
          {
            name: 'channels',
            type: 'string',
            label: 'Canais',
            defaultValue: 'rgb',
            options: [
              { value: 'rgb', label: 'RGB (3 canais)' },
              { value: 'grayscale', label: 'Escala de cinza (1 canal)' },
            ],
          },
          {
            name: 'size',
            type: 'number',
            label: 'Tamanho do resize',
            defaultValue: 16,
            min: 16,
            max: 224,
            step: 16,
            description: 'A imagem é redimensionada para size × size.',
          },
          {
            name: 'normalization',
            type: 'string',
            label: 'Normalização',
            defaultValue: 'unit',
            options: [
              { value: 'none', label: 'Nenhuma [0, 255]' },
              { value: 'unit', label: 'Unitária [0, 1]' },
              { value: 'signed', label: 'Com sinal [-1, 1]' },
            ],
          },
        ],
        visualization: {
          type: 'image-tensor',
          accessibility: IMAGE_TENSOR_ACCESSIBILITY,
        },
        defaultState: { channels: 'rgb', size: 16, normalization: 'unit' },
      },
    },
    {
      type: 'desafio',
      title: 'Desafio: prepare uma imagem para a MobileNet',
      component: 'challenge',
      validation: {
        type: 'parameter-match',
        prompt:
          'A MobileNet espera imagens 224×224 com 3 canais RGB e pixels em [-1, 1]. Ajuste o tamanho, os canais e a normalização do experimento para essa entrada.',
        criteria: { target: { size: 224, channels: 'rgb', normalization: 'signed' } },
        hints: [
          'A entrada padrão da MobileNet é quadrada: 224 pixels de altura por 224 de largura.',
          'A MobileNet espera 3 canais de cor — mantenha "RGB" (não escala de cinza).',
          'Pixels em [-1, 1] vêm da normalização "com sinal": (x / 255 - 0,5) × 2.',
        ],
        showSolutionAfter: 3,
      },
    },
    {
      type: 'explicacao',
      title: 'Canais, resize e normalização',
      component: 'markdown',
      config: {
        content: `## Por que tanto pré-processamento?

**Canais.** Uma imagem colorida é um tensor \`[altura, largura, 3]\`. Em **escala de cinza** usamos a luminância \`0,299·R + 0,587·G + 0,114·B\`, que respeita a sensibilidade do olho humano, e o tensor vira \`[altura, largura, 1]\`.

**Resize.** Redes convolucionais têm entrada de tamanho fixo. \`tf.image.resizeBilinear\` interpola a imagem para \`[novoAltura, novaLargura]\`, o que também **reduz o custo** de memória.

**Normalização.** Redes treinam melhor com entradas pequenas e centradas:

\`\`\`
unitária:  x / 255            → [0, 1]
com sinal: (x / 255 - 0,5)·2  → [-1, 1]   (MobileNet)
\`\`\`

Repare no experimento como o **shape** e a **faixa de valores** (veja a tabela de dados) mudam a cada escolha.`,
      },
    },
    {
      type: 'codigo',
      title: 'Código: de pixels a tensor',
      component: 'code-view',
      codeTemplate: [
        "import * as tf from '@tensorflow/tfjs';",
        '',
        '// Uma imagem carregada vira um tensor [altura, largura, 3].',
        'const pixels = tf.browser.fromPixels(imageElement);',
        '',
        '// Redimensiona para 224×224 (entrada padrão de CNNs).',
        'const resized = tf.image.resizeBilinear(pixels, [224, 224]);',
        '',
        '// Normaliza para [-1, 1] (estilo MobileNet).',
        'const normalized = resized.div(255).sub(0.5).mul(2);',
        '',
        'console.log(pixels.shape, normalized.shape);',
        'pixels.dispose(); resized.dispose(); normalized.dispose();',
      ].join('\n'),
      config: {
        essential:
          'const pixels = tf.browser.fromPixels(img); // [altura, largura, 3]',
        annotated: [
          '// RGB: três canais por pixel, valores 0–255.',
          'const pixels = tf.browser.fromPixels(img);',
          '',
          '// Escala de cinza: um canal pela luminância.',
          'const gray = tf.sum(tf.mul(pixels, [0.299, 0.587, 0.114]), 2, true); // [h, w, 1]',
          '',
          '// Resize e normalização para a entrada da rede.',
          'const resized = tf.image.resizeBilinear(pixels, [224, 224]);',
          'const normalized = resized.div(255).sub(0.5).mul(2); // [-1, 1]',
          '',
          '// Sem DOM (ex.: testes em jsdom), o mesmo RGB sai de',
          '// tf.tensor3d(rgbValues(img), [h, w, 3], "float32").',
        ].join('\n'),
        full: [
          "import * as tf from '@tensorflow/tfjs';",
          '',
          'const image = document.getElementById("foto");',
          'const pixels = tf.browser.fromPixels(image);',
          'const resized = tf.image.resizeBilinear(pixels, [224, 224]);',
          'const normalized = resized.div(255).sub(0.5).mul(2);',
          '',
          'console.log("pixels:", pixels.shape);',
          'console.log("resized:", resized.shape);',
          'console.log("normalized:", normalized.shape);',
          '',
          'pixels.dispose();',
          'resized.dispose();',
          'normalized.dispose();',
        ].join('\n'),
      },
    },
    {
      type: 'resumo',
      title: 'Resumo',
      component: 'markdown',
      config: {
        content: `## O que você aprendeu

- Uma **imagem é um tensor**: \`[altura, largura, canais]\`.
- **RGB** usa 3 canais; **escala de cinza** usa 1, pela luminância.
- **Resize** (\`tf.image.resizeBilinear\`) ajusta a entrada ao tamanho fixo da rede.
- **Normalizar** para \`[0, 1]\` ou \`[-1, 1]\` ajuda o treino; a MobileNet usa \`[-1, 1]\` em 224×224.
- Toda operação cria tensores — e todo tensor precisa ser descartado.

Agora que as imagens viram tensores, o próximo laboratório mostra como **gerenciar a memória** que eles ocupam.`,
      },
    },
  ],
};
