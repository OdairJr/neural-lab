# Lab 7 — Álgebra Linear Aplicada

> [Índice](README.md) · [TF.js](../tensorflow-concepts.md) · [Matemática](../mathematical-concepts.md)

| | |
| --- | --- |
| Número | 7 |
| Slug | `07-algebra-linear-aplicada` |
| ID | `lab-07-linear-algebra` |
| Categoria | Operações |
| Tempo estimado | 30 minutos |
| Pré-requisitos | [Lab 6 — Broadcasting](06-broadcasting.md) |
| Conceitos | `transformacao-linear`, `produto-escalar`, `vetor` |
| Orçamento de memória | 50 MB |

## Conceitos cobertos

Uma **transformação linear** aplica uma matriz a vetores, produzindo rotação,
escala, cisalhamento ou reflexão. O **produto escalar** mede o alinhamento entre
vetores; zero significa perpendicularidade. Veja
[TF.js: matrizes](../tensorflow-concepts.md#matrix-operations) e
[math: transformações lineares](../mathematical-concepts.md#linear-transformations-and-rotation-matrices).

## Etapas

| # | Tipo | Título | Componente | O que o aprendiz faz |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Geometria dos dados | `markdown` | Vê a matriz como transformação do espaço — a essência de uma camada densa. |
| 2 | `conceito` | Conceito: transformação linear | `concept-card` | Abre o cartão do conceito `transformacao-linear`. |
| 3 | `analogia` | Analogia: a lente | `markdown` | Compara escala e rotação a uma lente deformante. |
| 4 | `exemplo-visual` | Conjunto A original | `visualization` (`scatter-plot`) | Vê os 5 pontos antes da transformação. |
| 5 | `demonstracao` | A matriz identidade | `visualization` (`matrix-heatmap`) | Entende que a identidade não transforma. |
| 6 | `experimentacao` | Rotação e escala ao vivo | `experiment` | Ajusta ângulo e escala. |
| 7 | `desafio` | Desafio: encontre a matriz | `challenge` | Encontra os parâmetros que mapeiam A em B. |
| 8 | `explicacao` | Do produto escalar à matriz | `markdown` | Lê a convenção de vetor-linha e a matriz de rotação. |
| 9 | `codigo` | Código: transformação e dot | `code-view` | Lê `tf.matMul(pontos, M)` e `tf.dot`. |
| 10 | `resumo` | Resumo | `markdown` | Recapitula transformação, produto escalar e perpendicularidade. |

## Guia do experimento

- **Função:** `lab-07-linear-transform` (`src/app/features/labs/lab-07-linear-algebra/lab-07-linear-algebra.experiments.ts`).
- **Parâmetros:**
  - `angulo` (number, padrão `0`, faixa -180 a 180, passo 15): ângulo de rotação em graus.
  - `escala` (number, padrão `1`, faixa 0.25 a 3, passo 0.25): escala uniforme.
- **O que muda:** os 5 pontos `(1,0), (0,1), (-1,0), (0,-1), (1,1)` são armazenados como linhas `[5, 2]`; a matriz de rotação+escala `[2, 2]` é aplicada com `tf.matMul`. O scatter mostra o conjunto A (original) e o conjunto B (transformado); o título inclui o determinante `det = escala²`.
- **O que observar:** rotação preserva tamanhos (det = 1 com escala 1); escala altera o determinante; o produto escalar de vetores perpendiculares é 0.

## Desafio

- **Tipo de validação:** `parameter-match`.
- **O que é pedido:** o conjunto A girou 90° no sentido anti-horário, sem mudar
  de tamanho; informar ângulo e escala.
- **Resposta correta:** `{ angulo: 90, escala: 1 }` — a rotação leva `(1, 0)` em
  `(0, 1)` mantendo o determinante em 1.

## Principais aprendizados

- Uma matriz 2×2 transforma pontos: rotação, escala, reflexão, cisalhamento.
- `matMul(pontos, M)` produz cada coordenada como produto escalar.
- O produto escalar mede alinhamento; 0 significa perpendicular.
- O determinante é o fator de escala de área.

## Referências cruzadas

- TF.js: [`tf.matMul`, `tf.dot`](../tensorflow-concepts.md#matrix-operations).
- Matemática: [transformações lineares e matrizes de rotação](../mathematical-concepts.md#linear-transformations-and-rotation-matrices).
