# Lab 1 — Fundamentos de Tensores

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 1 |
| Slug | `01-fundamentos-de-tensores` |
| ID | `lab-01-tensors` |
| Categoria | Tensores |
| Tempo estimado | 20 minutos |
| Pré-requisitos | Nenhum |
| Conceitos | `tensor`, `escalar`, `vetor`, `matriz`, `rank`, `shape`, `size`, `dtype` |
| Orçamento de memória | 50 MB |

## Conceitos cobertos

Um **tensor** é um array multidimensional de números com `shape` e `dtype`
fixos. **Escalar** (rank 0), **vetor** (rank 1) e **matriz** (rank 2) são casos
particulares. **Rank** é o número de dimensões, **shape** o tamanho de cada eixo
e **size** o produto das dimensões. **dtype** define o tipo de cada elemento
(`float32` para decimais, `int32` para inteiros). Veja
[math: tensors](../mathematical-concepts.md#tensors-rank-shape-and-index-notation)
e [TF.js: criação de tensores](../tensorflow-concepts.md#how-tensors-are-created).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Por que tensores? | `markdown` | Lê por que ML organiza números e por que shapes incompatíveis são a maior fonte de erros. |
| 2 | `conceito` | O que é um tensor | `concept-card` | Abre o cartão do conceito `tensor`. |
| 3 | `analogia` | Analogia: a planilha | `markdown` | Relaciona célula/linha/planilha/pilha a escalar/vetor/matriz/rank 3. |
| 4 | `exemplo-visual` | Temperaturas como tensor | `visualization` (`tensor-grid`) | Inspeciona a grade de 3 cidades × 7 dias. |
| 5 | `demonstracao` | Do array ao shape | `visualization` (`tensor-grid`) | Vê 8 valores reorganizados como `[2, 4]`. |
| 6 | `experimentacao` | Crie o seu tensor | `experiment` | Informa valores, shape e dtype e vê a grade resultante. |
| 7 | `desafio` | Desafio: qual é o shape? | `challenge` | Escolhe o shape correto de `[[1,2,3],[4,5,6]]`. |
| 8 | `explicacao` | Por que isso importa | `markdown` | Aprende a ler o shape "de fora para dentro". |
| 9 | `codigo` | Código: criando tensores | `code-view` | Lê o `tf.tensor(...)` em essential/annotated/full. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula tensor, rank, shape e size. |

## Guia do experimento

- **Função:** `lab-01-create-tensor` (`src/app/features/labs/lab-01-tensors/lab-01-tensors.experiments.ts`).
- **Parâmetros:**
  - `values` (string, padrão `22, 23, 25, 24, 26, 27`): números separados por vírgula.
  - `shape` (string, padrão `2, 3`): dimensões separadas por vírgula; o produto deve ser igual ao número de valores.
  - `dtype` (string, padrão `float32`; opções `float32` e `int32`).
- **O que muda:** a grade exibe o tensor com título `shape [...] · rank ... · dtype ...`; se o produto do shape não bater com a quantidade de valores, o experimento recorre a um tensor de rank 1 `[n]`.
- **O que observar:** o shape, o rank (`shape.length`), o size (número total de valores) e o dtype selecionado; compare com o código gerado.

## Desafio

- **Tipo de validação:** `multiple-choice`.
- **O que é pedido:** o shape de `[[1, 2, 3], [4, 5, 6]]`.
- **Resposta correta:** `b` — `[2, 3]`. As alternativas `[6]`, `[3, 2]` e
  `[2, 3, 1]` confundem flatten, ordem invertida e rank extra.

## Principais aprendizados

- Um tensor é um array multidimensional com shape e dtype.
- Rank é o número de dimensões; size é o total de elementos (`∏ dᵢ`).
- Escalar, vetor e matriz são tensores de rank 0, 1 e 2.
- O shape é lido de fora para dentro e deve corresponder à organização dos dados.

## Referências cruzadas

- TF.js: [`tf.tensor`/`tf.tensor1d/2d/3d`/`tf.scalar`](../tensorflow-concepts.md#how-tensors-are-created), [dtypes e shapes](../tensorflow-concepts.md#dtypes-and-shapes).
- Matemática: [tensores, rank, shape e indexação](../mathematical-concepts.md#tensors-rank-shape-and-index-notation).
