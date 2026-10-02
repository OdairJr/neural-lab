# Lab 16 — Gerenciamento de Memória

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 16 |
| Slug | `16-gerenciamento-de-memoria` |
| ID | `lab-16-memory` |
| Categoria | Memória |
| Tempo estimado | 30 minutos |
| Pré-requisitos | [Lab 15 — Imagens como Tensores](15-imagens-como-tensores.md) |
| Conceitos | `memoria`, `dispose`, `tidy`, `vazamento` |
| Orçamento de memória | 50 MB |

## Conceitos cobertos

Todo **tensor** ocupa memória e precisa ser descartado. `tf.memory()` expõe
`numTensors`, `numBytes` e `unreliable`. `tensor.dispose()` libera um tensor;
`tf.tidy()` libera tudo que for criado dentro do bloco e não retornado. Um
**vazamento** é um tensor criado e nunca descartado, que faz a memória crescer.
Veja [TF.js: memória](../tensorflow-concepts.md#memory-management) e
[math: memória](../mathematical-concepts.md#memory).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | A memória que ninguém vê | `markdown` | Vê que cada tensor reserva memória até ser descartado. |
| 2 | `conceito` | Conceito: memória | `concept-card` | Abre o cartão do conceito `memoria`. |
| 3 | `analogia` | Analogia: a louça na pia | `markdown` | Compara dispose a lavar um prato e tidy a lavar tudo. |
| 4 | `exemplo-visual` | Assim é um vazamento | `visualization` (`memory-timeline`) | Vê a memória crescer a cada rodada sem descarte. |
| 5 | `demonstracao` | Assim fica com tf.tidy | `visualization` (`memory-timeline`) | Vê a memória estável com `tf.tidy`. |
| 6 | `experimentacao` | Vaze memória — e depois conserte | `experiment` | Alterna entre vazamento e `tf.tidy` com rodadas/tensores configuráveis. |
| 7 | `desafio` | Desafio: conserte o código que vaza | `challenge` | Reescreve o loop com `tf.tidy` e informa a saída. |
| 8 | `explicacao` | O que conta como vazamento | `markdown` | Lê causas, correções e como ler `tf.memory()`. |
| 9 | `codigo` | Código: vazamento vs tf.tidy | `code-view` | Compara o loop que vaza com o bloco `tf.tidy`. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula dispose, tidy e monitoramento. |

## Guia do experimento

- **Função:** `lab-16-memory` (`src/app/features/labs/lab-16-memory/lab-16-memory.experiments.ts`).
- **Parâmetros:**
  - `strategy` (string, padrão `leak`; opções `leak`, `tidy`).
  - `rounds` (number, padrão `10`, faixa 5 a 20, passo 5).
  - `tensorsPerRound` (number, padrão `50`, faixa 10 a 200, passo 10).
  - `size` (number, padrão `1000`, faixa 100 a 5000, passo 100): elementos por tensor.
- **O que muda:** o experimento transmite uma atualização de `memory-timeline`
  por rodada. Na estratégia `leak`, os tensores são criados e mantidos vivos, e
  `tf.memory()` cresce. Na estratégia `tidy`, os mesmos tensores são criados
  dentro de `tf.tidy` e liberados a cada rodada, mantendo a memória plana. Ao
  final do stream, os tensores do vazamento são descartados; trocar de estratégia
  recupera a memória.
- **O que observar:** a curva de memória/tensores sobe em `leak` e fica plana em
  `tidy`; o painel mostra os números antes/depois de cada rodada.

## Desafio

- **Tipo de validação:** `code-output` (`expectedOutput` `"tensores restantes: 0"`).
- **O que é pedido:** reescrever o loop que vaza dentro de `tf.tidy` (sem
  retornar os tensores) e informar a saída exata impressa.
- **Resposta correta:** `tensores restantes: 0` — todos os tensores criados no
  loop são liberados ao fim do bloco.

## Principais aprendizados

- Todo tensor ocupa memória e precisa ser descartado.
- `tf.memory()` mostra `numTensors`, `numBytes` e `unreliable`.
- `dispose()` libera um tensor; `tf.tidy()` libera um bloco inteiro.
- Criar tensores em loops sem descarte vaza memória; `tf.tidy` mantém tudo estável.

## Referências cruzadas

- TF.js: [`tf.tidy`, `tf.dispose`, `tf.memory`, `tf.disposeVariables`](../tensorflow-concepts.md#memory-management).
- Matemática: [contagem/bytes de tensores e tidy vs. vazamento](../mathematical-concepts.md#memory).
