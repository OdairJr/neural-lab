# Accessibility & Performance Audit — Neural Lab V1

Date: 2026-10-01
Change: `neural-lab-v1-implementation` — Phase 6, milestone 6.3
Executed on: Chromium (Playwright `Desktop Chrome` device), production build served
statically.

This document reports only results that were actually produced by the commands listed
below. Milestone 6.3 tasks that require human operators or external tooling (screen
readers, Lighthouse, 30-minute memory stress) are explicitly marked as not performed at
the end of this file.

## Tooling

| Tool | Version |
| --- | --- |
| `@axe-core/playwright` | 4.13.0 |
| `axe-core` (transitive) | 4.13.0 |
| `@playwright/test` | ^1.63.0 |
| Angular | ^22.1.0 |

The axe scan is limited to the WCAG 2.1 A/AA rule tags
(`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`), matching the project requirement
"WCAG 2.1 AA". Best-practice rules are intentionally not enabled.

## 7.3.1 — Automated accessibility audit (axe-core)

- Spec: `e2e/accessibility.spec.ts`
- Command: `npx playwright test accessibility.spec.ts` (also exercised by `npm run e2e`)
- The scan asserts **zero violations**. Any violation fails the test and prints the rule
  id, impact and offending node targets.
- The full page/state matrix is executed for **both colour schemes** — light and dark.
  Each run asserts that the requested scheme is actually applied (the browser reports
  `prefers-color-scheme` accordingly and the resolved `body` background matches the
  scheme's `--nl-bg` token), so the dark theme cannot silently be audited as light.
- The helper also requires `color-contrast` to appear in axe's **passing** results, so the
  rule cannot silently stop evaluating (axe reports it as `incomplete` when it cannot
  resolve a background). Axe does report a few `color-contrast` entries as `incomplete`
  for known engine limitations (the symbol-only modal close button and the modal overlay)
  — these are not violations, are surfaced in the failure message if the guard ever trips,
  and are not excluded from the scan.

### Pages / states scanned (8 × 2 schemes = 16 audits)

| State | Route | Violations (WCAG 2.1 A/AA) |
| --- | --- | --- |
| Journey | `/#/jornada` | 0 light / 0 dark |
| Labs catalog | `/#/laboratorios` | 0 light / 0 dark |
| Glossary | `/#/glossario` | 0 light / 0 dark |
| Progress dashboard | `/#/progresso` | 0 light / 0 dark |
| Settings | `/#/configuracoes` | 0 light / 0 dark |
| Lab shell | `/#/lab/01-fundamentos-de-tensores` | 0 light / 0 dark |
| Glossary detail modal from inline lab link | lab 01, `?stage=contextualizacao` | 0 light / 0 dark |
| Experiment stage with "Por baixo dos panos" panel open | lab 01, `?stage=experimentacao` | 0 light / 0 dark |

Result: **16 audits passed (0 violations each scheme)**.

### Defects fixed

Two genuine WCAG AA `color-contrast` failures were found and fixed at the source; no axe
rule was disabled and no element was excluded.

1. **Light theme — muted captions (4.49:1).** The first scan reported `color-contrast`
   (serious) on the Journey, Catalog, Glossary and Settings pages. The offending elements
   were muted captions using `text-text/60` over `--nl-surface`, e.g.
   `<p class="text-xs text-text/60">20 min</p>`. The measured ratio was **4.49:1** against
   a required **4.5:1** — a genuine AA failure, not a rounding artifact. Fix: the faintest
   muted level was raised to the already-established accessible `text-text/70` level
   (≈6.3:1 light) in the 12 files below.

2. **Dark theme — white text on the accent colour (≈2.5:1).** `--nl-primary` is
   `oklch(0.72 0.15 265)` in dark mode, so `text-white` on `bg-primary` (active nav item,
   current stage, primary buttons, "Por baixo dos panos" tab, etc.) measured **≈2.5:1**.
   Fix: a dedicated `--nl-on-primary` token was added (`oklch(1 0 0)` light /
   `oklch(0.2 0.03 265)` dark) and exposed as `text-on-primary`, and the eight
   `bg-primary text-white` pairings were switched to it. Measured ratios:
   `text-on-primary` on `bg-primary` = **5.07:1 (light) / 7.16:1 (dark)**; the existing
   `bg-red-600 text-white` (danger button, ≈4.83:1) was left unchanged.

| File | Occurrences (`text-text/60` → `text-text/70`) |
| --- | --- |
| `src/app/features/glossary/glossary.component.ts` | 2 |
| `src/app/features/journey/catalog.component.ts` | 1 |
| `src/app/features/journey/journey.component.ts` | 1 |
| `src/app/features/journey/progress.component.ts` | 6 |
| `src/app/features/lab-shell/lab-shell.component.ts` | 1 |
| `src/app/features/lab-shell/under-the-hood-panel.component.ts` | 1 |
| `src/app/features/settings/settings.component.ts` | 1 |
| `src/app/features/tfjs-status/tfjs-status.component.ts` | 5 |
| `src/app/shared/stages/challenge-stage.component.ts` | 1 |
| `src/app/shared/stages/experiment-stage.component.ts` | 2 |
| `src/app/shared/visualizations/image-tensor/image-tensor.component.ts` | 2 |
| `src/app/shared/visualizations/network-graph/network-graph.component.ts` | 1 |

Dark-theme `text-white` → `text-on-primary`: `main-layout.component.ts`,
`stage-navigator.component.ts`, `under-the-hood-panel.component.ts`,
`stage-layout.component.ts`, `challenge-stage.component.ts`, `code-view-stage.component.ts`,
`journey.component.ts`, `core/ui/button/button.component.ts` (primary variant).

## 7.3.2 — Keyboard navigation testing

- Spec: `e2e/keyboard.spec.ts`
- Command: `npx playwright test keyboard.spec.ts` (also exercised by `npm run e2e`)
- Every scenario asserts real focus movement via `document.activeElement`.

### Scenarios covered (7)

1. **Tab order** — from the Journey page, Tab reaches the primary navigation
   (`nav[aria-label="Navegação principal"]`) and then the main content, in that order.
   The focused navigation element resolves to the `/jornada` link.
2. **Glossary modal from an inline lab link** — activating the link with `Enter` moves
   focus into the dialog (first focusable is the "Fechar" button); six subsequent `Tab`
   presses and a `Shift+Tab` wrap stay trapped inside the dialog; `Escape` closes it and
   focus is restored to the originating inline link.
3. **"Por baixo dos panos" panel toggle** — focusable, toggles with `Enter`
   (`aria-expanded` flips, region shows/hides) and retains focus.
4. **Stage navigator** — after completing the first stage with the keyboard, the next
   stage button is enabled, focusable and activates with `Enter`, moving
   `aria-current="step"` to it.
5. **Stage footer navigation** — the "Próxima etapa" button is focusable and advances the
   stage with `Enter`; the counter updates to "Etapa 2 de 10".
6. **Visible focus indicator** — a keyboard-focused control exposes a non-`none`,
   non-zero computed outline, so `:focus-visible` styling is present.
7. **Lab-shell focus order** — tabbing through a lab reaches the header controls, the
   stage navigator (sidebar), the main content and the footer controls in that order,
   satisfying the focus-order requirement of `requirements/spec.md`.

Result: **7 passed**. No focus-management gaps were found in the application: the
existing `FocusTrapDirective`, `Escape` handling and focus restoration already behaved
correctly, so no application code changes were required for this task. The focus-indicator
scenario verifies that *an* indicator is present and visible; it does not assert the
project's specific outline colours (the browser's `:focus-visible` default would also
satisfy it).

