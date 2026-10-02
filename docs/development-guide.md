# Development Guide

How to extend NeuralLab. The main task is adding or editing a laboratory. The
guide follows the same shape as the existing labs; [Lab 14](../src/app/features/labs/lab-14-classification)
and [Lab 1](../src/app/features/labs/lab-01-tensors) are used as checked
examples. Read [`architecture.md`](architecture.md) first.

## Prerequisites

- Node.js `26` (pinned in [`.nvmrc`](../.nvmrc)) and `npm`.
- `npm install` once.
- Familiarity with the layer boundaries and path aliases (below).

## Tooling rules

1. **Layers** — respect `core → domain → shared → features`. `educational-content`
   is pure data and may only import domain types. Violations fail `npm run lint`.
2. **Path aliases** — import across layers with `@core/*`, `@domain/*`,
   `@shared/*`, `@features/*`, `@content/*`; import within a feature with
   relative paths.
3. **Standalone + signals** — components are standalone and use the project's
   zoneless change-detection strategy. State is signal-based.
4. **Content language** — user-facing lab copy (stage titles, markdown, hints)
   is **PT-BR**. Code, comments and developer docs are English.
5. **No new dependencies** without a specification justification.

## Adding a laboratory

The steps below use a hypothetical Lab 17; substitute the real number, id and
slug. Update `number` max in `laboratoryConfigSchema` (currently `1..16`) only
when the spec changes the lab count.

### Step 1 — Add the content config

Create `src/app/educational-content/lab-configs/lab-17-example.ts` exporting a
`LaboratoryConfig`. The file name must match `lab-NN-*.ts`; the build-time
validator collects files by that pattern. Keep runtime imports out: only
`import type { LaboratoryConfig } from '@domain/content'`.

```ts
import type { LaboratoryConfig } from '@domain/content';

export const lab17ExampleConfig: LaboratoryConfig = {
  id: 'lab-17-example',
  number: 17,
  slug: '17-exemplo',
  title: 'Exemplo',
  description: 'Descrição curta em PT-BR.',
  estimatedMinutes: 25,
  prerequisites: ['lab-16-memory'],
  concepts: ['exemplo'],
  category: 'operations', // tensor | operations | ml | neural-networks | images | memory
  memoryBudgetMB: 50,
  tags: ['example'],
  stages: [
    // see Step 5 for the stage shapes
  ],
};
```

The validator checks cross-field rules from
[`domain/content/schemas.ts`](../src/app/domain/content/schemas.ts): visual
stages need `config.visualizationType` + `config.initialData`; `experimentacao`
needs `experimentConfig`; `desafio` needs `validation`; `codigo` needs
`codeTemplate` or `generationStrategy`.

### Step 2 — Register it in the catalog and index

The validator cross-checks every config against `LAB_CATALOG`, so add a matching
`LabSummary` to
[`lab-configs/lab-catalog.ts`](../src/app/educational-content/lab-configs/lab-catalog.ts)
with the **same** `number`, `slug`, `title`, `description` and `category`. The
catalog drives the Journey and Catalog pages (no feature code needed).

Then add the config to `LAB_CONFIGS` in
[`lab-configs/index.ts`](../src/app/educational-content/lab-configs/index.ts).
This list backs `findLabConfigBySlug`, the fallback used by the generic
`/lab/:slug` route.

### Step 3 — Create the lazy feature folder

Create `src/app/features/labs/lab-17-example/` with:

```text
lab-17-example/
├── index.ts                        # re-exports config + routes
├── lab-17-example.config.ts        # LAB_17_EXAMPLE_CONFIG = lab17ExampleConfig
├── lab-17-example.experiments.ts   # ExperimentFn implementations
└── lab-17-example.routes.ts        # LAB_17_EXAMPLE_ROUTES = [labRoute(...)]
```

**Config** re-exports the content config so the feature owns the `LAB_CONFIG`
value:

```ts
import { lab17ExampleConfig } from '@content/lab-configs/lab-17-example';

export const LAB_17_EXAMPLE_CONFIG = lab17ExampleConfig;
```

**Routes** use `labRoute(config, experiments)`:

