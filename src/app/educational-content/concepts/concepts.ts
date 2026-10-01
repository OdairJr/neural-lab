import type { Concept as ConceptSchema } from '@domain/content';

/**
 * V1 concept glossary.
 *
 * The concepts introduced by the Phase 2 laboratories (Labs 1-7, Tensors &
 * Operations) have full definitions so the concept cards and the glossary can
 * render them. The remaining concepts are still compact seeds; richer
 * definitions land with their laboratories in later phases. This file is the
 * single source of truth for concept ids so the build-time validator can check
 * every lab reference.
 *
 * The file is intentionally self-contained (type-only domain import) so the
 * Node content validator can import it directly with a `.ts` specifier.
 */

interface ConceptSeed {
  id: string;
  title: string;
  shortDefinition?: string;
  fullDefinition?: string;
  mathematicalNotation?: string;
  visualAnalogy?: string;
  tfjsApi?: string[];
  relatedConcepts?: string[];
  introducedInLab?: string;
  reinforcedInLabs?: string[];
}

const TENSOR_CONCEPTS: readonly ConceptSeed[] = [
  {
    id: 'tensor',
    title: 'Tensor',
    shortDefinition: 'Array multidimensional de números com shape e dtype.',
    fullDefinition:
      'Um tensor é a estrutura de dados fundamental do TensorFlow.js: um array de números organizado em zero ou mais dimensões, com um formato (shape) e um tipo de dado (dtype) fixos. Escalares, vetores e matrizes são casos particulares de tensores (rank 0, 1 e 2). Todos os cálculos de Machine Learning — dados, pesos, ativações e gradientes — trafegam como tensores.',
    mathematicalNotation: 'T \\in \\mathbb{R}^{d_1 \\times d_2 \\times \\cdots \\times d_n}',
    visualAnalogy:
      'Pense em uma planilha: uma célula é um escalar, uma linha é um vetor, a planilha inteira é uma matriz e uma pilha de planilhas é um tensor de rank 3.',
    tfjsApi: ['tf.tensor', 'tf.tensor1d', 'tf.tensor2d', 'tf.tensor3d'],
    relatedConcepts: ['escalar', 'vetor', 'matriz', 'rank', 'shape', 'dtype'],
    introducedInLab: 'lab-01-tensors',
  },
  {
    id: 'escalar',
    title: 'Escalar',
    shortDefinition: 'Tensor de rank 0: um único número.',
    fullDefinition:
      'Um escalar é um tensor com zero dimensões e exatamente um valor, como a temperatura de um termômetro ou o viés (bias) de um neurônio. Em TensorFlow.js ele é criado com tf.scalar e possui shape [].',
    mathematicalNotation: 'x \\in \\mathbb{R}',
    visualAnalogy: 'Um único número em uma caixa.',
    tfjsApi: ['tf.scalar'],
    relatedConcepts: ['tensor', 'rank', 'vetor'],
    introducedInLab: 'lab-01-tensors',
  },
  {
    id: 'vetor',
    title: 'Vetor',
    shortDefinition: 'Tensor de rank 1: uma lista ordenada de números.',
    fullDefinition:
      'Um vetor é um tensor de rank 1, com shape [n]. Ele representa uma sequência de valores, como as temperaturas de uma cidade ao longo de vários dias ou as características (features) de um exemplo.',
    mathematicalNotation: '\\mathbf{v} \\in \\mathbb{R}^{n}',
    visualAnalogy: 'Uma linha de valores em uma planilha.',
    tfjsApi: ['tf.tensor1d', 'tf.tensor'],
    relatedConcepts: ['tensor', 'escalar', 'matriz', 'rank'],
    introducedInLab: 'lab-01-tensors',
  },
  {
    id: 'matriz',
    title: 'Matriz',
    shortDefinition: 'Tensor de rank 2: uma tabela de valores com linhas e colunas.',
    fullDefinition:
      'Uma matriz é um tensor de rank 2, com shape [linhas, colunas]. Ela organiza dados em duas dimensões, como cidades (linhas) × dias (colunas) em uma tabela de temperaturas.',
    mathematicalNotation: 'M \\in \\mathbb{R}^{m \\times n}',
    visualAnalogy: 'Uma planilha com linhas e colunas.',
    tfjsApi: ['tf.tensor2d', 'tf.tensor'],
    relatedConcepts: ['tensor', 'vetor', 'rank', 'shape'],
    introducedInLab: 'lab-01-tensors',
  },
  {
    id: 'rank',
    title: 'Rank',
    shortDefinition: 'Número de dimensões (eixos) de um tensor.',
    fullDefinition:
      'O rank (também chamado de número de dimensões) indica quantos eixos um tensor possui. Um escalar tem rank 0, um vetor rank 1, uma matriz rank 2 e uma imagem colorida normalmente rank 3 (altura × largura × canais). O rank é lido de tensor.shape.length.',
    mathematicalNotation: '\\text{rank}(T) = \\text{shape}(T).\\text{length}',
    visualAnalogy: 'Quantos "índices" você precisa para localizar um valor.',
    tfjsApi: ['tensor.rank', 'tensor.shape'],
    relatedConcepts: ['tensor', 'shape', 'escalar'],
    introducedInLab: 'lab-01-tensors',
  },
  {
    id: 'shape',
    title: 'Shape',
    shortDefinition: 'Formato do tensor: quantidade de elementos em cada dimensão.',
    fullDefinition:
      'O shape é um array com o tamanho de cada eixo do tensor. Um vetor com 7 temperaturas tem shape [7]; uma matriz de 3 cidades × 7 dias tem shape [3, 7]. Operações como reshape e matMul exigem shapes compatíveis.',
    mathematicalNotation: '(d_1, d_2, \\ldots, d_n)',
    visualAnalogy: 'As dimensões de uma caixa: comprimento, largura e altura.',
    tfjsApi: ['tensor.shape', 'tf.reshape'],
    relatedConcepts: ['tensor', 'rank', 'size', 'reshape'],
    introducedInLab: 'lab-01-tensors',
    reinforcedInLabs: ['lab-02-manipulation', 'lab-06-broadcasting'],
  },
  {
    id: 'size',
    title: 'Size',
    shortDefinition: 'Número total de elementos do tensor.',
    fullDefinition:
      'O size é o produto das dimensões do shape e corresponde à quantidade total de valores armazenados. Um tensor de shape [3, 7] tem size 21. Em TensorFlow.js ele é acessado por tensor.size.',
    mathematicalNotation: '\\text{size} = \\prod_i d_i',
    visualAnalogy: 'Quantas células a caixa contém no total.',
    tfjsApi: ['tensor.size'],
    relatedConcepts: ['tensor', 'shape'],
    introducedInLab: 'lab-01-tensors',
  },
  {
    id: 'dtype',
    title: 'dtype',
    shortDefinition: 'Tipo de dado dos elementos do tensor (ex.: float32, int32).',
    fullDefinition:
      'O dtype define como cada número é armazenado: float32 é o padrão para aprendizado e aceita decimais; int32 é usado para índices e rótulos. Escolher o dtype certo evita conversões implícitas e desperdício de memória.',
    visualAnalogy: 'O formato da célula: número inteiro ou número com casas decimais.',
    tfjsApi: ['tensor.dtype', 'tf.tensor'],
    relatedConcepts: ['tensor', 'escalar'],
    introducedInLab: 'lab-01-tensors',
  },
  {
    id: 'reshape',
    title: 'reshape',
    shortDefinition: 'Muda o shape de um tensor sem alterar seus valores.',
    fullDefinition:
      'tf.reshape reorganiza um tensor em um novo shape, desde que o número total de elementos (size) permaneça igual. Você pode usar -1 em uma dimensão para que o TensorFlow.js a infira automaticamente.',
    mathematicalNotation: '\\text{reshape}: \\mathbb{R}^{\\prod d_i} \\to \\mathbb{R}^{\\prod d_i\'}',
    visualAnalogy: 'Reorganizar a mesma quantidade de água em recipientes de formatos diferentes.',
    tfjsApi: ['tf.reshape'],
    relatedConcepts: ['shape', 'flatten', 'size'],
    introducedInLab: 'lab-02-manipulation',
  },
  {
    id: 'flatten',
    title: 'flatten',
    shortDefinition: 'Transforma um tensor em um vetor de rank 1.',
    fullDefinition:
      'Flatten achata todas as dimensões em uma única lista de valores, preservando a ordem de leitura (row-major). É o passo típico antes de alimentar uma rede densa.',
    visualAnalogy: 'Empilhar todas as linhas da planilha em uma única lista.',
    tfjsApi: ['tf.reshape(t, [-1])'],
    relatedConcepts: ['reshape', 'vetor', 'rank'],
    introducedInLab: 'lab-02-manipulation',
  },
  {
    id: 'expandDims',
    title: 'expandDims',
    shortDefinition: 'Adiciona uma dimensão de tamanho 1 em uma posição.',
    fullDefinition:
      'tf.expandDims insere um novo eixo de tamanho 1, aumentando o rank. Isso é útil para alinhar shapes em broadcasting ou para tratar um único exemplo como um lote de tamanho 1.',
    mathematicalNotation: '[d_1, \\ldots, d_n] \\to [d_1, \\ldots, 1, \\ldots, d_n]',
    visualAnalogy: 'Colocar uma lista dentro de uma pasta para virar uma pilha de uma folha.',
    tfjsApi: ['tf.expandDims'],
    relatedConcepts: ['squeeze', 'rank', 'broadcasting'],
    introducedInLab: 'lab-02-manipulation',
  },
  {
    id: 'squeeze',
    title: 'squeeze',
    shortDefinition: 'Remove dimensões de tamanho 1.',
    fullDefinition:
      'tf.squeeze elimina eixos cujo tamanho é 1, reduzindo o rank sem alterar os valores. É o inverso de expandDims e ajuda a limpar shapes artificiais criados por batching.',
    mathematicalNotation: '[1, d, 1] \\to [d]',
    visualAnalogy: 'Tirar uma folha da pasta e ficar só com a lista.',
    tfjsApi: ['tf.squeeze'],
    relatedConcepts: ['expandDims', 'rank', 'shape'],
    introducedInLab: 'lab-02-manipulation',
  },
  {
    id: 'operacoes-elementares',
    title: 'Operações elementares',
    shortDefinition: 'Operações aplicadas elemento a elemento entre tensores compatíveis.',
    fullDefinition:
      'Operações elementares (add, sub, mul, div, pow, sqrt) combinam tensores posição a posição, produzindo um resultado do mesmo shape. Elas são a base de atualizações de pesos e funções de custo em redes neurais.',
    mathematicalNotation: '(A \\odot B)_{ij} = A_{ij} \\cdot B_{ij}',
    visualAnalogy: 'Somar duas colunas de uma planilha linha por linha.',
    tfjsApi: ['tf.add', 'tf.sub', 'tf.mul', 'tf.div', 'tf.pow', 'tf.sqrt'],
    relatedConcepts: ['tensor', 'broadcasting', 'shape'],
    introducedInLab: 'lab-03-elementwise',
  },
  {
    id: 'broadcasting',
    title: 'Broadcasting',
    shortDefinition: 'Expansão implícita de shapes menores para permitir operações.',
    fullDefinition:
      'Broadcasting permite combinar tensores de shapes diferentes alinhando as dimensões da direita para a esquerda: dimensões iguais ou dimensões 1 são compatíveis, e a dimensão 1 é esticada. É por isso que multiplicar uma matriz [3, 7] por um vetor [7] funciona.',
    mathematicalNotation: '[3, 7] \\text{ op } [7] \\to [3, 7]',
    visualAnalogy: 'Uma tabela de preços por coluna é repetida em todas as linhas automaticamente.',
    tfjsApi: ['tf.add', 'tf.mul', 'tf.broadcastTo'],
    relatedConcepts: ['operacoes-elementares', 'shape', 'expandDims'],
    introducedInLab: 'lab-03-elementwise',
    reinforcedInLabs: ['lab-06-broadcasting'],
  },
  {
    id: 'reducao',
    title: 'Redução',
    shortDefinition: 'Operação que resume um tensor ao longo de um ou mais eixos.',
    fullDefinition:
      'Reduções (sum, mean, min, max) agregam valores e removem dimensões. O parâmetro axis define ao longo de qual eixo a agregação acontece; sem axis, a redução ocorre sobre todos os elementos.',
    mathematicalNotation: '\\sum_i x_{ij} \\quad (\\text{axis}=0)',
    visualAnalogy: 'Calcular o total de cada coluna (ou de cada linha) de uma planilha.',
    tfjsApi: ['tf.sum', 'tf.mean', 'tf.min', 'tf.max'],
    relatedConcepts: ['soma', 'media', 'eixo'],
    introducedInLab: 'lab-04-reductions',
  },
  {
    id: 'soma',
    title: 'Soma',
    shortDefinition: 'Redução que soma os valores ao longo de um eixo.',
    fullDefinition:
      'tf.sum adiciona os elementos ao longo do eixo indicado. Somar um vetor de temperaturas retorna o total; somar uma matriz no axis 0 retorna o total por coluna.',
    mathematicalNotation: '\\sum_{i} x_{ij}',
    tfjsApi: ['tf.sum'],
    relatedConcepts: ['reducao', 'media', 'eixo'],
    introducedInLab: 'lab-04-reductions',
  },
  {
    id: 'media',
    title: 'Média',
    shortDefinition: 'Redução que calcula a média aritmética ao longo de um eixo.',
    fullDefinition:
      'tf.mean soma os valores e divide pela quantidade. É uma das estatísticas mais usadas para resumir dados de treino e monitorar métricas.',
    mathematicalNotation: '\\bar{x} = \\frac{1}{n}\\sum_i x_i',
    tfjsApi: ['tf.mean'],
    relatedConcepts: ['reducao', 'soma', 'eixo'],
    introducedInLab: 'lab-04-reductions',
  },
  {
    id: 'eixo',
    title: 'Eixo (axis)',
    shortDefinition: 'Dimensão ao longo da qual uma operação é aplicada.',
    fullDefinition:
      'O axis identifica uma dimensão pelo índice (0 para linhas, 1 para colunas). Em reduções, axis=0 agrega as linhas e axis=-1 agrega a última dimensão. Entender o axis é essencial para não resumir os dados na direção errada.',
    visualAnalogy: 'Escolher se você soma "para baixo" (colunas) ou "para o lado" (linhas).',
    tfjsApi: ['tf.sum', 'tf.mean', 'tf.max'],
    relatedConcepts: ['reducao', 'shape'],
    introducedInLab: 'lab-04-reductions',
  },
  {
    id: 'transpose',
    title: 'transpose',
    shortDefinition: 'Troca a ordem das dimensões de um tensor.',
    fullDefinition:
      'tf.transpose retorna uma visão com os eixos permutados. Em uma matriz, transpor troca linhas por colunas. É usado para alinhar shapes antes de um matMul e para calcular correlações.',
    mathematicalNotation: 'A^T_{ij} = A_{ji}',
    visualAnalogy: 'Girar a planilha para que as colunas virem linhas.',
    tfjsApi: ['tf.transpose'],
    relatedConcepts: ['matriz', 'matMul', 'shape'],
    introducedInLab: 'lab-05-matrix',
  },
  {
    id: 'matMul',
    title: 'matMul',
    shortDefinition: 'Multiplicação de matrizes: produto escalar de linhas por colunas.',
    fullDefinition:
      'tf.matMul combina duas matrizes em que o número de colunas da primeira é igual ao número de linhas da segunda: [m, n] × [n, p] = [m, p]. Cada elemento do resultado é o produto escalar de uma linha de A com uma coluna de B. É a operação central das camadas densas.',
    mathematicalNotation: 'C_{ij} = \\sum_{k} A_{ik} B_{kj}',
    visualAnalogy: 'Cruzar cada linha de pedidos com cada coluna de preços.',
    tfjsApi: ['tf.matMul'],
    relatedConcepts: ['transpose', 'produto-escalar', 'shape'],
    introducedInLab: 'lab-05-matrix',
  },
  {
    id: 'produto-escalar',
    title: 'Produto escalar',
    shortDefinition: 'Soma dos produtos elemento a elemento de dois vetores.',
    fullDefinition:
      'O produto escalar (dot product) combina dois vetores de mesmo tamanho em um único número. Ele mede o alinhamento entre vetores e é a operação interna de cada elemento do matMul.',
    mathematicalNotation: '\\mathbf{a} \\cdot \\mathbf{b} = \\sum_i a_i b_i',
    tfjsApi: ['tf.dot', 'tf.matMul'],
    relatedConcepts: ['matMul', 'vetor', 'transformacao-linear'],
    introducedInLab: 'lab-05-matrix',
    reinforcedInLabs: ['lab-07-linear-algebra'],
  },
  {
    id: 'transformacao-linear',
    title: 'Transformação linear',
    shortDefinition: 'Função que mapeia vetores por multiplicação de matriz.',
    fullDefinition:
      'Uma transformação linear aplica uma matriz a um vetor (ou conjunto de vetores), produzindo rotação, escala, cisalhamento ou projeção. Multiplicar os pontos por uma matriz [2, 2] transforma cada ponto do plano; é o que uma camada densa faz com os dados.',
    mathematicalNotation: '\\mathbf{y} = M\\mathbf{x}',
    visualAnalogy: 'Esticar, girar ou inclinar uma foto guardando as proporções dos pontos.',
    tfjsApi: ['tf.matMul', 'tf.transpose'],
    relatedConcepts: ['matriz', 'produto-escalar', 'matMul'],
    introducedInLab: 'lab-07-linear-algebra',
  },
];

