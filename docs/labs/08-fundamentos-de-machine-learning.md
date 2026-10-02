# Lab 8 — Fundamentos de Machine Learning

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 8 |
| Slug | `08-fundamentos-de-machine-learning` |
| ID | `lab-08-ml-fundamentals` |
| Categoria | Machine Learning |
| Tempo estimado | 30 minutos |
| Pré-requisitos | [Lab 7 — Álgebra Linear Aplicada](07-algebra-linear-aplicada.md) |
| Conceitos | `dataset`, `feature`, `label`, `loss`, `epoca`, `batch`, `learning-rate` |
| Orçamento de memória | 50 MB |

## Conceitos cobertos

Um **dataset** reúne exemplos; cada exemplo tem **features** (`x`) e um
**label** (`y`). O dataset é dividido em treino e validação/teste; o treino
ocorre em **épocas** e, opcionalmente, em **batches**. A **loss** mede o erro e
o **learning rate** controla o tamanho do passo. Veja
[TF.js: `tf.data.csv` e tensores](../tensorflow-concepts.md#data-loading) e
[math: datasets](../mathematical-concepts.md#datasets-features-labels-and-splits).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Dados antes de modelos | `markdown` | Vê a pergunta "quais informações tenho e o que quero prever?". |
| 2 | `conceito` | Conceito: dataset | `concept-card` | Abre o cartão do conceito `dataset`. |
| 3 | `analogia` | Analogia: fichas de imóveis | `markdown` | Relaciona ficha/exemplo, campos/features e resposta/label. |
| 4 | `exemplo-visual` | Correlações com o preço | `visualization` (`matrix-heatmap`) | Lê a matriz de correlação de Pearson. |
| 5 | `demonstracao` | Área × preço | `visualization` (`scatter-plot`) | Vê a relação linear quase perfeita (correlação 0,999). |
| 6 | `experimentacao` | Explore as features | `experiment` | Escolhe a feature do eixo x e compara com o preço. |
| 7 | `desafio` | Desafio: qual feature explica o preço? | `challenge` | Escolhe a feature mais correlacionada. |
| 8 | `explicacao` | Treino, validação e loss | `markdown` | Entende split, época, batch, loss e learning rate. |
| 9 | `codigo` | Código: carregando e explorando | `code-view` | Lê a matriz de features e `tf.mean(features, 0)`. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula dataset, features, labels e treino. |

## Guia do experimento

- **Função:** `lab-08-housing` (`src/app/features/labs/lab-08-ml-fundamentals/lab-08-ml-fundamentals.experiments.ts`).
- **Parâmetros:**
  - `feature` (string, padrão `area`; opções `area`, `quartos`, `idade`, `distancia`).
- **O que muda:** o eixo y é sempre o preço; o título mostra a correlação de
  Pearson calculada ao vivo entre a feature escolhida e o preço.
- **O que observar:** a correlação de cada feature com o preço (área é a mais
  forte) e a forma da nuvem de pontos. O dataset tem 6 casas com as features
  `area`, `quartos`, `idade`, `distancia` e o label `preco`.

## Desafio

- **Tipo de validação:** `multiple-choice`.
- **O que é pedido:** qual característica tem a maior correlação (em valor
  absoluto) com o preço.
- **Resposta correta:** `area` — correlação ≈ 0,999. Idade e distância têm
  correlação negativa forte, mas menor em módulo.

## Principais aprendizados

- Um dataset reúne exemplos com features e labels.
- Explorar distribuições e correlações orienta a escolha de features.
- O dataset é dividido em treino e validação/teste.
- Épocas e batches organizam o treino; a loss mede o erro e o learning rate o passo.

## Referências cruzadas

- TF.js: [`tf.tensor2d/1d`, `tf.mean`](../tensorflow-concepts.md#how-tensors-are-created), [`tf.data.csv`](../tensorflow-concepts.md#data-loading).
- Matemática: [datasets, correlação, época e batch](../mathematical-concepts.md#datasets-features-labels-and-splits).
