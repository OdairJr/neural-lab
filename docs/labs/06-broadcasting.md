# Lab 6 — Broadcasting

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 6 |
| Slug | `06-broadcasting` |
| ID | `lab-06-broadcasting` |
| Categoria | Operações |
| Tempo estimado | 25 minutos |
| Pré-requisitos | [Lab 5 — Operações Matriciais](05-operacoes-matriciais.md) |
| Conceitos | `broadcasting`, `shape` |
| Orçamento de memória | 50 MB |

## Conceitos cobertos

Broadcasting permite combinar tensores de shapes diferentes alinhando as
dimensões da direita para a esquerda: dimensões iguais ou de tamanho 1 são
compatíveis, e a de tamanho 1 é esticada. Escalares têm shape `[]` e expandem
para qualquer shape. Veja [TF.js: broadcasting](../tensorflow-concepts.md#element-wise-arithmetic-and-broadcasting)
e [math: broadcasting](../mathematical-concepts.md#broadcasting).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Shapes diferentes, mesma operação | `markdown` | Vê que o TF.js inventa dimensões automaticamente — e como isso pode esconder bugs. |
| 2 | `conceito` | Conceito: broadcasting | `concept-card` | Abre o cartão do conceito `broadcasting`. |
| 3 | `analogia` | Analogia: alinhando à direita | `markdown` | Alinha `3 7` com `7` e aplica as regras par a par. |
| 4 | `exemplo-visual` | Temperaturas em Celsius: [3, 7] | `visualization` (`tensor-grid`) | Inspeciona a matriz original. |
| 5 | `demonstracao` | Matriz + vetor alinhado | `visualization` (`tensor-grid`) | Vê `[3, 7] + [3, 1] → [3, 7]`. |
| 6 | `experimentacao` | Celsius → Fahrenheit | `experiment` | Escolhe o modo de broadcast. |
| 7 | `desafio` | Desafio: preveja o shape | `challenge` | Escolhe o único shape de saída correto. |
| 8 | `explicacao` | Alinhando as dimensões | `markdown` | Analisa 5 cenários de broadcast. |
| 9 | `codigo` | Código: broadcast na conversão | `code-view` | Lê `tf.mul(celsius, 1.8)` e `tf.add(matriz, correcao)`. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula as regras de alinhamento. |

## Guia do experimento

- **Função:** `lab-06-broadcasting` (`src/app/features/labs/lab-06-broadcasting/lab-06-broadcasting.experiments.ts`).
- **Parâmetros:**
  - `modo` (string, padrão `vetor-escalar`; opções `vetor-escalar`, `matriz-vetor`).
- **O que muda:** no modo `vetor-escalar`, `[0, 10, 20, 30]` é convertido com `× 1.8 + 32 → [32, 50, 68, 86]` (o escalar expande para `[4]`). No modo `matriz-vetor`, a matriz Celsius `[3, 7]` recebe a correção `[1, 2, 3]` expandida para `[3, 1]` e esticada por todas as colunas.
- **O que observar:** o shape de saída de cada modo e como um escalar (`[]`) ou um vetor coluna (`[3, 1]`) se expandem.

## Desafio

- **Tipo de validação:** `multiple-choice`.
- **O que é pedido:** escolher o único cenário cujo shape de saída está correto.
- **Resposta correta:** `a` — `[3, 1] + [1, 4] → [3, 4]`. As demais têm erro
  (`[2, 3] + [3, 2]` e `[4, 2] + [3, 2]`) ou shape final errado
  (`[5] + [3, 5] → [3, 5]`, `[2, 3] + [2, 1] → [2, 3]`).

## Principais aprendizados

- Broadcasting alinha shapes da direita para a esquerda.
- Dimensões iguais ou 1 são compatíveis; a de 1 é esticada.
- Escalares têm shape `[]` e expandem para qualquer shape.
- Broadcasting substitui loops, mas exige atenção ao shape de saída.

## Referências cruzadas

- TF.js: [broadcasting e `tf.broadcastTo`](../tensorflow-concepts.md#element-wise-arithmetic-and-broadcasting).
- Matemática: [regras de broadcasting](../mathematical-concepts.md#broadcasting).
