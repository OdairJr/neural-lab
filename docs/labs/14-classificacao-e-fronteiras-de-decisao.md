# Lab 14 — Classificação e Fronteiras de Decisão

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 14 |
| Slug | `14-classificacao-e-fronteiras-de-decisao` |
| ID | `lab-14-classification` |
| Categoria | Redes Neurais |
| Tempo estimado | 40 minutos |
| Pré-requisitos | [Lab 13 — Redes Neurais](13-redes-neurais.md) |
| Conceitos | `classificacao`, `fronteira-de-decisao`, `xor` |
| Orçamento de memória | 60 MB |

## Conceitos cobertos

A **classificação** atribui uma classe: sigmoid para binária, softmax para
multiclasse. A **fronteira de decisão** é onde o modelo muda de classe prevista.
O **XOR** não é linearmente separável: nenhuma reta o resolve, mas uma camada
oculta com dois neurônios sim. Veja
[TF.js: utilitários de classificação](../tensorflow-concepts.md#classification-utilities)
e [math: classificação, XOR e matriz de confusão](../mathematical-concepts.md#classification-decision-boundaries-and-xor).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Separar o inseparável | `markdown` | Vê o XOR como caso em que uma reta falha. |
| 2 | `conceito` | Conceito: classificação | `concept-card` | Abre o cartão do conceito `classificacao`. |
| 3 | `analogia` | Analogia: a cerca no terreno | `markdown` | Compara cerca reta (linear) com cerca dobrada (camada oculta). |
| 4 | `exemplo-visual` | O XOR e uma fronteira linear | `visualization` (`scatter-plot`) | Vê que `y = x` não separa as classes. |
| 5 | `demonstracao` | Matriz de confusão do modelo linear | `visualization` (`matrix-heatmap`) | Vê a matriz 2×2 com acurácia 50%. |
| 6 | `experimentacao` | Resolva o XOR com uma camada oculta | `experiment` | Ajusta dataset, camadas, neurônios, lr e épocas. |
| 7 | `desafio` | Desafio: a menor rede que resolve o XOR | `challenge` | Escolhe a menor arquitetura não-linear. |
| 8 | `explicacao` | Fronteiras, softmax e one-hot | `markdown` | Lê softmax, one-hot e a matriz de confusão. |
| 9 | `codigo` | Código: XOR e classificação multiclasse | `code-view` | Lê a rede de 2 neurônios ocultos e softmax. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula classificação, fronteira e XOR. |

## Guia do experimento

- **Função:** `lab-14-classification` (`src/app/features/labs/lab-14-classification/lab-14-classification.experiments.ts`, via `createNetworkExperiment`).
- **Parâmetros:**
  - `dataset` (string, padrão `xor`; opções `xor`, `moons`, `blobs` — `blobs` tem 3 classes e usa softmax).
  - `hidden` (number, padrão `1`, faixa 0 a 2): use 0 para ver o modelo linear falhar no XOR.
  - `neurons` (number, padrão `2`, faixa 2 a 8).
  - `lr` (number, padrão `0.5`, faixa 0.05 a 1, passo 0.05).
  - `epochs` (number, padrão `120`, faixa 20 a 200, passo 20).
- **O que muda:** o experimento treina no Web Worker e anima a fronteira de
  decisão; com `hidden = 0` no XOR a loss fica presa perto de 0,69 (acurácia
  ~50%); com 2 neurônios `tanh` a fronteira fica não-linear e resolve o XOR.
- **O que observar:** a forma da fronteira (reta vs. curva), a evolução da loss
  e da acurácia, e a matriz de confusão (linhas = classe real, colunas = prevista).

## Desafio

- **Tipo de validação:** `multiple-choice`.
- **O que é pedido:** a menor arquitetura capaz de resolver o XOR.
- **Resposta correta:** `a` — uma camada oculta com 2 neurônios e ativação tanh.

## Principais aprendizados

- Classificação prevê classes: sigmoid (binária) ou softmax (multiclasse).
- A fronteira de decisão é onde o modelo troca de classe prevista.
- XOR não é linearmente separável; uma camada oculta de 2 neurônios resolve.
- Softmax usa rótulos one-hot; a matriz de confusão resume acertos e erros.

## Referências cruzadas

- TF.js: [`tf.argMax`, `tf.oneHot`](../tensorflow-concepts.md#classification-utilities), [`tf.softmax`](../tensorflow-concepts.md#activation-functions).
- Matemática: [classificação, XOR e matriz de confusão](../mathematical-concepts.md#classification-decision-boundaries-and-xor).
