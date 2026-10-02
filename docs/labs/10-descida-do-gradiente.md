# Lab 10 — Descida do Gradiente

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 10 |
| Slug | `10-descida-do-gradiente` |
| ID | `lab-10-gradient-descent` |
| Categoria | Machine Learning |
| Tempo estimado | 35 minutos |
| Pré-requisitos | [Lab 9 — Regressão Linear](09-regressao-linear.md) |
| Conceitos | `gradiente`, `learning-rate`, `convergencia`, `minimo-local` |
| Orçamento de memória | 50 MB |

## Conceitos cobertos

O **gradiente** reúne as derivadas parciais da perda e aponta para onde o erro
cresce. A descida do gradiente caminha no sentido oposto, com passo controlado
pelo **learning rate**. A **convergência** é o erro estabilizar; passos grandes
podem causar **divergência**; um **mínimo local** é um vale que não é o menor de
todos (a superfície do MSE é convexa, com um único mínimo global). Veja
[TF.js: otimizadores](../tensorflow-concepts.md#autodifferentiation-variables-and-optimizers)
e [math: gradiente e descida](../mathematical-concepts.md#gradient-and-gradient-descent).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Deixando o gradiente trabalhar | `markdown` | Vê o ciclo calcular gradiente → passo oposto → repetir; treino em Web Worker. |
| 2 | `conceito` | Conceito: gradiente | `concept-card` | Abre o cartão do conceito `gradiente`. |
| 3 | `analogia` | Analogia: a bola na tigela | `markdown` | Relaciona superfície de custo, gradiente e learning rate a bola/tigela/passo. |
| 4 | `exemplo-visual` | A superfície de custo (corte) | `visualization` (`line-chart`) | Vê o MSE em função de `w` (corte com `b = 1`). |
| 5 | `demonstracao` | Trajetórias por learning rate | `visualization` (`scatter-plot`) | Compara trajetórias lento/converge/overshoot/diverge. |
| 6 | `experimentacao` | Treine e veja o erro por época | `experiment` | Escolhe learning rate e épocas e vê o erro por época. |
| 7 | `desafio` | Desafio: escolha o learning rate | `challenge` | Escolhe o lr que converge em menos de 50 épocas sem overshoot. |
| 8 | `explicacao` | Convergência e divergência | `markdown` | Compara os efeitos de lr pequeno e grande. |
| 9 | `codigo` | Código: descida do gradiente | `code-view` | Lê o loop de atualização `w -= lr * dw`. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula o ciclo e o papel do learning rate. |

## Guia do experimento

- **Função:** `lab-10-gradient-descent` (`src/app/features/labs/lab-10-gradient-descent/lab-10-gradient-descent.experiments.ts`).
- **Parâmetros:**
  - `lr` (string, padrão `0.003`; presets `0.0001`, `0.001`, `0.003`, `0.01`, `0.1`, `0.5`).
  - `epochs` (number, padrão `50`, faixa 1 a 200, passo 10).
- **O que muda:** o treino roda no `TrainingWorkerService` (batch gradient
  descent) e transmite uma métrica por época. O gráfico de linhas mostra o MSE
  por época; o painel publica `w`, `b` e a loss final.
- **O que observar:** `lr = 0.003` converge em ~40 épocas sem overshoot;
  `lr = 0.001` converge lentamente (> 100 épocas); `lr = 0.1` diverge. O
  aprendizado é interrompido quando a loss passa de `1e7`.

## Desafio

- **Tipo de validação:** `multiple-choice`.
- **O que é pedido:** qual learning rate converge em menos de 50 épocas sem
  overshoot.
- **Resposta correta:** `b` — `0,003`.

## Principais aprendizados

- A descida do gradiente minimiza o custo repetindo `parâmetro -= lr · gradiente`.
- Learning rate pequeno demora; grande demais diverge.
- Convergência é o erro estabilizar; divergência é o erro crescer sem limite.
- O treino roda em Web Worker, mantendo a interface responsiva.

## Referências cruzadas

- TF.js: [`tf.train.sgd`, otimizadores](../tensorflow-concepts.md#autodifferentiation-variables-and-optimizers).
- Matemática: [gradiente, learning rate e convergência](../mathematical-concepts.md#gradient-and-gradient-descent).
