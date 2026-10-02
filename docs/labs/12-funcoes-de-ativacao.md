# Lab 12 — Funções de Ativação

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 12 |
| Slug | `12-funcoes-de-ativacao` |
| ID | `lab-12-activations` |
| Categoria | Redes Neurais |
| Tempo estimado | 30 minutos |
| Pré-requisitos | [Lab 11 — O Neurônio](11-o-neuronio.md) |
| Conceitos | `sigmoid`, `relu`, `tanh`, `softmax`, `derivada` |
| Orçamento de memória | 50 MB |

## Conceitos cobertos

A **ativação** introduz não-linearidade. **Sigmoid** mapeia para `(0, 1)`;
**tanh** para `(-1, 1)` e centrada em zero; **ReLU** mantém positivos e é barata;
**softmax** gera uma distribuição de probabilidade. A **derivada** mede a taxa
de variação e explica a saturação (vanishing gradient). Veja
[TF.js: ativações](../tensorflow-concepts.md#activation-functions) e
[math: ativações e derivadas](../mathematical-concepts.md#activation-functions-and-derivatives).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Por que não basta somar? | `markdown` | Vê que composições lineares continuam lineares. |
| 2 | `conceito` | Conceito: ativação | `concept-card` | Abre o cartão do conceito `ativacao`. |
| 3 | `analogia` | Analogia: as portas do sinal | `markdown` | Compara as quatro funções a dimmer, catraca, termômetro e divisão de confiança. |
| 4 | `exemplo-visual` | As quatro funções lado a lado | `visualization` (`activation-curve`) | Vê sigmoid, ReLU, tanh e softmax sobrepostas. |
| 5 | `demonstracao` | Saturação e derivada | `visualization` (`activation-curve`) | Vê a sigmoid com sua derivada. |
| 6 | `experimentacao` | Explore uma ativação | `experiment` | Escolhe a função e liga/desliga a derivada. |
| 7 | `desafio` | Desafio: escolha a ativação certa | `challenge` | Escolhe a combinação típica para classificação binária. |
| 8 | `explicacao` | Derivadas e gradiente que desaparece | `markdown` | Lê as derivadas e o vanishing gradient. |
| 9 | `codigo` | Código: aplicando ativações | `code-view` | Lê `tf.sigmoid/relu/tanh/softmax`. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula os usos e as derivadas. |

## Guia do experimento

- **Função:** `lab-12-activation` (`src/app/features/labs/lab-12-activations/lab-12-activations.experiments.ts`).
- **Parâmetros:**
  - `fn` (string, padrão `sigmoid`; opções `sigmoid`, `relu`, `tanh`, `softmax`).
  - `derivative` (boolean, padrão `true`): exibe `f′(z)` em laranja.
- **O que muda:** a curva é amostrada de -6 a 6 (13 pontos); o painel mostra
  `z`, `f(z)` e `f′(z)` no ponto central e a fórmula da derivada da função.
- **O que observar:** sigmoid e tanh saturam nas extremidades (derivada → 0);
  ReLU tem derivada 0 para `z < 0` e 1 para `z > 0`; softmax soma 1.

## Desafio

- **Tipo de validação:** `multiple-choice`.
- **O que é pedido:** a combinação típica de ativações para um classificador
  binário com camadas ocultas.
- **Resposta correta:** `a` — ReLU nas camadas ocultas e sigmoid na saída.

## Principais aprendizados

- A ativação introduz não-linearidade e permite fronteiras curvas.
- Sigmoid (0,1) e tanh (−1,1) saturam para `|z|` grande.
- ReLU é barata e evita saturação no lado positivo.
- Softmax gera probabilidades que somam 1; derivadas pequenas em cadeia causam vanishing gradient.

## Referências cruzadas

- TF.js: [`tf.sigmoid/relu/tanh/softmax`](../tensorflow-concepts.md#activation-functions).
- Matemática: [fórmulas e derivadas das ativações](../mathematical-concepts.md#activation-functions-and-derivatives).
