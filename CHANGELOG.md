# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project intends to use [Semantic Versioning](https://semver.org/).

## [Unreleased]

V1 is under construction: Phases 0–6 of the
[roadmap](../openspec/specs/roadmap/spec.md) are implemented; Phases 7.3.3–7.3.6
(screen-reader/Lighthouse/long-run audits) and Phases 8–9 (V2 preparation and the
Playwright acceptance suite) remain open. The `v1.0.0` release tag is intentionally
not created yet.

### Added

- **Foundation (Phase 0)** — Angular 22 CLI workspace with layered folders
  (`core`, `domain`, `shared`, `features`, `educational-content`), path aliases,
  strict TypeScript, angular-eslint layer-boundary rules, Tailwind 4 design tokens,
  `core/ui` primitives, routing with hash location, and `ProgressService` with
  debounced localStorage persistence and export/import.
- **Lab runtime (Phase 1)** — TF.js initialisation (`webgpu` → `webgl` → `cpu`),
  `TFJS_TOKEN`, `TfjsMemoryService`, `TensorSerializerService`, the universal
  `LabShellComponent`, dynamic stage rendering, component/visualization registries,
  the "Por baixo dos panos" panel, and the Zod-validated declarative content pipeline
  (`npm run validate:content`).
- **Tensors & operations (Phase 2)** — Labs 1–7: tensor fundamentals, manipulation,
  element-wise operations, reductions, matrix operations, broadcasting and applied
  linear algebra.
- **ML & regression (Phase 3)** — Labs 8–10: machine-learning fundamentals, linear
  regression and gradient descent (trained in a Web Worker).
- **Neurons & networks (Phase 4)** — Labs 11–14: the neuron, activation functions,
  neural networks and classification/decision boundaries.
- **Images & memory (Phase 5)** — Labs 15–16: images as tensors (with a new `image`
  experiment parameter and the `image-tensor` visualization) and memory management
  (live leak-vs-`tf.tidy` timeline).
- **Glossary & analytics dashboard (Phase 6.1/6.2)** — searchable glossary with detail
  view, inline concept links in lab content, concept cross-references, the
  `?concept=` deep link, the 12-dimension concept-mastery radar, per-lab progress
  detail, local analytics events and the "Seu aprendizado" view.
- **Accessibility audit (Phase 6.3)** — automated axe-core audit for both colour
  schemes, keyboard-only E2E flows and [`AUDIT_RESULTS.md`](../AUDIT_RESULTS.md).

### Changed

- The "Por baixo dos panos" panel now shows the TensorFlow.js code a lab actually
  executed (`ComputationEvent.code`) instead of a generated placeholder call.
- Progress persistence schema is now **v2** (`includeAnalyticsInExport`,
  `LabProgress.lastVisitedAt`) and migrated automatically from v1.

### Fixed

- Light-theme muted captions failed WCAG AA at 4.49:1 (`text-text/60` → `text-text/70`).
- Dark-theme white-on-accent text failed WCAG AA at ~2.5:1; a dedicated
  `text-on-primary` token now yields 5.07:1 (light) / 7.16:1 (dark).
- Challenge `parameter-match` comparisons now trim whitespace.
- Inline glossary links key off `href` because Angular's `innerHTML` sanitizer strips
  `data-*` attributes.
