# Lab 15 — Imagens como Tensores

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 15 |
| Slug | `15-imagens-como-tensores` |
| ID | `lab-15-images` |
| Categoria | Imagens |
| Tempo estimado | 35 minutos |
| Pré-requisitos | [Lab 14 — Classificação e Fronteiras de Decisão](14-classificacao-e-fronteiras-de-decisao.md) |
| Conceitos | `imagem`, `rgb`, `grayscale`, `normalizacao` |
| Orçamento de memória | 50 MB |

## Conceitos cobertos

Uma **imagem** é uma grade de pixels representada como tensor de rank 3
`[altura, largura, canais]`. **RGB** usa 3 canais; **grayscale** usa 1, pela
luminância `0,299·R + 0,587·G + 0,114·B`. A **normalização** reescala os pixels
para `[0, 1]` (unitária) ou `[-1, 1]` (com sinal, padrão MobileNet). Veja
[TF.js: imagens e pixels](../tensorflow-concepts.md#images-and-pixels) e
[math: imagens como tensores](../mathematical-concepts.md#images-as-tensors).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Máquinas também enxergam pixels | `markdown` | Vê a foto virar tensor e a necessidade de pré-processamento. |
| 2 | `conceito` | Conceito: imagem | `concept-card` | Abre o cartão do conceito `imagem`. |
| 3 | `analogia` | Analogia: o mosaico de azulejos | `markdown` | Compara pixels a azulejos com 3 números de cor. |
| 4 | `exemplo-visual` | Uma imagem é uma matriz de números | `visualization` (`matrix-heatmap`) | Vê uma imagem 4×4 em escala de cinza. |
| 5 | `demonstracao` | Imagem e tensor lado a lado | `visualization` (`image-tensor`) | Compara a imagem RGB com os valores do tensor. |
| 6 | `experimentacao` | Carregue uma imagem e veja o tensor | `experiment` | Envia imagem, escolhe canais, tamanho e normalização. |
| 7 | `desafio` | Desafio: prepare uma imagem para a MobileNet | `challenge` | Configura a entrada esperada pela MobileNet. |
| 8 | `explicacao` | Canais, resize e normalização | `markdown` | Lê luminância, resize e as duas normalizações. |
| 9 | `codigo` | Código: de pixels a tensor | `code-view` | Lê `tf.browser.fromPixels` e `resizeBilinear`. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula shape, canais, resize e normalização. |

## Guia do experimento

- **Função:** `lab-15-images` (`src/app/features/labs/lab-15-images/lab-15-images.experiments.ts`).
- **Parâmetros:**
  - `image` (tipo `image`): PNG/JPG enviado; sem upload, usa uma imagem de exemplo.
  - `channels` (string, padrão `rgb`; opções `rgb`, `grayscale`).
  - `size` (number, padrão `16`, faixa 16 a 224, passo 16): a imagem é redimensionada para `size × size`.
  - `normalization` (string, padrão `unit`; opções `none`, `unit`, `signed`).
- **O que muda:** a imagem vira um tensor `[H, W, 3]` (browser
  `tf.browser.fromPixels(image).toFloat()`, com fallback `tf.tensor3d` sem DOM),
  é redimensionada, opcionalmente convertida para `[H, W, 1]` e normalizada. A
  visualização mostra a original e o tensor; o painel publica os tensores de RGB,
  grayscale e o processado.
- **O que observar:** o shape e a faixa de valores mudam com canais, tamanho e
  normalização; `none` mantém `[0, 255]`, `unit` produz `[0, 1]` e `signed`
  produz `[-1, 1]`.

## Desafio

- **Tipo de validação:** `parameter-match`.
- **O que é pedido:** configurar a entrada esperada pela MobileNet: 224×224, 3
  canais RGB e pixels em `[-1, 1]`.
- **Resposta correta:** `{ size: 224, channels: 'rgb', normalization: 'signed' }`.

## Principais aprendizados

- Uma imagem é um tensor `[altura, largura, canais]`.
- RGB usa 3 canais; grayscale usa 1, pela luminância BT.601.
- `resizeBilinear` ajusta a entrada ao tamanho fixo da rede.
- Normalizar para `[0, 1]` ou `[-1, 1]` ajuda o treino; a MobileNet usa `[-1, 1]` em 224×224.

## Referências cruzadas

- TF.js: [`tf.browser.fromPixels`, `tf.image.resizeBilinear`, `tf.tensor3d`](../tensorflow-concepts.md#images-and-pixels), [`tf.sum` com keepDims](../tensorflow-concepts.md#reductions).
- Matemática: [imagem como tensor, luminância e normalização](../mathematical-concepts.md#images-as-tensors).
