# Proposal

## Why

Neural Lab is an interactive educational platform for teaching Machine Learning, Neural Networks, and TensorFlow.js fundamentals through guided hands-on laboratories. The product addresses the gap between theoretical ML education and practical TensorFlow.js implementation by providing a structured learning journey: concept → example → experiment → challenge → explanation → code. This proposal initiates the V1 implementation based on the 9 approved OpenSpec specifications.

## What Changes

- **New Application**: Angular 22 CLI application (standalone components + signals) in `src/app`
- **Core Infrastructure**: TF.js initialization, memory management layer, design system, routing, progress persistence
- **Lab Runtime**: Universal lab shell, stage renderer, component/visualization registries, "Under the Hood" panel
- **16 Laboratories**: Tensors & Operations (7 — fundamentals, manipulation, element-wise, reductions, matrix, broadcasting, linear algebra), ML & Regression (3 — ML fundamentals, linear regression, gradient descent), Neurons & Networks (4 — neuron, activations, neural networks, classification), Images & Memory (2 — images as tensors, memory management)
- **Visualization Engine**: 10 visualization components (tensor-grid, tensor-3d, matrix-heatmap, line-chart, scatter-plot, decision-boundary, activation-curve, memory-timeline, image-tensor, network-graph)
- **Content Architecture**: Declarative TypeScript lab configs, Zod-validated schemas, build-time content validation
- **Progress System**: localStorage-based progress with export/import, analytics events, concept mastery radar
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support, reduced motion, color independence
- **UI Framework**: **Tailwind CSS 4.x** with CSS variables for theming (light/dark/system)
- **Documentation**: Architecture, learning path, lab guides, TF.js concepts, math concepts, development/testing/contribution guides
- **Tooling Practice**: **All implementation MUST consult MCP Context7 for current documentation** of Angular, TensorFlow.js, Tailwind CSS, Chart.js, Vitest, and any other libraries before using them

## Capabilities

### Specified Capabilities (source of truth: `openspec/specs/`)
This change declares no spec-level behavior changes (`skip_specs: true`). The capabilities below are already specified and approved in `openspec/specs/`; this change implements them and treats those specs as the source of truth.

- `product-vision`: Core product identity, audience, pedagogical principles, computational transparency, memory management, local-first privacy, V2 challenge readiness
- `learning-journey`: 16-lab sequence with prerequisites, pedagogical stage templates, progress tracking, concept glossary
- `information-architecture`: Navigation, routing, lab shell, "under the hood" panel, glossary, progress dashboard, responsive layouts
- `domain-model`: Lab/Stage/Concept entities, Experiment/Challenge/Visualization configs, Progress aggregate, TF.js runtime state
- `technical-architecture`: Angular CLI workspace structure, standalone + signals, TF.js integration layer, visualization engine, testing strategy, build/deploy
- `laboratory-architecture`: Lab as lazy-loaded feature, lab shell/runtime, stage component contracts, experiment/challenge architecture, panel data flow
- `challenge-architecture`: Challenge as lab variant, sandbox execution, UI components, progress tracking, V1 infrastructure readiness, V2 challenge catalog
- `requirements`: Complete functional/non-functional requirements with acceptance criteria (onboarding, TF.js execution, visualizations, a11y, performance, errors, security)
- `roadmap`: 7-phase implementation plan (26 weeks), milestones with scenarios, dependency graph, critical path, definition of done

### Modified Capabilities
None — this is an implementation-only change over already-approved specs.

## Impact

**Code**: Existing Angular CLI app extended with layered folders under `src/app/` (`core/`, `domain/`, `shared/`, `features/`, `educational-content/`)

**APIs**: TensorFlow.js (WebGPU/WebGL/CPU), Chart.js for metrics, potential Monaco Editor for V2 challenges

**Dependencies**: 
- `@angular/*` 22.x, `rxjs` 7.8, `tslib` (installed)
- `@tensorflow/tfjs` 4.x (and optionally `@tensorflow/tfjs-vis`)
- `tailwindcss` 4.x, `@tailwindcss/postcss` 4.x (installed)
- `chart.js` 4.x, `chartjs-adapter-date-fns`
- `vitest` 4.x through the Angular unit-test runner, `@playwright/test` 1.x (installed)
- `zod` for schema validation, `date-fns` for formatting

**Systems**: 
- Browser: WebGL2/WebGPU for TF.js, Web Workers for training
- Storage: localStorage (progress, settings, analytics)
- CI: GitHub Actions (OpenSpec validate, lint, unit tests, build, E2E, content validation)
- Deployment: Static hosting (GitHub Pages/Netlify/Vercel)

**Documentation**: All specs in `openspec/specs/` become the source of truth for implementation decisions