# Lab 2 — Manipulação de Tensores

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 2 |
| Slug | `02-manipulacao-de-tensores` |
| ID | `lab-02-manipulation` |
| Categoria | Operações |
| Tempo estimado | 20 minutos |
| Pré-requisitos | [Lab 1 — Fundamentos de Tensores](01-fundamentos-de-tensores.md) |
| Conceitos | `reshape`, `flatten`, `expandDims`, `squeeze` |
| Orçamento de memória | 50 MB |

## Conceitos cobertos

`reshape` muda o shape sem alterar os valores (o size é preservado). `flatten`
é o caso especial `reshape(t, [-1])`, que produz rank 1. `expandDims` insere um
eixo de tamanho 1 (aumenta o rank); `squeeze` remove eixos de tamanho 1. A
permutação de eixos (`transpose`) é diferente de reshape: muda a ordem dos
dados. Veja [TF.js: manipulação de shape](../tensorflow-concepts.md#shape-manipulation)
e [math: tensors](../mathematical-concepts.md#tensors-rank-shape-and-index-notation).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Por que reorganizar tensores? | `markdown` | Vê que os dados chegam em formatos diferentes do que o modelo espera. |
| 2 | `conceito` | Conceito: reshape | `concept-card` | Abre o cartão do conceito `reshape`. |
| 3 | `analogia` | Analogia: recipientes | `markdown` | Compara os mesmos 6 litros em copos/bandejas de shapes diferentes. |
| 4 | `exemplo-visual` | Antes: shape [2, 3] | `visualization` (`tensor-grid`) | Inspeciona 6 valores como `[2, 3]`. |
| 5 | `demonstracao` | Dimensões de tamanho 1 | `visualization` (`tensor-grid`) | Vê `[1, 2, 3]` e entende a dimensão "elástica". |
| 6 | `experimentacao` | Reorganize o tensor | `experiment` | Escolhe a operação, o shape alvo e o eixo. |
| 7 | `desafio` | Desafio: (3, 4, 5) → (5, 3, 4) | `challenge` | Informa a permutação de eixos da transposição. |
| 8 | `explicacao` | Como o shape é calculado | `markdown` | Compara reshape, flatten, expandDims, squeeze e transpose. |
| 9 | `codigo` | Código: operações de shape | `code-view` | Lê os exemplos de shape. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula a preservação do size e das dimensões 1. |

## Guia do experimento

- **Função:** `lab-02-reshape` (`src/app/features/labs/lab-02-manipulation/lab-02-manipulation.experiments.ts`).
- **Parâmetros:**
  - `operacao` (string, padrão `reshape`; opções `reshape`, `flatten`, `expandDims`, `squeeze`).
  - `shape` (string, padrão `3, 2`): shape alvo do reshape; o produto precisa ser 6.
  - `axis` (number, padrão `0`, faixa 0–3): posição usada por `expandDims`/`squeeze`.
- **O que muda:** o tensor base é `[2, 3]` (ou `[1, 2, 3]` para `squeeze`) com os valores `[1, 2, 3, 4, 5, 6]`. O título mostra `[base] → [resultado] · rank N`. Se a operação for inválida para o eixo (ex.: squeeze em eixo de tamanho ≠ 1), o experimento recorre a flatten.
- **O que observar:** o size sempre permanece 6; `flatten` sempre retorna rank 1; `expandDims` adiciona um eixo 1; `squeeze` só remove eixos de tamanho 1.

## Desafio

- **Tipo de validação:** `parameter-match`.
- **O que é pedido:** transformar o shape `[3, 4, 5]` em `[5, 3, 4]` com
  `tf.transpose`, informando o índice do eixo original que ocupa cada posição.
- **Resposta correta:** `{ eixo0: 2, eixo1: 0, eixo2: 1 }` — a nova ordem é
  `(2, 0, 1)`, colocando primeiro o eixo de tamanho 5.

## Principais aprendizados

- `reshape` preserva os valores e o size, mudando apenas o shape.
- `flatten` = `reshape(t, [-1])`: sempre rank 1.
- `expandDims` adiciona um eixo 1; `squeeze` remove eixos 1.
- Transpor permuta eixos (muda a ordem dos dados); reshape não.

## Referências cruzadas

- TF.js: [`tf.reshape`/`tf.expandDims`/`tf.squeeze`](../tensorflow-concepts.md#shape-manipulation), [`tf.transpose`](../tensorflow-concepts.md#matrix-operations).
- Matemática: [tensores, rank e shape](../mathematical-concepts.md#tensors-rank-shape-and-index-notation).
