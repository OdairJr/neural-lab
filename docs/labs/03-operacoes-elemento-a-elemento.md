# Lab 3 — Operações Elemento a Elemento

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 3 |
| Slug | `03-operacoes-elemento-a-elemento` |
| ID | `lab-03-elementwise` |
| Categoria | Operações |
| Tempo estimado | 20 minutos |
| Pré-requisitos | [Lab 2 — Manipulação de Tensores](02-manipulacao-de-tensores.md) |
| Conceitos | `operacoes-elementares`, `broadcasting` |
| Orçamento de memória | 50 MB |

## Conceitos cobertos

Operações elementares (`add`, `sub`, `mul`, `div`, `pow`, `sqrt`) combinam
tensores posição a posição. Quando os shapes diferem, o **broadcasting** alinha
as dimensões da direita para a esquerda e estica as de tamanho 1. Veja
[TF.js: operações e broadcasting](../tensorflow-concepts.md#element-wise-arithmetic-and-broadcasting)
e [math: broadcasting](../mathematical-concepts.md#broadcasting).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Operações que combinam valores | `markdown` | Vê onde add/sub/mul/div aparecem no ML (atualizar pesos, resíduos, normalizar). |
| 2 | `conceito` | Conceito: operações elementares | `concept-card` | Abre o cartão do conceito `operacoes-elementares`. |
| 3 | `analogia` | Analogia: a lista de compras | `markdown` | Multiplica quantidades por preços item a item. |
| 4 | `exemplo-visual` | Antes: quantidades | `visualization` (`tensor-grid`) | Inspeciona a matriz de quantidades `[3, 4]`. |
| 5 | `demonstracao` | Depois: custo por ingrediente | `visualization` (`tensor-grid`) | Vê o resultado de quantidades × preços. |
| 6 | `experimentacao` | Experimente as operações | `experiment` | Escolhe a operação e edita os preços. |
| 7 | `desafio` | Desafio: custo total por receita | `challenge` | Calcula o custo total de cada uma das 3 receitas. |
| 8 | `explicacao` | Broadcasting em ação | `markdown` | Entende por que `[3, 4] × [4] → [3, 4]`. |
| 9 | `codigo` | Código: operações e broadcast | `code-view` | Lê o `tf.mul` + `tf.sum`. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula operações elementares e broadcasting. |

## Guia do experimento

- **Função:** `lab-03-elementwise` (`src/app/features/labs/lab-03-elementwise/lab-03-elementwise.experiments.ts`).
- **Parâmetros:**
  - `operacao` (string, padrão `mul`; opções `add`, `sub`, `mul`, `div`, `pow`, `sqrt`).
  - `precos` (string, padrão `2, 0.5, 3, 4`): quatro preços aplicados por broadcast.
- **O que muda:** as quantidades são a matriz `[3, 4]` `[2,3,1,1, 4,0,2,0.5, 1,1,0.5,2]`. Operações binárias combinam-na com o vetor de preços `[4]` (resultado `[3, 4]`); `sqrt` é aplicado elemento a elemento às quantidades. Preços inválidos (quantidade ≠ 4) caem para o padrão.
- **O que observar:** o shape do resultado continua `[3, 4]` (broadcast); compare `mul` com `add`/`sub` e veja como `pow` usa os preços como expoente.

## Desafio

- **Tipo de validação:** `tensor-value` (`expectedShape` `[3]`, `tolerance` `0.01`).
- **O que é pedido:** com preços `[2, 0.5, 3, 4]` e as quantidades da matriz,
  calcular o custo total de cada receita.
- **Resposta correta:** shape `[3]`, valores `[12.5, 16, 12]`. O cálculo é
  `tf.sum(tf.mul(quantidades, precos), 1)`.

## Principais aprendizados

- Operações elementares aplicam a conta posição a posição.
- Broadcasting alinha shapes da direita para a esquerda; dimensões 1 são esticadas.
- `[3, 4] × [4] → [3, 4]`: o vetor é repetido por todas as linhas.
- Combinar `mul` com uma redução (`sum`) produz totais por linha.

## Referências cruzadas

- TF.js: [`tf.add/sub/mul/div/pow/sqrt`](../tensorflow-concepts.md#element-wise-arithmetic-and-broadcasting).
- Matemática: [operações elementares e broadcasting](../mathematical-concepts.md#element-wise-operations).
