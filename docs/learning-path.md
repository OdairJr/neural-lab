# Learning Path

NeuralLab's V1 content is a fixed sequence of **16 laboratories**. Each lab
introduces a small set of concepts, walks through a standard pedagogical stage
template and ends with a challenge and a summary that points to the next lab.

This document is derived from the `learning-journey` specification and the
runtime source of truth,
[`src/app/educational-content/lab-configs/lab-catalog.ts`](../src/app/educational-content/lab-configs/lab-catalog.ts).
Each lab also has a dedicated page under [`docs/labs/`](labs/).

## 1. The 16 laboratories

Labs are ordered by `number`. "Prerequisites" are the labs the journey
recommends first; concepts are the glossary terms the lab introduces or
reinforces.

| # | Slug | Title (PT-BR) | Category | Min | Prerequisites | Concepts |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `01-fundamentos-de-tensores` | Fundamentos de Tensores | Tensores | 20 | — | `tensor`, `escalar`, `vetor`, `matriz`, `rank`, `shape`, `size`, `dtype` |
| 2 | `02-manipulacao-de-tensores` | Manipulação de Tensores | Operações | 20 | 1 | `reshape`, `flatten`, `expandDims`, `squeeze` |
| 3 | `03-operacoes-elemento-a-elemento` | Operações Elemento a Elemento | Operações | 20 | 2 | `operacoes-elementares`, `broadcasting` |
| 4 | `04-operacoes-de-reducao` | Operações de Redução | Operações | 20 | 3 | `reducao`, `media`, `soma`, `eixo` |
| 5 | `05-operacoes-matriciais` | Operações Matriciais | Operações | 25 | 4 | `transpose`, `matMul`, `produto-escalar` |
| 6 | `06-broadcasting` | Broadcasting | Operações | 25 | 5 | `broadcasting`, `shape` |
| 7 | `07-algebra-linear-aplicada` | Álgebra Linear Aplicada | Operações | 30 | 6 | `transformacao-linear`, `produto-escalar`, `vetor` |
| 8 | `08-fundamentos-de-machine-learning` | Fundamentos de Machine Learning | Machine Learning | 30 | 7 | `dataset`, `feature`, `label`, `loss`, `epoca`, `batch`, `learning-rate` |
| 9 | `09-regressao-linear` | Regressão Linear | Machine Learning | 30 | 8 | `regressao-linear`, `mse`, `predicao` |
| 10 | `10-descida-do-gradiente` | Descida do Gradiente | Machine Learning | 35 | 9 | `gradiente`, `learning-rate`, `convergencia`, `minimo-local` |
| 11 | `11-o-neuronio` | O Neurônio | Redes Neurais | 30 | 10 | `neuronio`, `peso`, `bias`, `soma-ponderada`, `ativacao` |
| 12 | `12-funcoes-de-ativacao` | Funções de Ativação | Redes Neurais | 30 | 11 | `sigmoid`, `relu`, `tanh`, `softmax`, `derivada` |
| 13 | `13-redes-neurais` | Redes Neurais | Redes Neurais | 40 | 12 | `camada`, `forward-propagation`, `backpropagation`, `treino` |
| 14 | `14-classificacao-e-fronteiras-de-decisao` | Classificação e Fronteiras de Decisão | Redes Neurais | 40 | 13 | `classificacao`, `fronteira-de-decisao`, `xor` |
| 15 | `15-imagens-como-tensores` | Imagens como Tensores | Imagens | 35 | 14 | `imagem`, `rgb`, `grayscale`, `normalizacao` |
| 16 | `16-gerenciamento-de-memoria` | Gerenciamento de Memória | Memória | 30 | 15 | `memoria`, `dispose`, `tidy`, `vazamento` |

Category labels come from `LAB_CATEGORY_LABELS` in `lab-catalog.ts`.

## 2. Prerequisite graph

The prerequisites form a directed acyclic graph — in V1 a simple chain, since
each lab depends on the previous one.

```text
Lab 1 → Lab 2 → Lab 3 → Lab 4 → Lab 5 → Lab 6 → Lab 7
      → Lab 8 → Lab 9 → Lab 10 → Lab 11 → Lab 12 → Lab 13
      → Lab 14 → Lab 15 → Lab 16
```

