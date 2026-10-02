# Lab 9 — Regressão Linear

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 9 |
| Slug | `09-regressao-linear` |
| ID | `lab-09-linear-regression` |
| Categoria | Machine Learning |
| Tempo estimado | 30 minutos |
| Pré-requisitos | [Lab 8 — Fundamentos de Machine Learning](08-fundamentos-de-machine-learning.md) |
| Conceitos | `regressao-linear`, `mse`, `predicao` |
| Orçamento de memória | 50 MB |

## Conceitos cobertos

A **regressão linear** prevê um valor contínuo com a reta `ŷ = w·x + b`. O
**MSE** é a média dos resíduos ao quadrado e forma uma parábola em `w`. A
**predição** é a saída do modelo para uma entrada. Veja
[TF.js: autodiff e MSE](../tensorflow-concepts.md#autodifferentiation-variables-and-optimizers)
e [math: regressão linear e MSE](../mathematical-concepts.md#linear-regression-and-mse).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Ajustando uma reta | `markdown` | Entende `w` (inclinação) e `b` (intercepto). |
| 2 | `conceito` | Conceito: regressão linear | `concept-card` | Abre o cartão do conceito `regressao-linear`. |
| 3 | `analogia` | Analogia: a régua | `markdown` | Inclina e desloca uma régua sobre os pontos. |
| 4 | `exemplo-visual` | Dados e melhor reta | `visualization` (`scatter-plot`) | Vê a melhor reta `ŷ = 2x + 1` (MSE 0,8). |
| 5 | `demonstracao` | A curva do erro | `visualization` (`line-chart`) | Vê o MSE em função de `w` (parábola). |
| 6 | `experimentacao` | Ajuste a reta | `experiment` | Ajusta `w` e `b` e vê o MSE mudar ao vivo. |
| 7 | `desafio` | Desafio: encontre a melhor reta | `challenge` | Encontra o par `(w, b)` que minimiza o MSE. |
| 8 | `explicacao` | O gradiente do MSE | `markdown` | Lê as derivadas parciais e a atualização. |
| 9 | `codigo` | Código: MSE e gradientes | `code-view` | Lê o cálculo do MSE e de `dw`/`db`. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula reta, resíduos, MSE e gradiente. |

## Guia do experimento

- **Função:** `lab-09-linear-fit` (`src/app/features/labs/lab-09-linear-regression/lab-09-linear-regression.experiments.ts`).
- **Parâmetros:**
  - `w` (number, padrão `0`, faixa -2 a 4, passo 0.25): inclinação.
  - `b` (number, padrão `0`, faixa -4 a 6, passo 0.25): intercepto.
- **O que muda:** o dataset tem 5 pontos `(1,2), (2,6), (3,8), (4,8), (5,11)`.
  O scatter desenha a reta atual; o painel "Por baixo dos panos" publica
  predições, resíduos, o MSE e os gradientes `dw`/`db`.
- **O que observar:** o MSE cai até um mínimo e volta a subir; os resíduos
  `ŷ - y` e os gradientes indicam a direção de melhora.

## Desafio

- **Tipo de validação:** `parameter-match`.
- **O que é pedido:** ajustar `w` e `b` até o MSE ficar abaixo de 1,0.
- **Resposta correta:** `{ w: 2, b: 1 }` — a solução exata de mínimos quadrados,
  `ŷ = 2x + 1`, com MSE = 0,8.

## Principais aprendizados

- A regressão linear prevê `ŷ = w·x + b`.
- O MSE mede o erro médio ao quadrado e é uma parábola em `w`.
- Resíduos são as distâncias verticais `ŷ - y`.
- O gradiente do MSE (∂/∂w e ∂/∂b) indica como ajustar os parâmetros.

## Referências cruzadas

- TF.js: [`tf.square`/`tf.mean`/`tf.sub`](../tensorflow-concepts.md#element-wise-arithmetic-and-broadcasting), [`tf.variableGrads`](../tensorflow-concepts.md#autodifferentiation-variables-and-optimizers).
- Matemática: [regressão linear, MSE, gradientes e o dataset do Lab 9](../mathematical-concepts.md#linear-regression-and-mse).