## 7.3.5 — Bundle budgets analysis

Angular production budgets are configured in `angular.json` and enforced by
`npm run build` (the production configuration is the default):

| Budget | Warning | Error |
| --- | --- | --- |
| `initial` | 500 kB | 1 MB |
| `anyComponentStyle` | 4 kB | 8 kB |

Command: `npm run build` (production). Result: build succeeds with **no budget warnings
or errors**. Budgets were not loosened.

### Initial bundle

| Metric | Raw size | Estimated transfer |
| --- | --- | --- |
| Initial total | 375.27 kB | 102.78 kB |

The initial total is 75% of the 500 kB warning threshold and ~37% of the 1 MB error
threshold.

### Largest lazy chunks

| Chunk | Name | Raw size | Estimated transfer |
| --- | --- | --- | --- |
| `chunk-BsjAz-IJ.js` | `index` (TF.js bundle) | 1.11 MB | 223.22 kB |
| `chunk-CnnqfocT.js` | — | 312.07 kB | 87.84 kB |
| `chunk-DraqrXOb.js` | — | 132.86 kB | 30.77 kB |
| `chunk-9gZLAiV4.js` | `progress-component` | 12.31 kB | 4.41 kB |
| `worker-HXPQUT6W.js` | `training-worker` | 4.99 kB | 1.89 kB |
| `chunk-CvAtTRRr.js` | `glossary-component` | 4.52 kB | 1.86 kB |
| `chunk-Bnt2A1xd.js` | `settings-component` | 4.50 kB | 1.75 kB |
| `chunk-BG9L_x-J.js` | `labs-routes` | 3.49 kB | 1.21 kB |

Per-lab route chunks are small: every `lab-*-routes` chunk is under 3 kB raw, and the
feature code they load is split into shared chunks. The task note "lab chunks < 100KB"
is met for the per-lab route chunks themselves. The dominant lazy chunk is the shared
TensorFlow.js bundle (1.11 MB raw / 223.22 kB transfer), which is loaded only when a lab
is opened, not on initial load. No per-lazy-chunk budget is currently configured; only
the `initial` and `anyComponentStyle` budgets exist, and both pass.

## Not covered by this audit

The following milestone 6.3 tasks were **not** completed and remain unchecked:

- **7.3.3 Screen reader testing (NVDA/VoiceOver)** — requires a human operator with those
  assistive technologies; cannot be automated here. The axe scan and `LiveRegionService`
  unit tests are only a partial proxy and do not substitute for it.
- **7.3.4 Lighthouse audit** — requires an external Lighthouse run
  (Performance > 90, Accessibility > 95, Best Practices > 90). No Lighthouse run was
  performed, so no scores are reported.
- **7.3.6 Memory stress test (30 min session)** — requires a long-running interactive
  session; not practically automatable in this environment. The Memory lab E2E test does
  verify that leaky tensors grow and `tf.tidy` keeps the live tensor count flat, but that
  is a short functional check, not a 30-minute leak test.