Prerequisites are a **soft gate**: a user may open any lab, but opening one
without its prerequisite shows a contextual warning that links to the
recommended lab first (`learning-journey` spec).

## 3. Pedagogical stage template

Each lab selectively implements up to ten stages. A stage is a typed
`StageConfig` in the lab config; its `type` determines the renderer and its
`component` selects the registered base component. Missing stages are skipped
without placeholders.

| # | `type` | Label (PT-BR) | Purpose | Base component |
| --- | --- | --- | --- | --- |
| 1 | `contextualizacao` | Contextualização | Why this matters; real-world hook | `markdown` |
| 2 | `conceito` | Conceito | Formal definition with minimal math | `concept-card` |
| 3 | `analogia` | Analogia | Intuitive comparison to a familiar domain | `markdown` |
| 4 | `exemplo-visual` | Exemplo visual | Static/interactive diagram of the concept | `visualization` |
| 5 | `demonstracao` | Demonstração | Guided walkthrough with predefined inputs | `visualization` |
| 6 | `experimentacao` | Experimentação | User adjusts parameters, observes results | `experiment` |
| 7 | `desafio` | Desafio | Task with success criteria and hints | `challenge` |
| 8 | `explicacao` | Explicação | Why the result occurred, tied to the concept | `markdown` |
| 9 | `codigo` | Código | Equivalent TensorFlow.js code with annotations | `code-view` |
| 10 | `resumo` | Resumo | Key takeaways and the next lab | `markdown` |

Stage labels are defined in
[`shared/stages/stage-contract.ts`](../src/app/shared/stages/stage-contract.ts).
Visual stages (`exemplo-visual`, `demonstracao`) must declare a
`visualizationType` and `initialData`; `experimentacao` requires an
`experimentConfig`; `desafio` requires a `validation`; `codigo` requires a
`codeTemplate` or `generationStrategy`. `npm run validate:content` enforces
these rules.

Not every lab uses all ten stages. For example, the manipulation labs omit the
analogy stage. Lab 1 uses all ten.

## 4. Progress tracking

Progress is per lab and per stage, stored locally (see
[`architecture.md`](architecture.md#9-progress-and-analytics-persistence)).

- Completing a stage appends its `type` to `LabProgress.completedStages` and
  emits a `stage-completed` analytics event.
- Lab progress = completed stages / total stages (the shell's progress ring).
- Journey progress aggregates across labs; the Progress dashboard shows overall
  completion, per-lab detail and a 12-dimension concept-mastery radar
  (`features/journey/concept-mastery.ts`).
- Challenges validate on submit; success marks the stage complete, failure
  offers progressive hints and allows unlimited retries in V1.

Stage completion criteria by type are defined in the `requirements`
specification (for example, reading stages complete on scroll plus dwell or an
"Entendi" action; experiments complete after interaction; challenges require a
passing validation).

## 5. Glossary and concept graph

Every concept listed in the table above has a definition in
[`educational-content/concepts/concepts.ts`](../src/app/educational-content/concepts/concepts.ts)
(V1 ships 60 concept ids). A `Concept` carries its short and full definition,
optional mathematical notation and visual analogy, the TensorFlow.js APIs it
relates to, `relatedConcepts`, `introducedInLab` and `reinforcedInLabs`.

The glossary is derived from these definitions: the `/glossario` page lists and
searches terms, and inline links inside lab content open the same entry in a
modal. The `relatedConcepts` references form the concept graph that backs the
"Ver também", prerequisite and "Reforçado em" cross-references. Concept ids are
the single source of truth checked by the build-time validator, so adding a lab
that references a new concept without defining it fails `npm run validate:content`.

## 6. Lab URLs

- Journey entry point: `/#/jornada`
- Lab: `/#/lab/<slug>` (for example `/#/lab/14-classificacao-e-fronteiras-de-decisao`)
- Deep link to a stage: `/#/lab/<slug>?stage=<stage-type>` (for example
  `?stage=experimentacao`)

The slug is the `slug` field in `lab-catalog.ts`; the deep link's stage value is
the stage `type`.
