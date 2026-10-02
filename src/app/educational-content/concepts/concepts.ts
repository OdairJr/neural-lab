import type { Concept as ConceptSchema } from '@domain/content';

/**
 * V1 concept glossary.
 *
 * Every V1 concept has a full definition so the concept cards and the glossary
 * can render them: definitions are grouped by the phase that introduces them
 * (tensors & operations, neural networks, images & memory, and ML &
 * regression). This file is the single source of truth for concept ids so the
 * build-time validator can check every lab reference.
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

/** Concepts introduced by the Phase 4 laboratories (Labs 11-14). */
const NEURAL_CONCEPTS: readonly ConceptSeed[] = [
  {
    id: 'neuronio',
    title: 'Neurônio',
    shortDefinition: 'Unidade que combina entradas ponderadas, bias e uma ativação.',
    fullDefinition:
      'Um neurônio artificial recebe várias entradas, multiplica cada uma por um peso, soma tudo e adiciona um viés (bias). O resultado, chamado de soma ponderada (z), passa por uma função de ativação que produz a saída. É a unidade básica de uma rede neural e corresponde a uma camada densa de uma unidade.',
    mathematicalNotation: 'a = f\\left(\\sum_i w_i x_i + b\\right)',
    visualAnalogy:
      'Uma votação em que cada entrada tem um peso diferente e o resultado só "acende" se passar de um limiar.',
    tfjsApi: ['tf.layers.dense', 'tf.matMul', 'tf.add'],
    relatedConcepts: ['peso', 'bias', 'soma-ponderada', 'ativacao'],
    introducedInLab: 'lab-11-neuron',
  },
  {
    id: 'peso',
    title: 'Peso',
    shortDefinition: 'Número que multiplica uma entrada e indica sua importância.',
    fullDefinition:
      'O peso (weight) mede quanto cada entrada influencia a saída. Pesos grandes amplificam uma entrada; pesos próximos de zero a ignoram; pesos negativos invertem seu efeito. Aprender é justamente ajustar os pesos para reduzir o erro.',
    mathematicalNotation: 'w_i \\in \\mathbb{R}',
    visualAnalogy: 'O volume de cada microfone numa mesa de som.',
    tfjsApi: ['tf.variable', 'layer.getWeights()'],
    relatedConcepts: ['neuronio', 'bias', 'gradiente'],
    introducedInLab: 'lab-11-neuron',
  },
  {
    id: 'bias',
    title: 'Bias',
    shortDefinition: 'Termo somado à soma ponderada que desloca a ativação.',
    fullDefinition:
      'O bias (viés) é um número somado à soma ponderada antes da ativação. Ele permite que o neurônio "dispare" mesmo quando todas as entradas são zero, deslocando a fronteira de decisão. Sem bias, a reta de decisão passaria obrigatoriamente pela origem.',
    mathematicalNotation: 'z = \\sum_i w_i x_i + b',
    visualAnalogy: 'O ajuste de altura de um termostato, independente da temperatura lida.',
    tfjsApi: ['tf.add', 'tf.layers.dense'],
    relatedConcepts: ['neuronio', 'peso', 'soma-ponderada'],
    introducedInLab: 'lab-11-neuron',
  },
  {
    id: 'soma-ponderada',
    title: 'Soma ponderada',
    shortDefinition: 'Combinação linear das entradas pelos pesos, mais o bias.',
    fullDefinition:
      'A soma ponderada (z) é o produto escalar entre o vetor de entradas e o vetor de pesos, somado ao bias. É a etapa linear do neurônio; a não-linearidade vem depois, na ativação.',
    mathematicalNotation: 'z = \\mathbf{w}\\cdot\\mathbf{x} + b',
    visualAnalogy: 'O total de uma conta em que cada item tem um preço diferente.',
    tfjsApi: ['tf.dot', 'tf.matMul', 'tf.add'],
    relatedConcepts: ['neuronio', 'produto-escalar', 'peso', 'bias'],
    introducedInLab: 'lab-11-neuron',
  },
  {
    id: 'ativacao',
    title: 'Ativação',
    shortDefinition: 'Função não-linear aplicada à soma ponderada do neurônio.',
    fullDefinition:
      'A função de ativação transforma a soma ponderada em saída. Sem ela, várias camadas lineares equivaleriam a uma só; a não-linearidade é o que permite à rede aprender fronteiras curvas. Exemplos: sigmoid, ReLU, tanh e softmax.',
    mathematicalNotation: 'a = f(z)',
    visualAnalogy: 'O botão que decide se o sinal passa, é bloqueado ou é amplificado.',
    tfjsApi: ['tf.sigmoid', 'tf.relu', 'tf.tanh', 'tf.softmax'],
    relatedConcepts: ['neuronio', 'sigmoid', 'relu', 'tanh', 'softmax'],
    introducedInLab: 'lab-11-neuron',
    reinforcedInLabs: ['lab-12-activations'],
  },
  {
    id: 'sigmoid',
    title: 'Sigmoid',
    shortDefinition: 'Ativação em forma de S que comprime a saída para (0, 1).',
    fullDefinition:
      'A sigmoid mapeia qualquer número real para o intervalo (0, 1), sendo ideal para a saída de uma classificação binária (probabilidade). Sua derivada é f(z)·(1 − f(z)), que fica próxima de zero para |z| grande (saturação), o que pode causar gradientes que desaparecem.',
    mathematicalNotation: '\\sigma(z) = \\frac{1}{1 + e^{-z}}',
    visualAnalogy: 'Um dimmer que nunca apaga nem acende totalmente.',
    tfjsApi: ['tf.sigmoid'],
    relatedConcepts: ['ativacao', 'derivada', 'classificacao'],
    introducedInLab: 'lab-12-activations',
  },
  {
    id: 'relu',
    title: 'ReLU',
    shortDefinition: 'Ativação que zera negativos e mantém positivos.',
    fullDefinition:
      'A ReLU (rectified linear unit) retorna max(0, z). É barata de calcular e evita a saturação para valores positivos, sendo o padrão em camadas ocultas. Para z < 0 a derivada é 0, o que pode "desligar" neurônios.',
    mathematicalNotation: '\\text{ReLU}(z) = \\max(0, z)',
    visualAnalogy: 'Uma catraca que só deixa passar em uma direção.',
    tfjsApi: ['tf.relu'],
    relatedConcepts: ['ativacao', 'derivada', 'camada'],
    introducedInLab: 'lab-12-activations',
  },
  {
    id: 'tanh',
    title: 'Tanh',
    shortDefinition: 'Ativação em forma de S centrada em zero, no intervalo (-1, 1).',
    fullDefinition:
      'A tangente hiperbólica comprime a saída para (−1, 1) e é centrada em zero, o que costuma acelerar o treino em relação à sigmoid. Sua derivada é 1 − tanh(z)² e também sofre saturação nas extremidades.',
    mathematicalNotation: '\\tanh(z) = \\frac{e^{z} - e^{-z}}{e^{z} + e^{-z}}',
    visualAnalogy: 'Um termômetro que marca de −1 a +1, com zero no meio.',
    tfjsApi: ['tf.tanh'],
    relatedConcepts: ['ativacao', 'derivada', 'sigmoid'],
    introducedInLab: 'lab-12-activations',
  },
  {
    id: 'softmax',
    title: 'Softmax',
    shortDefinition: 'Transforma um vetor de logits em probabilidades que somam 1.',
    fullDefinition:
      'A softmax aplica a exponencial a cada logit e divide pela soma, produzindo uma distribuição de probabilidade sobre várias classes. É usada na saída de classificações multiclasse, normalmente com rótulos one-hot e perda de entropia cruzada.',
    mathematicalNotation: '\\text{softmax}(z)_i = \\frac{e^{z_i}}{\\sum_j e^{z_j}}',
    visualAnalogy: 'Repartir 100% de confiança entre várias opções.',
    tfjsApi: ['tf.softmax'],
    relatedConcepts: ['ativacao', 'classificacao', 'backpropagation'],
    introducedInLab: 'lab-12-activations',
    reinforcedInLabs: ['lab-14-classification'],
  },
  {
    id: 'derivada',
    title: 'Derivada',
    shortDefinition: 'Taxa de variação usada para propagar o erro no treino.',
    fullDefinition:
      'A derivada de uma função de ativação mede como a saída muda quando a entrada muda. A retropropagação multiplica essas derivadas ao longo da rede; derivadas pequenas em muitos termos fazem o gradiente "desaparecer" (vanishing gradient), dificultando o treino de redes profundas.',
    mathematicalNotation: "f'(z) = \\frac{df}{dz}",
    visualAnalogy: 'A inclinação da rampa num ponto: o quanto você sobe por passo.',
    tfjsApi: ['tf.grad', 'tf.variableGrads'],
    relatedConcepts: ['ativacao', 'gradiente', 'backpropagation'],
    introducedInLab: 'lab-12-activations',
  },
  {
    id: 'camada',
    title: 'Camada',
    shortDefinition: 'Conjunto de neurônios que processa as saídas da camada anterior.',
    fullDefinition:
      'Uma camada agrupa neurônios que compartilham as mesmas entradas. A camada de entrada recebe os dados; as camadas ocultas transformam as representações; a camada de saída produz a predição. Uma camada densa conecta todos os neurônios da camada anterior a todos os da seguinte.',
    mathematicalNotation:
      '\\mathbf{a}^{(l)} = f\\left(W^{(l)}\\mathbf{a}^{(l-1)} + \\mathbf{b}^{(l)}\\right)',
    visualAnalogy: 'Estações de uma linha de montagem, cada uma transformando o que recebe.',
    tfjsApi: ['tf.layers.dense', 'tf.sequential'],
    relatedConcepts: ['neuronio', 'forward-propagation', 'backpropagation'],
    introducedInLab: 'lab-13-neural-networks',
  },
  {
    id: 'forward-propagation',
    title: 'Forward propagation',
    shortDefinition: 'Passagem das entradas pela rede até a saída.',
    fullDefinition:
      'A propagação direta calcula, camada a camada, as somas ponderadas e ativações até produzir a predição. É o passo usado tanto no treino quanto na inferência; o resultado é comparado aos rótulos para calcular a perda.',
    mathematicalNotation: '\\hat{y} = f^{(L)}\\left(\\cdots f^{(1)}(\\mathbf{x})\\right)',
    visualAnalogy: 'O sinal percorrendo os cabos do painel até a lâmpada acender.',
    tfjsApi: ['model.predict', 'tf.matMul'],
    relatedConcepts: ['camada', 'backpropagation', 'loss'],
    introducedInLab: 'lab-13-neural-networks',
  },
  {
    id: 'backpropagation',
    title: 'Backpropagation',
    shortDefinition: 'Cálculo dos gradientes do erro propagados da saída para a entrada.',
    fullDefinition:
      'A retropropagação aplica a regra da cadeia de trás para frente: partindo do erro na saída, calcula o gradiente de cada peso e bias. Esses gradientes alimentam a descida do gradiente. É o que torna viável treinar redes com milhares de parâmetros.',
    mathematicalNotation:
      "\\delta^{(l)} = \\left(W^{(l+1)T}\\delta^{(l+1)}\\right)\\odot f'(z^{(l)})",
    visualAnalogy:
      'Um boletim de erros percorrendo a linha de montagem ao contrário para corrigir cada estação.',
    tfjsApi: ['tf.variableGrads', 'model.fit', 'tf.grad'],
    relatedConcepts: ['forward-propagation', 'derivada', 'gradiente', 'treino'],
    introducedInLab: 'lab-13-neural-networks',
  },
  {
    id: 'treino',
    title: 'Treino',
    shortDefinition: 'Ciclo de forward, perda, backprop e atualização de pesos.',
    fullDefinition:
      'Treinar uma rede é repetir épocas: propagar os dados (forward), calcular a perda, retropropagar os gradientes e atualizar os pesos com a descida do gradiente. Ao longo das épocas a perda cai e a acurácia sobe, até estabilizar.',
    mathematicalNotation: '\\theta \\leftarrow \\theta - \\eta \\nabla_\\theta J(\\theta)',
    visualAnalogy:
      'Uma sessão de estudos com exercícios, correção e ajuste da estratégia, repetida várias vezes.',
    tfjsApi: ['model.fit', 'model.compile', 'optimizer.applyGradients'],
    relatedConcepts: ['epoca', 'loss', 'backpropagation', 'gradiente'],
    introducedInLab: 'lab-13-neural-networks',
  },
  {
    id: 'classificacao',
    title: 'Classificação',
    shortDefinition: 'Prever a categoria (classe) de uma entrada.',
    fullDefinition:
      'Classificação atribui uma entrada a uma entre várias classes. Na binária a saída usa sigmoid; na multiclasse, softmax com rótulos one-hot e perda de entropia cruzada. A qualidade é medida por acurácia, matriz de confusão e outras métricas.',
    mathematicalNotation: '\\hat{y} = \\arg\\max_k p_k',
    visualAnalogy: 'Separar cartas em pilhas por naipe.',
    tfjsApi: ['tf.argMax', 'tf.oneHot', 'tf.metrics.categoricalAccuracy'],
    relatedConcepts: ['softmax', 'fronteira-de-decisao', 'label', 'loss'],
    introducedInLab: 'lab-14-classification',
  },
  {
    id: 'fronteira-de-decisao',
    title: 'Fronteira de decisão',
    shortDefinition: 'Região do espaço onde o modelo muda de classe prevista.',
    fullDefinition:
      'A fronteira de decisão é o conjunto de pontos em que o modelo está "em cima do muro" entre duas classes. Um neurônio linear produz uma reta; adicionar camadas ocultas permite fronteiras curvas e regiões complexas. Visualizar essa fronteira é uma forma direta de entender o que a rede aprendeu.',
    mathematicalNotation: '\\{x : p(y=1\\mid x) = 0{,}5\\}',
    visualAnalogy: 'A linha que separa os dois lados num campo de futebol.',
    tfjsApi: ['model.predict', 'tf.argMax'],
    relatedConcepts: ['classificacao', 'neuronio', 'camada'],
    introducedInLab: 'lab-14-classification',
  },
  {
    id: 'xor',
    title: 'XOR',
    shortDefinition: 'Problema não linearmente separável que exige camadas ocultas.',
    fullDefinition:
      'O XOR (ou-exclusivo) vale 1 quando exatamente uma das entradas é 1. Seus quatro pontos não podem ser separados por uma única reta, então um neurônio linear falha. Com uma camada oculta com pelo menos dois neurônios, a rede aprende uma fronteira não-linear e resolve o problema.',
    mathematicalNotation: 'y = x_1 \\oplus x_2',
    visualAnalogy:
      'Dois interruptores que ligam a luz só quando estão em posições diferentes.',
    tfjsApi: ['tf.layers.dense', 'tf.sequential'],
    relatedConcepts: ['fronteira-de-decisao', 'camada', 'classificacao'],
    introducedInLab: 'lab-14-classification',
  },
];