```ts
import type { Routes } from '@angular/router';
import { labRoute } from '../lab-route';
import { LAB_17_EXAMPLE_CONFIG } from './lab-17-example.config';
import { LAB_17_EXAMPLE_EXPERIMENTS } from './lab-17-example.experiments';

export const LAB_17_EXAMPLE_ROUTES: Routes = [
  labRoute(LAB_17_EXAMPLE_CONFIG, LAB_17_EXAMPLE_EXPERIMENTS),
];
```

`labRoute` provides a per-visit `LabRuntimeService`, the `LAB_CONFIG` token and
the experiment registrations, then loads `LabShellComponent`.

If an experiment needs an injected service, pass a factory instead of a static
record; the factory runs in the route's injection context. Lab 14 does this to
inject `TrainingWorkerService`:

```ts
import { inject } from '@angular/core';
import { TrainingWorkerService } from '@core/training';
// ...
export const LAB_14_CLASSIFICATION_ROUTES: Routes = [
  labRoute(LAB_14_CLASSIFICATION_CONFIG, () => ({
    [LAB_14_CLASSIFICATION]: createLab14ClassificationExperiment(inject(TrainingWorkerService)),
  })),
];
```

### Step 4 — Register the route

Add the lab route to
[`features/labs/labs.routes.ts`](../src/app/features/labs/labs.routes.ts)
**before** the `:slug` fallback. The fallback must stay last:

```ts
{
  path: '17-exemplo',
  loadChildren: () =>
    import('./lab-17-example/lab-17-example.routes').then((m) => m.LAB_17_EXAMPLE_ROUTES),
},
// ...existing labs...
{
  path: ':slug',
  providers: [LabRuntimeService],
  loadComponent: () => import('../lab-shell/lab-shell.component').then((m) => m.LabShellComponent),
},
```

The path segment is the catalog `slug`. If you forget this route the lab still
renders through the `:slug` fallback (the shell resolves the config by slug), but
it is neither lazy-feature-wrapped nor registered as its own chunk.

### Step 5 — Define stages

Pick the stage types the lab needs (the ten are listed in
[`learning-path.md`](learning-path.md)). `stage.component` selects a registered
base component key: `markdown`, `concept-card`, `visualization`, `experiment`,
`challenge`, `code-view`.

A `conceito` stage references a concept id:

```ts
{ type: 'conceito', title: 'O que é…', component: 'concept-card', config: { conceptId: 'exemplo' } }
```

A `visualization` stage declares `visualizationType` and `initialData`:

```ts
{
  type: 'exemplo-visual',
  title: 'Exemplo visual',
  component: 'visualization',
  config: {
    visualizationType: 'tensor-grid',
    initialData: { type: 'tensor-grid', tensor: { shape: [2, 2], dtype: 'float32', values: [1, 2, 3, 4], truncated: false } },
  },
}
```

An `experimentacao` stage references an `experimentFnId` and its parameters:

```ts
{
  type: 'experimentacao',
  title: 'Experimente',
  component: 'experiment',
  experimentConfig: {
    experimentFnId: 'lab-17-example',
    parameters: [{ name: 'values', type: 'string', label: 'Valores', defaultValue: '1, 2, 3' }],
    visualization: {
      type: 'tensor-grid',
      accessibility: { ariaLabel: 'Grade de tensor', dataTableAlternative: true, colorBlindSafe: true },
    },
  },
}
```

A `desafio` stage carries a `validation` (see Step 7). A `codigo` stage carries
`codeTemplate` or `generationStrategy`.

### Step 6 — Implement the experiment contract

Experiments live in `lab-17-example.experiments.ts`. The contract is in
[`shared/experiments/experiment-registry.ts`](../src/app/shared/experiments/experiment-registry.ts):

- `SyncExperimentFn` returns an `ExperimentResult` synchronously — use it for
  deterministic, parameter-driven experiments.
- `ExperimentFn` may instead return `Observable<ExperimentResult>` for streaming
  experiments (worker training). See `features/labs/network-training.ts`.

