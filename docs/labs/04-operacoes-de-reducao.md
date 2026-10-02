# Lab 4 — Operações de Redução

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 4 |
| Slug | `04-operacoes-de-reducao` |
| ID | `lab-04-reductions` |
| Categoria | Operações |
| Tempo estimado | 20 minutos |
| Pré-requisitos | [Lab 3 — Operações Elemento a Elemento](03-operacoes-elemento-a-elemento.md) |
| Conceitos | `reducao`, `media`, `soma`, `eixo` |
| Orçamento de memória | 50 MB |

## Conceitos cobertos

Reduções (`sum`, `mean`, `min`, `max`) resumem um tensor ao longo de um eixo. O
**axis** define a direção da agregação: `axis=0` combina as linhas, `axis=1`
(ou `-1`) combina as colunas; sem axis, todos os elementos são reduzidos a um
escalar. Veja [TF.js: reduções](../tensorflow-concepts.md#reductions) e
[math: reduções e eixo](../mathematical-concepts.md#reductions-and-axis).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Resumindo dados | `markdown` | Vê por que resumir 21 temperaturas e por que o eixo confunde. |
| 2 | `conceito` | Conceito: redução | `concept-card` | Abre o cartão do conceito `reducao`. |
| 3 | `analogia` | Analogia: somar colunas ou linhas | `markdown` | Compara `axis=0` ("para baixo") com `axis=1` ("para o lado"). |
| 4 | `exemplo-visual` | A tabela completa | `visualization` (`matrix-heatmap`) | Inspeciona cidade × dia. |
| 5 | `demonstracao` | Média diária (axis 0) | `visualization` (`line-chart`) | Vê a média das cidades dia a dia. |
| 6 | `experimentacao` | Reduza por eixo | `experiment` | Escolhe a redução e o eixo. |
| 7 | `desafio` | Desafio: maior variância | `challenge` | Escolhe a cidade com maior variância. |
| 8 | `explicacao` | Entendendo o axis | `markdown` | Vê os shapes resultantes de cada eixo. |
| 9 | `codigo` | Código: reduções por eixo | `code-view` | Lê `tf.mean(t, 0)` e `tf.max(t, 1)`. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula axis e reduções. |

## Guia do experimento

- **Função:** `lab-04-reductions` (`src/app/features/labs/lab-04-reductions/lab-04-reductions.experiments.ts`).
- **Parâmetros:**
  - `reducao` (string, padrão `mean`; opções `sum`, `mean`, `min`, `max`).
  - `axis` (number, padrão `0`, faixa -1 a 1): `0` combina cidades (resultado por dia); `1` ou `-1` combina dias (resultado por cidade).
- **O que muda:** a matriz de temperaturas `[3, 7]` é reduzida e plotada como um gráfico de linhas com título `reducao · axis N → shape [...]`.
- **O que observar:** `axis=0` produz 7 valores (um por dia); `axis=1`/`-1` produz 3 valores (um por cidade); compare o shape e os rótulos do eixo x.

## Desafio

- **Tipo de validação:** `multiple-choice`.
- **O que é pedido:** qual cidade tem a **maior variância** (maior dispersão em
  torno da própria média).
- **Resposta correta:** `sp` — São Paulo. Rio e Curitiba têm a mesma variação
  dia a dia (deslocadas por uma constante), então a de São Paulo é maior.

## Principais aprendizados

- Reduções transformam muitos valores em menos.
- O `axis` determina a direção da agregação e o shape resultante.
- `axis=0` combina linhas; `axis=1`/`-1` combina colunas.
- Sem `axis`, a redução devolve um escalar.

## Referências cruzadas

- TF.js: [`tf.sum/mean/min/max`](../tensorflow-concepts.md#reductions).
- Matemática: [reduções, média e variância](../mathematical-concepts.md#reductions-and-axis).