/** Compact `[id, title]` fallback for concepts authored in later phases. */
const CONCEPT_SEEDS: readonly [string, string][] = [
  ['dataset', 'Dataset'],
  ['feature', 'Feature'],
  ['label', 'Label'],
  ['loss', 'Loss'],
  ['epoca', 'Época'],
  ['batch', 'Batch'],
  ['learning-rate', 'Learning rate'],
  ['regressao-linear', 'Regressão linear'],
  ['mse', 'MSE'],
  ['predicao', 'Predição'],
  ['gradiente', 'Gradiente'],
  ['convergencia', 'Convergência'],
  ['minimo-local', 'Mínimo local'],
  ['neuronio', 'Neurônio'],
  ['peso', 'Peso'],
  ['bias', 'Bias'],
  ['soma-ponderada', 'Soma ponderada'],
  ['ativacao', 'Ativação'],
  ['sigmoid', 'Sigmoid'],
  ['relu', 'ReLU'],
  ['tanh', 'Tanh'],
  ['softmax', 'Softmax'],
  ['derivada', 'Derivada'],
  ['camada', 'Camada'],
  ['forward-propagation', 'Forward propagation'],
  ['backpropagation', 'Backpropagation'],
  ['treino', 'Treino'],
  ['classificacao', 'Classificação'],
  ['fronteira-de-decisao', 'Fronteira de decisão'],
  ['xor', 'XOR'],
  ['imagem', 'Imagem'],
  ['rgb', 'RGB'],
  ['grayscale', 'Grayscale'],
  ['normalizacao', 'Normalização'],
  ['memoria', 'Memória'],
  ['dispose', 'dispose'],
  ['tidy', 'tidy'],
  ['vazamento', 'Vazamento de memória'],
];

function toConcept(seed: ConceptSeed): ConceptSchema {
  return {
    id: seed.id,
    title: seed.title,
    shortDefinition: seed.shortDefinition ?? seed.title,
    fullDefinition: seed.fullDefinition ?? seed.title,
    mathematicalNotation: seed.mathematicalNotation,
    visualAnalogy: seed.visualAnalogy,
    tfjsApi: seed.tfjsApi ?? [],
    relatedConcepts: seed.relatedConcepts ?? [],
    introducedInLab: seed.introducedInLab ?? '',
    reinforcedInLabs: seed.reinforcedInLabs ?? [],
  };
}

/** All concept definitions, in authoring order. */
export const CONCEPTS: readonly ConceptSchema[] = [
  ...TENSOR_CONCEPTS.map(toConcept),
  ...CONCEPT_SEEDS.map(([id, title]) =>
    toConcept({ id, title, shortDefinition: title, fullDefinition: title }),
  ),
];

/** Set of every known concept id, for O(1) reference validation. */
export const CONCEPT_IDS: ReadonlySet<string> = new Set(CONCEPTS.map((concept) => concept.id));