/** Concepts introduced by the Phase 5 laboratories (Labs 15-16). */
const IMAGE_CONCEPTS: readonly ConceptSeed[] = [
  {
    id: 'imagem',
    title: 'Imagem',
    shortDefinition: 'Grade de pixels que vira um tensor [altura, largura, canais].',
    fullDefinition:
      'Uma imagem digital é uma grade de pixels. Cada pixel guarda a intensidade de um ou mais canais (vermelho, verde e azul em uma foto colorida), então a imagem inteira é representada como um tensor de rank 3: [altura, largura, canais]. É essa a forma que uma rede convolucional recebe como entrada.',
    mathematicalNotation: 'I \\in \\mathbb{R}^{H \\times W \\times C}',
    visualAnalogy: 'Um mosaico de azulejos em que cada azulejo guarda três números: quanto de vermelho, verde e azul.',
    tfjsApi: ['tf.browser.fromPixels', 'tf.image.resizeBilinear'],
    relatedConcepts: ['tensor', 'rgb', 'grayscale', 'normalizacao'],
    introducedInLab: 'lab-15-images',
  },
  {
    id: 'rgb',
    title: 'RGB',
    shortDefinition: 'Três canais (vermelho, verde, azul) que descrevem a cor de cada pixel.',
    fullDefinition:
      'O modelo RGB descreve uma cor por três intensidades, normalmente de 0 a 255. Em uma imagem colorida o tensor tem shape [altura, largura, 3], com as três intensidades intercaladas por pixel. Praticamente todo modelo pré-treinado de visão espera a entrada nesse formato de canais por último (channels-last).',
    mathematicalNotation: '(R, G, B) \\in [0, 255]^3',
    visualAnalogy: 'Misturar três tintas — vermelha, verde e azul — para produzir qualquer cor.',
    tfjsApi: ['tf.browser.fromPixels', 'tf.split'],
    relatedConcepts: ['imagem', 'grayscale', 'tensor'],
    introducedInLab: 'lab-15-images',
  },
  {
    id: 'grayscale',
    title: 'Grayscale',
    shortDefinition: 'Imagem de um único canal obtida pela luminância dos canais RGB.',
    fullDefinition:
      'Converter uma imagem para escala de cinza substitui as três intensidades por um único valor de brilho. Usamos a luminância 0,299·R + 0,587·G + 0,114·B, que pondera os canais conforme a sensibilidade do olho humano (os coeficientes do padrão BT.601). O tensor passa a ter shape [altura, largura, 1], reduzindo o custo de cálculo.',
    mathematicalNotation: 'Y = 0{,}299R + 0{,}587G + 0{,}114B',
    visualAnalogy: 'Tirar uma foto em preto e branco: as cores viram tons de cinza.',
    tfjsApi: ['tf.sum', 'tf.mul'],
    relatedConcepts: ['imagem', 'rgb', 'normalizacao'],
    introducedInLab: 'lab-15-images',
  },
  {
    id: 'normalizacao',
    title: 'Normalização',
    shortDefinition: 'Reescala os valores dos pixels para uma faixa pequena e centrada.',
    fullDefinition:
      'Redes treinam melhor quando as entradas têm escala controlada. A normalização unitária divide os pixels por 255 e produz o intervalo [0, 1]; a normalização com sinal aplica (x / 255 − 0,5)·2 e produz [−1, 1], que é a entrada esperada pela MobileNet. Sem normalizar, gradientes ficam instáveis e o treino converge devagar.',
    mathematicalNotation: 'x_{unit} = x / 255, \\quad x_{signed} = (x / 255 - 0{,}5) \\cdot 2',
    visualAnalogy: 'Converter uma medida em metros para centímetros: mesma informação, escala adequada.',
    tfjsApi: ['tf.div', 'tf.sub', 'tf.mul'],
    relatedConcepts: ['imagem', 'rgb', 'grayscale', 'learning-rate'],
    introducedInLab: 'lab-15-images',
  },
];

