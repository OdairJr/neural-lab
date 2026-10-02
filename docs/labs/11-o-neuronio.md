# Lab 11 — O Neurônio

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 11 |
| Slug | `11-o-neuronio` |
| ID | `lab-11-neuron` |
| Categoria | Redes Neurais |
| Tempo estimado | 30 minutos |
| Pré-requisitos | [Lab 10 — Descida do Gradiente](10-descida-do-gradiente.md) |
| Conceitos | `neuronio`, `peso`, `bias`, `soma-ponderada`, `ativacao` |
| Orçamento de memória | 50 MB |

## Conceitos cobertos

Um **neurônio** calcula `a = f(Σ wᵢxᵢ + b)`: a **soma ponderada** `z` combina
as entradas pelos **pesos** e pelo **bias**, e a **ativação** `f` introduz a
não-linearidade. Com duas entradas, a fronteira de decisão é a reta `z = 0`.
Veja [TF.js: ativações](../tensorflow-concepts.md#activation-functions) e
[math: o neurônio](../mathematical-concepts.md#the-artificial-neuron).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Do gradiente ao neurônio | `markdown` | Vê o neurônio como unidade que combina pesos, bias e ativação. |
| 2 | `conceito` | Conceito: neurônio | `concept-card` | Abre o cartão do conceito `neuronio`. |
| 3 | `analogia` | Analogia: a votação ponderada | `markdown` | Compara pesos/bias/ativação a votos e limiar. |
| 4 | `exemplo-visual` | O neurônio por dentro | `visualization` (`network-graph`) | Vê 2 entradas → 1 neurônio sigmoid. |
| 5 | `demonstracao` | A curva da ativação sigmoid | `visualization` (`activation-curve`) | Vê a sigmoid e sua derivada. |
| 6 | `experimentacao` | Ajuste os pesos do neurônio | `experiment` | Ajusta `w1`, `w2` e `b` e vê a reta de decisão girar. |
| 7 | `desafio` | Desafio: separe os dois grupos | `challenge` | Encontra pesos e bias que separam os grupos. |
| 8 | `explicacao` | Por baixo dos panos: soma + ativação | `markdown` | Lê o passo a passo `z` → `a` → classe. |
| 9 | `codigo` | Código: um neurônio com TF.js | `code-view` | Lê `tf.add(tf.matMul(xs, w), b)` e `tf.sigmoid`. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula soma ponderada, bias e fronteira. |

## Guia do experimento

- **Função:** `lab-11-neuron` (`src/app/features/labs/lab-11-neuron/lab-11-neuron.experiments.ts`).
- **Parâmetros:**
  - `w1` (number, padrão `0.5`, faixa -3 a 3, passo 0.25).
  - `w2` (number, padrão `0.5`, faixa -3 a 3, passo 0.25).
  - `b` (number, padrão `0`, faixa -5 a 2, passo 0.25).
- **O que muda:** o experimento avalia um neurônio sigmoid sobre 10 pontos
  (2 grupos linearmente separáveis), desenha a reta `z = 0`, sombreia os
  semiplanos e calcula a acurácia. O painel publica a soma ponderada e a
  ativação de cada ponto.
- **O que observar:** a reta de decisão fica onde `z = 0`; a sigmoid transforma
  `z` em probabilidade; a acurácia sobe quando a reta separa os grupos.

## Desafio

- **Tipo de validação:** `parameter-match`.
- **O que é pedido:** pesos e bias que coloquem a reta sobre `x₁ + x₂ = 1`.
- **Resposta correta:** `{ w1: 1, w2: 1, b: -1 }` — a fronteira é
  `w1·x1 + w2·x2 + b = 0`.

## Principais aprendizados

- Um neurônio calcula `a = f(Σ wᵢxᵢ + b)`.
- Pesos controlam a influência de cada entrada; o bias desloca a fronteira.
- A ativação (sigmoid) transforma `z` em probabilidade.
- Com duas entradas, a fronteira de decisão é uma reta.

## Referências cruzadas

- TF.js: [`tf.sigmoid`](../tensorflow-concepts.md#activation-functions), [`tf.layers.dense`](../tensorflow-concepts.md#layers-and-model-api).
- Matemática: [o neurônio artificial](../mathematical-concepts.md#the-artificial-neuron).