```ts
import type { ExperimentFn, SyncExperimentFn } from '@shared/experiments';

export const LAB_17_EXAMPLE = 'lab-17-example';

export const exampleExperiment: SyncExperimentFn = (params, runtime) => {
  const values = String(params['values'] ?? '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));

  const tensor = runtime.createTensor(values, [values.length], 'float32', 'lab-17-values');
  const snapshot = runtime.getSnapshot('lab-17-values');

  return {
    tensors: [tensor],
    visualizationData: snapshot ? { type: 'tensor-grid', tensor: snapshot } : undefined,
    codeSnippet: `const A = tf.tensor1d([${values.join(', ')}]);`,
  };
};

export const LAB_17_EXAMPLE_EXPERIMENTS = {
  [LAB_17_EXAMPLE]: exampleExperiment,
} satisfies Record<string, ExperimentFn>;
```

**Rules for experiments:**

- Create every tensor through `runtime.tidy(fn)` or `runtime.track(tensor, label)`.
  Never keep raw `tf.tensor(...)` results around; the runtime disposes tracked
  tensors when the lab is left.
- Reuse a stable label so re-running the experiment disposes the previous
  generation (`TfjsMemoryService.track` disposes the previous tensor with the
  same label).
- Return plain data for the UI; do not include tensors in `visualizationData`.
- Use `runtime.publishComputation(...)` if you want extra entries in the
  "Por baixo dos panos" panel.

### Step 7 — Challenges

`desafio` stages use `challengeValidationSchema`, a discriminated union. The
validator in
[`shared/challenges/challenge-validator.ts`](../src/app/shared/challenges/challenge-validator.ts)
implements five types:

| Type | Criteria | User input |
| --- | --- | --- |
| `parameter-match` | `{ target: Record<string, unknown> }` | current experiment parameters |
| `tensor-value` | `{ expectedShape, expectedValues, tolerance? }` | produced values/shape |
| `code-output` | `{ expectedOutput }` | trimmed code output |
| `multiple-choice` | `{ options, correctOptionIds, multiple? }` | selected option ids |
| `free-form` | `{ requiredTerms }` | answer text (required-term matching) |

Each challenge also accepts `prompt`, `hints`, `maxAttempts` and
`showSolutionAfter`.

### Step 8 — Visualizations

Pick an existing type from the `VISUALIZATION_TYPES` enum and return the
matching `VisualizationData` variant (see
[`architecture.md`](architecture.md#8-visualization-engine)). Registered
components cover `tensor-grid`, `matrix-heatmap`, `line-chart`, `scatter-plot`,
`activation-curve`, `memory-timeline`, `network-graph` and `image-tensor`.

For a lab-specific visualization, create the component in the feature's
`visualizations/` folder and register it via
`VisualizationRegistry.register(type, Component)`. Extend
`VISUALIZATION_TYPES` and the `VisualizationData` union in
`domain/content/schemas.ts` if the type is new.

### Step 9 — Register concepts

If the lab introduces a concept that does not exist yet, add it to
[`educational-content/concepts/concepts.ts`](../src/app/educational-content/concepts/concepts.ts).
The validator warns (not fails) when a referenced concept has no definition, but
the glossary and concept links will be missing. Set `introducedInLab` and
`reinforcedInLabs`, and use `relatedConcepts` to build cross-references.

### Step 10 — Validate and test

```bash
npm run validate:content   # schema + cross-reference checks
npm run lint               # layer boundaries and style
npm run test:unit          # unit/component tests
npm run build              # production compile
npm run e2e                # Playwright (build first)
```

Add a focused experiment spec (see
`features/labs/lab-15-images/lab-15-images.experiments.spec.ts` for the pattern)
and an E2E assertion that the lab loads with its stages. See
[`testing-guide.md`](testing-guide.md).

## Editing an existing lab

- Keep the content config, `lab-catalog.ts` entry and validator happy: the three
  must agree on `number`, `slug`, `title`, `description` and `category`.
- Preserve concept ids; renaming one requires updating `concepts.ts` and every
  lab config that references it.
- If stage order changes, remember that `desafio` must follow `experimentacao`
  in the pedagogical sequence.

## Debugging tips

- TF.js is not initialized until `TfjsInitService.initialize()` resolves; the
  `/tfjs-status` page shows the selected backend and memory.
- The "Por baixo dos panos" panel only shows data after an experiment publishes
  a computation event.
- If a lab renders but does not appear as its own lazy chunk, check the route
  registration (Step 4) and the `?stage=` deep link value (it must be a stage
  `type`, not a title).
