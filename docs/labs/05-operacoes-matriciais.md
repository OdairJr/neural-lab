# Lab 5 — Operações Matriciais

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 5 |
| Slug | `05-operacoes-matriciais` |
| ID | `lab-05-matrix` |
| Categoria | Operações |
| Tempo estimado | 25 minutos |
| Pré-requisitos | [Lab 4 — Operações de Redução](04-operacoes-de-reducao.md) |
| Conceitos | `transpose`, `matMul`, `produto-escalar` |
| Orçamento de memória | 50 MB |

## Conceitos cobertos

`matMul` multiplica matrizes com a regra `[m, n] × [n, p] = [m, p]`; cada
elemento do resultado é o **produto escalar** de uma linha de A com uma coluna
de B. `transpose` troca linhas por colunas e ajuda a alinhar shapes. Veja
[TF.js: operações matriciais](../tensorflow-concepts.md#matrix-operations) e
[math: produto matricial](../mathematical-concepts.md#dot-product-and-matrix-product).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Combinando tabelas inteiras | `markdown` | Vê quando a multiplicação é entre matrizes e a regra de shape. |
| 2 | `conceito` | Conceito: matMul | `concept-card` | Abre o cartão do conceito `matMul`. |
| 3 | `analogia` | Analogia: linha × coluna | `markdown` | Combina quantidades por região com preços por região. |
| 4 | `exemplo-visual` | Quantidades: [3, 5] | `visualization` (`matrix-heatmap`) | Inspeciona produtos × regiões. |
| 5 | `demonstracao` | Preços: [5, 1] | `visualization` (`matrix-heatmap`) | Vê o vetor de preços como coluna. |
| 6 | `experimentacao` | matMul e transpose | `experiment` | Escolhe a operação e força um erro de shape. |
| 7 | `desafio` | Desafio: receita por produto | `challenge` | Calcula a receita dos 3 produtos. |
| 8 | `explicacao` | A regra de shape | `markdown` | Entende `[3, 5] × [5, 1] = [3, 1]` e o erro `[3, 5] × [4, 1]`. |
| 9 | `codigo` | Código: matMul | `code-view` | Lê `tf.matMul` e `tf.transpose`. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula a regra de shape e o produto escalar. |

## Guia do experimento

- **Função:** `lab-05-matrix` (`src/app/features/labs/lab-05-matrix/lab-05-matrix.experiments.ts`).
- **Parâmetros:**
  - `operacao` (string, padrão `matMul`; opções `matMul`, `transpose`).
  - `forcarErro` (boolean, padrão `false`): usa preços `[4, 1]` em vez de `[5, 1]`.
- **O que muda:** as quantidades são a matriz `[3, 5]` `[[10,12,14,16,18],[20,18,16,14,12],[5,7,9,11,13]]`; com `transpose`, o resultado é `[5, 3]`. Com `forcarErro`, o experimento captura a exceção de `tf.matMul` e mostra a nota explicando por que 5 ≠ 4, em vez de quebrar.
- **O que observar:** a dimensão compartilhada some no resultado (`[3, 5] × [5, 1] → [3, 1]`); o heatmap mostra o resultado como matriz.

## Desafio

- **Tipo de validação:** `tensor-value` (`expectedShape` `[3, 1]`, `tolerance` `0.01`).
- **O que é pedido:** `matMul(quantidades [3, 5], precos [5, 1])` com preços
  `[2, 3, 2.5, 4, 1.5]`.
- **Resposta correta:** shape `[3, 1]`, valores `[182, 208, 117]`
  (Produto A: 182; Produto B: 208; Produto C: 117).

## Principais aprendizados

- `matMul` aplica `[m, n] × [n, p] = [m, p]`.
- Cada elemento do resultado é um produto escalar linha × coluna.
- A dimensão compartilhada deve coincidir, senão ocorre erro de shape.
- `transpose` troca linhas por colunas e alinha shapes.

## Referências cruzadas

- TF.js: [`tf.matMul`, `tf.transpose`, `tf.dot`](../tensorflow-concepts.md#matrix-operations).
- Matemática: [produto escalar, produto matricial e transpose](../mathematical-concepts.md#dot-product-and-matrix-product).
