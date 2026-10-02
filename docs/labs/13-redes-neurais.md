# Lab 13 — Redes Neurais

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 13 |
| Slug | `13-redes-neurais` |
| ID | `lab-13-neural-networks` |
| Categoria | Redes Neurais |
| Tempo estimado | 40 minutos |
| Pré-requisitos | [Lab 12 — Funções de Ativação](12-funcoes-de-ativacao.md) |
| Conceitos | `camada`, `forward-propagation`, `backpropagation`, `treino` |
| Orçamento de memória | 60 MB |

## Conceitos cobertos

Uma **camada** agrupa neurônios que compartilham entradas. A
**forward propagation** calcula a predição camada a camada; o
**backpropagation** aplica a regra da cadeia de trás para frente; o **treino**
repete forward → loss → backprop → atualização. Veja
[TF.js: camadas e modelo](../tensorflow-concepts.md#layers-and-model-api) e
[math: forward e backpropagation](../mathematical-concepts.md#forward-propagation-backpropagation-and-the-chain-rule).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Muito além de um neurônio | `markdown` | Vê camadas de entrada, ocultas e saída e o ciclo de treino. |
| 2 | `conceito` | Conceito: camada | `concept-card` | Abre o cartão do conceito `camada`. |
| 3 | `analogia` | Analogia: a linha de montagem | `markdown` | Compara camadas a estações e backprop a um boletim de erros. |
| 4 | `exemplo-visual` | A rede e seus pesos | `visualization` (`network-graph`) | Vê a rede 2 → 4 (tanh) → 1 (sigmoid) e a magnitude dos pesos. |
| 5 | `demonstracao` | Perda e acurácia por época | `visualization` (`line-chart`) | Vê a convergência típica no dataset moons. |
| 6 | `experimentacao` | Construa e treine a rede | `experiment` | Escolhe dataset, camadas, neurônios, ativação, lr e épocas. |
| 7 | `desafio` | Desafio: configure a rede | `challenge` | Escolhe a configuração que supera 90% em moons com < 3 camadas ocultas. |
| 8 | `explicacao` | Por baixo dos panos: um passo de backprop | `markdown` | Lê as equações do ciclo de treino. |
| 9 | `codigo` | Código: criar e treinar uma rede | `code-view` | Lê `tf.sequential`, `tf.layers.dense` e `model.fit`. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula camadas, forward, loss, backprop e treino. |

## Guia do experimento

- **Função:** `lab-13-network` (`src/app/features/labs/lab-13-neural-networks/lab-13-neural-networks.experiments.ts`, via `createNetworkExperiment`).
- **Parâmetros:**
  - `dataset` (string, padrão `moons`; opções `moons`, `spiral`).
  - `hidden` (number, padrão `1`, faixa 0 a 3): camadas ocultas.
  - `neurons` (number, padrão `8`, faixa 2 a 16).
  - `activation` (string, padrão `tanh`; opções `tanh`, `relu`).
  - `lr` (number, padrão `0.5`, faixa 0.01 a 2, passo 0.05).
  - `epochs` (number, padrão `120`, faixa 20 a 300, passo 20).
- **O que muda:** o treino roda no Web Worker (`runNetwork`) com
  full-batch gradient descent e entropia cruzada, transmitindo uma métrica por
  época. Cada época atualiza o scatter com a **fronteira de decisão**; o painel
  publica as matrizes de pesos, a loss e a acurácia.
- **O que observar:** sem camada oculta a fronteira é uma reta; com uma camada
  oculta a fronteira curva; a loss cai e a acurácia sobe.

## Desafio

- **Tipo de validação:** `multiple-choice`.
- **O que é pedido:** qual configuração supera 90% de acurácia em moons usando
  menos de 3 camadas ocultas.
- **Resposta correta:** `a` — uma camada oculta com 8 neurônios e ativação tanh.

## Principais aprendizados

- Camadas densas empilham neurônios em entrada, ocultas e saída.
- O forward produz a predição; a loss mede o erro.
- O backpropagation calcula gradientes com a regra da cadeia.
- O treino repete o ciclo e atualiza os pesos, animando a fronteira.

## Referências cruzadas

- TF.js: [`tf.sequential`, `tf.layers.dense`, `model.compile/fit`](../tensorflow-concepts.md#layers-and-model-api).
- Matemática: [forward, backpropagation e regra da cadeia](../mathematical-concepts.md#forward-propagation-backpropagation-and-the-chain-rule).
