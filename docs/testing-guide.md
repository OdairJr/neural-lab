# Testing Guide

NeuralLab uses three test layers, all runnable locally. Tests are part of the
feature: a change is not complete until its focused tests, the full unit suite
and the relevant E2E specs pass.

| Layer | Tool | Command | Location |
| --- | --- | --- | --- |
| Unit / component | Angular unit-test runner (Vitest 4) | `npm run test:unit` | `src/**/*.spec.ts` |
| Unit (watch) | Vitest | `npm run test:watch` | `src/**/*.spec.ts` |
| Browser / E2E | Playwright (Chromium) | `npm run e2e` | `e2e/*.spec.ts` |
| Full local gate | — | `npm run ci` | — |

## 1. Unit and component tests (Vitest through `ng test`)

The Angular unit-test builder is configured in
[`angular.json`](../angular.json) (`@angular/build:unit-test`) with
`setupFiles: ["src/test-setup.ts"]`. Specs use the Vitest globals (`describe`,
`it`, `expect`, `vi`) without importing them.

Two representative patterns:

### Testing TF.js services with the CPU backend

Tensor-based tests use the browser `@tensorflow/tfjs` package on the **CPU**
backend for deterministic, reproducible results. `TFJS_TOKEN` is provided with
the real module (or a fake, for component tests):

[`src/app/core/tfjs/tfjs-memory.service.spec.ts`](../src/app/core/tfjs/tfjs-memory.service.spec.ts)

```ts
import { TestBed } from '@angular/core/testing';
import * as tf from '@tensorflow/tfjs';
import { TfjsMemoryService } from './tfjs-memory.service';
import { TFJS_TOKEN } from './tfjs.token';

beforeAll(async () => {
  await tf.setBackend('cpu');
  await tf.ready();
});

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [{ provide: TFJS_TOKEN, useValue: tf }],
  });
});
```

The spec asserts real behavior: a create/dispose cycle returns
`tf.memory().numTensors` to baseline, a reused label disposes the previous
tensor, `tidy()` disposes intermediates, and `watchMemory` fires each threshold
callback once per crossing. Timers are controlled with
`vi.useFakeTimers()` / `vi.advanceTimersByTime(...)`.

For component tests that should not boot TF.js, provide a mock through the same
token:

```ts
const fakeTf = { memory: () => memory } as unknown as typeof tf;
TestBed.configureTestingModule({ providers: [{ provide: TFJS_TOKEN, useValue: fakeTf }] });
```

### jsdom `localStorage`

[`src/test-setup.ts`](../src/test-setup.ts) installs an in-memory `Storage`
implementation when no working `localStorage` exists. Recent Node.js versions
expose an experimental `globalThis.localStorage` getter that shadows jsdom's
own; without this shim, every storage-backed test would see `undefined`. The
shim does not change service behavior — assertions still exercise the real
`LocalStorageService`/`ProgressService` code paths.

Other unit specs worth reading as patterns: `domain/content/schemas.spec.ts`,
`domain/progress/progress.service.spec.ts`, `shared/registries.spec.ts`,
`shared/challenges/challenge-validator.spec.ts`,
`shared/code-view/code-generator.service.spec.ts`, and the per-lab
`*.experiments.spec.ts` files (for example
[`lab-15-images.experiments.spec.ts`](../src/app/features/labs/lab-15-images/lab-15-images.experiments.spec.ts)).

## 2. Playwright E2E

E2E runs against the **production build**, not the dev server. Build first:

```bash
npm run build
npm run e2e        # or: npm run e2e:ui
```

[`playwright.config.ts`](../playwright.config.ts) starts a dependency-free
static server ([`scripts/serve-dist.mjs`](../scripts/serve-dist.mjs)) that serves
`dist/neural-lab/browser` at `http://127.0.0.1:4173` on one Chromium project.
`npm run ci` builds before running E2E, and Playwright reuses an existing server
locally (`reuseExistingServer: !process.env.CI`).

### Conventions used by the specs

- **Hash routes** — navigate with `page.goto('/#/jornada')`,
  `page.goto('/#/lab/01-fundamentos-de-tensores')`, etc.
- **Stage deep links** — append `?stage=<stage-type>`, e.g.
  `/#/lab/15-imagens-como-tensores?stage=experimentacao`.
- **Real file upload** — Lab 15 is verified with `setInputFiles` and an embedded
  in-memory PNG buffer (no fixture file needed).
- **Downloads** — the progress export test waits for the `download` event and
  reads the file with `node:fs/promises`, asserting analytics are present only
  after the opt-in checkbox is checked.
- Assertions are user-visible (roles, headings, counts of rendered stage
  buttons), not implementation internals.

See [`e2e/app.spec.ts`](../e2e/app.spec.ts) for the full set: journey, catalog,
lab shell, stage navigation, image upload, memory lab behavior, glossary search
and deep links, inline glossary modal, the 12-dimension mastery radar, and the
progress export/import path.

## 3. Accessibility

Accessibility is verified automatically in two Playwright specs.

### axe-core audit — `e2e/accessibility.spec.ts`

- Uses `@axe-core/playwright` and asserts **zero violations** for the WCAG 2.1
  A/AA tags (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`); best-practice rules
  are intentionally excluded.
- Scans a page/state matrix in **both light and dark schemes** and asserts the
  requested scheme actually applied, so the dark theme cannot silently be audited
  as light.
- The helper requires `color-contrast` to appear among axe's passing results so
  the rule cannot silently stop evaluating.

### Keyboard flows — `e2e/keyboard.spec.ts`

Asserts real focus movement via `document.activeElement` (not just that controls
exist): tab order from the Journey page, focus trapping and `Escape` handling in
the glossary dialog with focus restoration, the "Por baixo dos panos" toggle,
stage navigator and footer navigation by keyboard, and a visible focus
indicator.

The recorded results, the full page/state matrix and the defects fixed are in
[`AUDIT_RESULTS.md`](../AUDIT_RESULTS.md). That file also lists the audit items
that were **not** performed (screen-reader and Lighthouse runs), so do not cite
it as evidence for those.

## 4. The local CI gate

```bash
npm run ci
```

This runs, in order:

```text
openspec:validate  →  validate:content  →  lint  →  test:unit  →  build  →  e2e
```

It is the same set of checks the `quality` job runs (OpenSpec validation,
content validation, lint, unit tests), plus the production build and Playwright
suite that run in the `build-and-e2e` job of
[`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml). See
[`contribution-guide.md`](contribution-guide.md) for the pipeline.

## 5. Testing conventions

1. **Behavior-focused** — test what the code does, not how it is wired.
2. **Never weaken a test to make it pass.** Fix the code, or escalate a
   specification problem; do not delete assertions, skip specs or loosen lint
   rules.
3. **Tests ship with the feature.** New behavior includes focused unit tests;
   user-visible behavior includes Playwright coverage where appropriate.
4. **Deterministic math** — use the CPU backend and fixed seeds for tensor and
   training tests.
5. **No fake tests.** A test that cannot fail is not a test.