/** Concepts introduced by the Phase 5 memory laboratory (Lab 16). */
const MEMORY_CONCEPTS: readonly ConceptSeed[] = [
  {
    id: 'memoria',
    title: 'Memória (TF.js)',
    shortDefinition: 'Recurso ocupado pelos tensores vivos, medido por tf.memory().',
    fullDefinition:
      'Cada tensor criado reserva memória na GPU (WebGL/WebGPU) ou na CPU. tf.memory() informa quantos tensores estão vivos (numTensors), quantos bytes estão reservados (numBytes) e se a contagem é confiável (unreliable). Monitorar essa API é a forma prática de detectar vazamentos durante uma sessão.',
    visualAnalogy: 'O medidor de uma pia: quantos pratos ainda estão sujos.',
    tfjsApi: ['tf.memory', 'tf.disposeVariables'],
    relatedConcepts: ['tensor', 'dispose', 'tidy', 'vazamento'],
    introducedInLab: 'lab-16-memory',
  },
  {
    id: 'dispose',
    title: 'dispose',
    shortDefinition: 'Libera manualmente a memória ocupada por um tensor.',
    fullDefinition:
      'tensor.dispose() devolve imediatamente a memória daquele tensor. Também há tf.dispose(container) para arrays/objetos de tensores e tf.disposeVariables() para variáveis. O descarte explícito é necessário para tensores de vida longa que ficam fora de um tf.tidy.',
    visualAnalogy: 'Lavar um prato específico assim que termina de usá-lo.',
    tfjsApi: ['tensor.dispose', 'tf.dispose', 'tf.disposeVariables'],
    relatedConcepts: ['memoria', 'tidy', 'vazamento'],
    introducedInLab: 'lab-16-memory',
  },
  {
    id: 'tidy',
    title: 'tidy',
    shortDefinition: 'Executa um bloco e libera automaticamente todos os tensores não retornados.',
    fullDefinition:
      'tf.tidy(fn) executa fn e, ao final, descarta todos os tensores criados dentro do bloco, exceto o valor retornado (que pode ser um tensor, um array ou um objeto de tensores). É a forma mais segura de evitar vazamentos em cálculos intermediários, pois o descarte deixa de depender de disciplina manual.',
    visualAnalogy: 'Lavar toda a louça usada no preparo, deixando de fora só o prato que vai à mesa.',
    tfjsApi: ['tf.tidy'],
    relatedConcepts: ['memoria', 'dispose', 'vazamento'],
    introducedInLab: 'lab-16-memory',
  },
  {
    id: 'vazamento',
    title: 'Vazamento de memória',
    shortDefinition: 'Tensores criados e nunca descartados, acumulando memória.',
    fullDefinition:
      'Um vazamento acontece quando tensores deixam de ser usados mas continuam vivos — por exemplo, criados em um loop sem dispose nem tidy. A memória cresce a cada iteração até degradar o desempenho ou esgotar o backend. Não é um erro lançado pelo JavaScript: só o monitoramento de tf.memory() revela o problema.',
    visualAnalogy: 'Empilhar pratos na pia sem lavar nenhum até ela transbordar.',
    tfjsApi: ['tf.memory', 'tf.tidy', 'tensor.dispose'],
    relatedConcepts: ['memoria', 'dispose', 'tidy'],
    introducedInLab: 'lab-16-memory',
  },
];

