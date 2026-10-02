# Laboratórios — Índice

Documentação de referência dos 16 laboratórios da V1 do NeuralLab. Cada página
descreve o laboratório conforme declarado em
`src/app/educational-content/lab-configs/` e implementado em
`src/app/features/labs/`: número e título, pré-requisitos, conceitos, tempo
estimado, as 10 etapas, o guia do experimento, o desafio e os principais
aprendizados.

- [Conceitos de TensorFlow.js](../tensorflow-concepts.md) — referência das APIs
  do TF.js usadas no app.
- [Conceitos matemáticos](../mathematical-concepts.md) — a matemática por trás
  dos laboratórios.

## Percurso

| # | Laboratório | Categoria | Tempo | Pré-requisito |
| --- | --- | --- | --- | --- |
| 1 | [Fundamentos de Tensores](01-fundamentos-de-tensores.md) | Tensores | 20 min | — |
| 2 | [Manipulação de Tensores](02-manipulacao-de-tensores.md) | Operações | 20 min | Lab 1 |
| 3 | [Operações Elemento a Elemento](03-operacoes-elemento-a-elemento.md) | Operações | 20 min | Lab 2 |
| 4 | [Operações de Redução](04-operacoes-de-reducao.md) | Operações | 20 min | Lab 3 |
| 5 | [Operações Matriciais](05-operacoes-matriciais.md) | Operações | 25 min | Lab 4 |
| 6 | [Broadcasting](06-broadcasting.md) | Operações | 25 min | Lab 5 |
| 7 | [Álgebra Linear Aplicada](07-algebra-linear-aplicada.md) | Operações | 30 min | Lab 6 |
| 8 | [Fundamentos de Machine Learning](08-fundamentos-de-machine-learning.md) | Machine Learning | 30 min | Lab 7 |
| 9 | [Regressão Linear](09-regressao-linear.md) | Machine Learning | 30 min | Lab 8 |
| 10 | [Descida do Gradiente](10-descida-do-gradiente.md) | Machine Learning | 35 min | Lab 9 |
| 11 | [O Neurônio](11-o-neuronio.md) | Redes Neurais | 30 min | Lab 10 |
| 12 | [Funções de Ativação](12-funcoes-de-ativacao.md) | Redes Neurais | 30 min | Lab 11 |
| 13 | [Redes Neurais](13-redes-neurais.md) | Redes Neurais | 40 min | Lab 12 |
| 14 | [Classificação e Fronteiras de Decisão](14-classificacao-e-fronteiras-de-decisao.md) | Redes Neurais | 40 min | Lab 13 |
| 15 | [Imagens como Tensores](15-imagens-como-tensores.md) | Imagens | 35 min | Lab 14 |
| 16 | [Gerenciamento de Memória](16-gerenciamento-de-memoria.md) | Memória | 30 min | Lab 15 |

## Estrutura comum

Todos os laboratórios seguem as mesmas 10 etapas, renderizadas pelo
`StageRendererComponent` a partir de `component`:

| Ordem | Tipo (`type`) | Componente típico | Papel |
| --- | --- | --- | --- |
| 1 | `contextualizacao` | `markdown` | Motiva o problema do laboratório. |
| 2 | `conceito` | `concept-card` | Apresenta um conceito do glossário. |
| 3 | `analogia` | `markdown` | Traduz o conceito para o mundo real. |
| 4 | `exemplo-visual` | `visualization` | Mostra os dados estáticos do laboratório. |
| 5 | `demonstracao` | `visualization` | Mostra um resultado pronto antes de experimentar. |
| 6 | `experimentacao` | `experiment` | Formulário de parâmetros com visualização ao vivo. |
| 7 | `desafio` | `challenge` | Tarefa validada por um dos tipos de `ChallengeValidation`. |
| 8 | `explicacao` | `markdown` | Explica o "porquê" por trás do experimento. |
| 9 | `codigo` | `code-view` | Código TF.js em três modos (essential/annotated/full). |
| 10 | `resumo` | `markdown` | Recapitula o aprendizado. |

Os tipos de validação de desafio aceitos pelo schema (`domain/content/schemas.ts`)
são: `parameter-match`, `tensor-value`, `code-output`, `multiple-choice` e
`free-form`.