/** Concepts introduced by the Phase 3 ML & regression laboratories (Labs 8-10). */
const ML_CONCEPTS: readonly ConceptSeed[] = [
  {
    id: 'dataset',
    title: 'Dataset',
    shortDefinition: 'Conjunto de exemplos usados para treinar e avaliar um modelo.',
    fullDefinition:
      'Um dataset (conjunto de dados) reúne os exemplos que alimentam o aprendizado. Cada exemplo traz as características (features) e, no aprendizado supervisionado, o rótulo (label) a prever. O dataset costuma ser dividido em treino, validação e teste para medir a capacidade de generalização.',
    mathematicalNotation: '\\mathcal{D} = \\{(\\mathbf{x}_i, y_i)\\}_{i=1}^{n}',
    visualAnalogy: 'Uma pilha de fichas de imóveis, cada ficha com os dados da casa e seu preço.',
    tfjsApi: ['tf.data.csv', 'tf.tensor2d', 'tf.tensor1d'],
    relatedConcepts: ['feature', 'label', 'treino', 'epoca', 'batch', 'loss'],
    introducedInLab: 'lab-08-ml-fundamentals',
  },
  {
    id: 'feature',
    title: 'Feature',
    shortDefinition: 'Característica de entrada que descreve um exemplo.',
    fullDefinition:
      'Uma feature (característica) é uma informação de entrada observada, como a área, o número de quartos ou a idade de uma casa. Em TF.js elas ficam em uma matriz [amostras, features]. Escolher features informativas — normalmente as mais correlacionadas com o alvo — melhora o aprendizado.',
    mathematicalNotation: '\\mathbf{x} \\in \\mathbb{R}^{d}',
    visualAnalogy: 'Os campos de um formulário preenchidos para descrever cada objeto.',
    tfjsApi: ['tf.tensor2d', 'tf.mean', 'tf.max'],
    relatedConcepts: ['dataset', 'label', 'predicao'],
    introducedInLab: 'lab-08-ml-fundamentals',
  },
  {
    id: 'label',
    title: 'Label',
    shortDefinition: 'Resposta esperada (alvo) para cada exemplo do dataset.',
    fullDefinition:
      'O label (rótulo) é o valor que queremos prever: um preço na regressão, uma categoria na classificação. No treino supervisionado, o modelo compara sua predição com o label por meio da função de custo e ajusta os parâmetros para reduzir a diferença.',
    mathematicalNotation: 'y \\in \\mathbb{R} \\;\\text{ou}\\; y \\in \\{1, \\ldots, K\\}',
    visualAnalogy: 'A resposta anotada no verso da ficha, usada para corrigir o palpite.',
    tfjsApi: ['tf.tensor1d', 'tf.oneHot'],
    relatedConcepts: ['dataset', 'feature', 'classificacao', 'loss'],
    introducedInLab: 'lab-08-ml-fundamentals',
  },
  {
    id: 'loss',
    title: 'Loss',
    shortDefinition: 'Função que mede o erro entre predição e valor esperado.',
    fullDefinition:
      'A função de custo (loss) transforma o erro do modelo em um número que se busca minimizar. No treino, ela é avaliada a cada lote e seu gradiente orienta a atualização dos pesos. Exemplos: MSE para regressão e entropia cruzada para classificação.',
    mathematicalNotation: 'J(\\theta) = \\frac{1}{n}\\sum_i L(\\hat{y}_i, y_i)',
    visualAnalogy: 'A nota vermelha de um boletim: quanto menor, melhor o desempenho.',
    tfjsApi: ['tf.losses.meanSquaredError', 'tf.losses.softmaxCrossEntropy'],
    relatedConcepts: ['mse', 'treino', 'gradiente', 'epoca'],
    introducedInLab: 'lab-08-ml-fundamentals',
  },
  {
    id: 'epoca',
    title: 'Época',
    shortDefinition: 'Uma passagem completa por todo o conjunto de treino.',
    fullDefinition:
      'Uma época (epoch) é uma varredura completa do dataset de treino. Treinar por várias épocas permite que o modelo veja os dados repetidamente e refine os pesos. Poucas épocas deixam o modelo subajustado; muitas podem causar sobreajuste (overfitting) e decorar o treino.',
    mathematicalNotation: '\\text{1 época} = \\lceil n / B \\rceil \\text{ passos}',
    visualAnalogy: 'Reler o livro inteiro do começo ao fim antes de começar de novo.',
    tfjsApi: ['model.fit({ epochs })'],
    relatedConcepts: ['treino', 'batch', 'loss'],
    introducedInLab: 'lab-08-ml-fundamentals',
  },
  {
    id: 'batch',
    title: 'Batch',
    shortDefinition: 'Subconjunto de exemplos processado em uma única atualização.',
    fullDefinition:
      'Um batch (lote) agrupa exemplos para calcular a perda e atualizar os pesos de uma vez. O mini-batch gradient descent equilibra estabilidade e custo: lotes pequenos são ruidosos e rápidos, lotes grandes são estáveis e mais caros. O tamanho do lote influencia quantos passos cabem em uma época.',
    mathematicalNotation: 'B = \\text{tamanho do lote}, \\quad \\text{passos/época} = n / B',
    visualAnalogy: 'Corrigir um monte de provas por vez, em vez de uma prova por vez ou todas de uma vez.',
    tfjsApi: ['model.fit({ batchSize })'],
    relatedConcepts: ['dataset', 'epoca', 'treino', 'learning-rate'],
    introducedInLab: 'lab-08-ml-fundamentals',
  },
  {
    id: 'learning-rate',
    title: 'Learning rate',
    shortDefinition: 'Tamanho do passo dado na direção do gradiente.',
    fullDefinition:
      'A taxa de aprendizado (learning rate, η) controla quanto os pesos mudam a cada atualização. Se for pequena demais, o treino demora a convergir; se for grande demais, o erro oscila e pode divergir. Ajustá-la é uma das decisões mais importantes na descida do gradiente.',
    mathematicalNotation: '\\theta \\leftarrow \\theta - \\eta \\nabla_\\theta J(\\theta)',
    visualAnalogy: 'O tamanho dos passos ao descer uma encosta: passos curtos demoram, passos largos podem passar do ponto.',
    tfjsApi: ['tf.train.sgd', 'tf.train.adam'],
    relatedConcepts: ['gradiente', 'convergencia', 'minimo-local', 'treino'],
    introducedInLab: 'lab-08-ml-fundamentals',
    reinforcedInLabs: ['lab-10-gradient-descent'],
  },
  {
    id: 'regressao-linear',
    title: 'Regressão linear',
    shortDefinition: 'Modelo que ajusta uma reta para prever um valor contínuo.',
    fullDefinition:
      'A regressão linear modela a relação entre uma ou mais features e um alvo contínuo com uma equação linear y = wx + b. Aprender consiste em encontrar o peso w e o intercepto b que minimizam o erro quadrático sobre os dados. É o ponto de partida para entender modelos mais complexos.',
    mathematicalNotation: '\\hat{y} = w x + b',
    visualAnalogy: 'Esticar uma régua entre os pontos e usar a régua para estimar valores novos.',
    tfjsApi: ['tf.tensor2d', 'tf.matMul', 'tf.losses.meanSquaredError'],
    relatedConcepts: ['predicao', 'mse', 'dataset', 'feature'],
    introducedInLab: 'lab-09-linear-regression',
  },
  {
    id: 'mse',
    title: 'MSE',
    shortDefinition: 'Erro quadrático médio: média dos erros ao quadrado.',
    fullDefinition:
      'O MSE (mean squared error) mede a perda média elevando ao quadrado a diferença entre predição e valor real. Elevar ao quadrado penaliza mais os erros grandes e torna a função suave, facilitando o cálculo do gradiente. É a loss padrão da regressão linear.',
    mathematicalNotation: '\\text{MSE} = \\frac{1}{n}\\sum_i (\\hat{y}_i - y_i)^2',
    visualAnalogy: 'Medir o quanto a régua passa longe de cada ponto, preferindo penalizar mais os furos maiores.',
    tfjsApi: ['tf.losses.meanSquaredError'],
    relatedConcepts: ['loss', 'regressao-linear', 'predicao', 'gradiente'],
    introducedInLab: 'lab-09-linear-regression',
  },
  {
    id: 'predicao',
    title: 'Predição',
    shortDefinition: 'Saída produzida pelo modelo para uma entrada.',
    fullDefinition:
      'A predição (prediction) é o valor estimado pelo modelo: ŷ para uma entrada x. Na regressão é um número; na classificação é uma classe ou uma probabilidade. Comparar a predição com o label durante o treino fornece o erro que orienta o aprendizado.',
    mathematicalNotation: '\\hat{y} = f(\\mathbf{x})',
    visualAnalogy: 'O palpite do modelo antes de conferir a resposta certa.',
    tfjsApi: ['model.predict', 'tf.matMul'],
    relatedConcepts: ['regressao-linear', 'label', 'loss'],
    introducedInLab: 'lab-09-linear-regression',
  },
  {
    id: 'gradiente',
    title: 'Gradiente',
    shortDefinition: 'Direção de maior crescimento da perda em relação aos parâmetros.',
    fullDefinition:
      'O gradiente reúne as derivadas parciais da perda em relação a cada parâmetro e aponta para a direção em que o erro cresce mais rápido. A descida do gradiente caminha no sentido oposto, reduzindo a perda passo a passo. Em TF.js ele é obtido automaticamente por autodiferenciação.',
    mathematicalNotation: '\\nabla_\\theta J = \\left[\\frac{\\partial J}{\\partial \\theta_1}, \\ldots, \\frac{\\partial J}{\\partial \\theta_k}\\right]',
    visualAnalogy: 'A bússola de inclinação: ela indica onde o terreno sobe mais, então você desce na direção contrária.',
    tfjsApi: ['tf.grad', 'tf.variableGrads', 'optimizer.minimize'],
    relatedConcepts: ['derivada', 'learning-rate', 'convergencia', 'minimo-local', 'treino'],
    introducedInLab: 'lab-10-gradient-descent',
  },
  {
    id: 'convergencia',
    title: 'Convergência',
    shortDefinition: 'Estabilização da perda quando o treino encontra um bom ajuste.',
    fullDefinition:
      'Dizemos que o treino convergiu quando a perda para de cair de forma relevante e os parâmetros se estabilizam. O learning rate e o formato da superfície de custo determinam a velocidade e a qualidade da convergência; passos grandes podem impedir que ela aconteça.',
    mathematicalNotation: '\\|\\nabla_\\theta J\\| \\to 0',
    visualAnalogy: 'A bola parando no fundo da tigela, sem subir mais pelas paredes.',
    tfjsApi: ['model.fit({ epochs, callbacks })'],
    relatedConcepts: ['gradiente', 'learning-rate', 'minimo-local'],
    introducedInLab: 'lab-10-gradient-descent',
  },
  {
    id: 'minimo-local',
    title: 'Mínimo local',
    shortDefinition: 'Ponto baixo da superfície de custo do qual não se sai com passos simples.',
    fullDefinition:
      'Um mínimo local é um vale que não é o menor de todos (o mínimo global). A descida do gradiente pode ficar presa nele se os passos forem pequenos. Learning rates maiores, momentum ou otimizadores adaptativos ajudam a escapar desses vales.',
    mathematicalNotation: '\\nabla_\\theta J(\\theta^*) = 0 \\;\\text{sem ser mínimo global}',
    visualAnalogy: 'Uma cratera pequena no meio da descida: parece o fim, mas ainda há um vale mais fundo adiante.',
    tfjsApi: ['tf.train.adam', 'tf.train.momentum'],
    relatedConcepts: ['gradiente', 'convergencia', 'learning-rate'],
    introducedInLab: 'lab-10-gradient-descent',
  },
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
  ...NEURAL_CONCEPTS.map(toConcept),
  ...IMAGE_CONCEPTS.map(toConcept),
  ...MEMORY_CONCEPTS.map(toConcept),
  ...ML_CONCEPTS.map(toConcept),
];

/** Set of every known concept id, for O(1) reference validation. */
export const CONCEPT_IDS: ReadonlySet<string> = new Set(CONCEPTS.map((concept) => concept.id));
