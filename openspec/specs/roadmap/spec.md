# Roadmap Specification

## Purpose
Define the phased implementation plan for Neural Lab, with clear milestones, dependencies, and deliverables.

## Requirements

### Requirement: Phase 0 — Foundation (Weeks 1-2)
The system SHALL establish workspace, tooling, core infrastructure, and design system in the first two weeks.

#### Scenario: Milestone 0.1 — Workspace & Tooling
- **WHEN** phase starts
- **THEN** deliverables:
  - Existing Angular CLI workspace with Angular 22, TypeScript strict, ESLint, Prettier
  - Layered `src/app/` structure per technical architecture; `tsconfig.json` path aliases (`@core/*`, `@domain/*`, `@shared/*`, `@features/*`, `@content/*`)
  - GitHub Actions CI: OpenSpec validate, lint, unit tests, build, E2E
  - `openspec` initialized with specs from this document
- **AND** validation: `npm run build` succeeds, `npm run test:unit` passes

#### Scenario: Milestone 0.2 — TF.js Integration & Memory Layer
- **WHEN** Milestone 0.1 complete
- **THEN** deliverables:
  - `core/tfjs`: `TfjsInitService`, `TFJS_TOKEN`, backend selection (webgpu→webgl→cpu)
  - `TfjsMemoryService`: `tidy`, `track`, `disposeAll`, `getMemorySnapshot`, `watchMemory`
  - `TensorSerializerService`: `serialize(tensor)`, `serializeModel(model)`
  - Unit tests: memory tracking, serialization accuracy, disposal verification
  - Demo page: "TF.js Status" showing backend, memory, test tensor ops
- **AND** validation: Tensor creation/disposal cycle leaks 0 tensors

#### Scenario: Milestone 0.3 — Design System & UI Primitives
- **WHEN** Milestone 0.2 complete
- **THEN** deliverables:
  - `core/ui`: Button, Card, Panel, Badge, Tooltip, Modal, Tabs, ProgressRing, CodeBlock, CopyButton
  - Tailwind 4 config with CSS variables theming (light/dark)
  - `ThemeService`: persists preference, toggles `data-theme`
  - `FocusTrapDirective`, `LiveRegionService`, `ReducedMotionMixin`
  - Storybook (optional) or visual regression setup
  - Accessibility audit baseline (axe-core in tests)
- **AND** validation: All primitives pass axe-core AA, work in dark/light, keyboard accessible

#### Scenario: Milestone 0.4 — Routing, Layout, Progress Persistence
- **WHEN** Milestone 0.3 complete
- **THEN** deliverables:
  - `app.routes.ts` with lazy routes for all sections
  - `AppComponent` + `MainLayoutComponent` (header, nav, outlet)
  - `JourneyComponent` (static list of 16 labs), `CatalogComponent`, `GlossaryComponent`, `ProgressComponent`, `SettingsComponent`
  - `ProgressService` + `LocalStorageService`: signal-based state, debounced persist, migration
  - `ProgressMigrator` v1 schema
  - Export/Import progress JSON
- **AND** validation: Navigate all routes, refresh preserves progress, export/import roundtrip works

### Requirement: Phase 1 — Lab Infrastructure (Weeks 3-4)
The system SHALL build the reusable lab runtime, shell, stage components, and visualization engine in weeks 3-4.

#### Scenario: Milestone 1.1 — Lab Shell & Runtime
- **WHEN** Phase 0 complete
- **THEN** deliverables:
  - `features/lab-shell`: `LabShellComponent`, `StageRendererComponent`, `StageNavigatorComponent`
  - `LabRuntimeService` (per-lab scoped): tensor tracking, experiment state, disposal
  - `ComponentRegistry`: maps component keys → types
  - `VisualizationRegistry`: maps viz types → components
  - `UnderTheHoodPanelComponent` + `CodeGeneratorService`
  - Route: `/lab/:slug` → loads lab feature, renders shell
- **AND** validation: Empty lab feature loads, shell renders, navigation works, disposal on leave

#### Scenario: Milestone 1.2 — Stage Base Components
- **WHEN** Milestone 1.1 complete
- **THEN** deliverables in `shared/`:
  - `MarkdownStageComponent` (renders markdown with frontmatter)
  - `ConceptCardStageComponent` (reads from concept registry)
  - `VisualizationStageComponent` (wraps registry viz)
  - `ExperimentStageComponent`: reactive form from params, debounced `experimentFn`, live viz
  - `ChallengeStageComponent`: validation types (parameter-match, tensor-value, multiple-choice)
  - `CodeViewStageComponent`: view modes, copy button
  - Stage completion tracking + `stageComplete` emission
- **AND** validation: Each stage type renders, completes, emits correctly in test harness

#### Scenario: Milestone 1.3 — Visualization Engine (Core Set)
- **WHEN** Milestone 1.2 complete
- **THEN** deliverables in `shared/visualizations`:
  - `TensorGridComponent`: rank 1-3, slice selector, value tooltip, responsive
  - `MatrixHeatmapComponent`: color scale, labels, hover values
  - `LineChartComponent` (Chart.js): multi-series, epoch animation, tooltip
  - `ScatterPlotComponent`: classes, decision boundary overlay, hover details
  - `ActivationCurveComponent`: 4 functions, adjustable x-range, derivative toggle
  - `MemoryTimelineComponent`: snapshots, markers, hover stats
  - All: data table alternative, color-blind patterns, reduced motion
- **AND** validation: Visual regression tests, accessibility audit, performance < 16ms render

#### Scenario: Milestone 1.4 — Content Schema & Validation
- **WHEN** Milestone 1.3 complete
- **THEN** deliverables:
  - `domain/models`: Zod schemas for `LaboratoryConfig`, `StageConfig`, `ExperimentConfig`, `ChallengeValidation`, `VisualizationConfig`, `Concept`
  - `educational-content`: TypeScript configs for all 16 labs (stubs with stages)
  - `scripts/validate-content.mjs`: validates all configs at build/CI
  - CI integration: `npm run validate:content`
- **AND** validation: Build fails on invalid config, passes on current stubs

### Requirement: Phase 2 — Core Labs: Tensors & Operations (Weeks 5-8)
The system SHALL implement Labs 1-7 (Tensor Fundamentals through Applied Linear Algebra) in weeks 5-8.

#### Scenario: Milestone 2.1 — Lab 1: Tensor Fundamentals
- **WHEN** Phase 1 complete
- **THEN** deliverables:
  - `features/labs/lab-01-tensors`: routes, config, experiments
  - Stages: contextualização, conceito, analogia, exemplo-visual (tensor-grid: temperatures), demonstracao, experimentacao (create tensors), desafio (match shape), explicacao, codigo, resumo
  - Concepts: tensor, scalar, vector, matrix, rank, shape, size, dtype
  - Experiment: create tensor from array, inspect shape/rank/dtype
- **AND** validation: Complete lab flow, progress saved, all stages functional

#### Scenario: Milestone 2.2 — Lab 2: Tensor Manipulation
- **WHEN** Milestone 2.1 complete
- **THEN** deliverables:
  - `features/labs/lab-02-manipulation`: reshape, flatten, expandDims, squeeze
  - Experiment: reshape temperature tensor for weekly/monthly views
  - Challenge: transform (3,4,5) → (5,3,4) using only allowed ops
- **AND** validation: Operations correct, challenge validates

#### Scenario: Milestone 2.3 — Lab 3: Element-wise Operations
- **WHEN** Milestone 2.2 complete
- **THEN** deliverables:
  - `features/labs/lab-03-elementwise`: add, sub, mul, div, pow, sqrt
  - Experiment: recipe costs (ingredient vectors × price vectors)
  - Visualization: tensor-grid showing before/after
  - Challenge: compute total cost per recipe
- **AND** validation: Broadcasting works implicitly in experiment

#### Scenario: Milestone 2.4 — Lab 4: Reduction Operations
- **WHEN** Milestone 2.3 complete
- **THEN** deliverables:
  - `features/labs/lab-04-reductions`: sum, mean, min, max along axes
  - Experiment: temperature statistics (avg per city, max per day)
  - Visualization: line-chart (daily avg), heatmap (city×day)
  - Challenge: find city with highest temp variance
- **AND** validation: Axis parameter works correctly (0 vs 1 vs -1)

#### Scenario: Milestone 2.5 — Lab 5: Matrix Operations
- **WHEN** Milestone 2.4 complete
- **THEN** deliverables:
  - `features/labs/lab-05-matrix`: transpose, matMul
  - Experiment: product quantities (3×5) × prices (5×1) = costs (3×1)
  - Visualization: matrix-heatmap for each matrix, network-graph for matMul
  - Challenge: compute revenue for different price scenarios
- **AND** validation: matMul shape rules enforced, error messages clear

#### Scenario: Milestone 2.6 — Lab 6: Broadcasting
- **WHEN** Milestone 2.5 complete
- **THEN** deliverables:
  - `features/labs/lab-06-broadcasting`: rules, compatible shapes, implicit expansion
  - Experiment: Celsius → Fahrenheit for multiple cities (vector + scalar, matrix + vector)
  - Visualization: step-by-step broadcast animation (shape alignment)
  - Challenge: predict output shape for 5 broadcast scenarios
- **AND** validation: Animation shows broadcasting correctly, challenge covers edge cases

#### Scenario: Milestone 2.7 — Lab 7: Applied Linear Algebra
- **WHEN** Milestone 2.6 complete
- **THEN** deliverables:
  - `features/labs/lab-07-linear-algebra`: vectors, dot product, linear transformations
  - Experiment: 2D points → rotation/scaling matrices → transformed points
  - Visualization: scatter-plot with before/after, transformation matrix display
  - Challenge: find transformation matrix that maps set A to set B
- **AND** validation: Geometric intuition clear, math correct

### Requirement: Phase 3 — ML Fundamentals & Regression (Weeks 9-12)
The system SHALL implement Labs 8-10 (ML Concepts, Linear Regression, Gradient Descent) in weeks 9-12.

#### Scenario: Milestone 3.1 — Lab 8: ML Fundamentals
- **WHEN** Phase 2 complete
- **THEN** deliverables:
  - `features/labs/lab-08-ml-fundamentals`: dataset, features, labels, train/val split, loss, epoch, batch, lr
  - Experiment: explore housing dataset (features, distributions, correlations)
  - Visualization: scatter-plot matrix, correlation heatmap
  - Challenge: identify which feature correlates most with price
- **AND** validation: Dataset loads, splits reproducible, stats correct

#### Scenario: Milestone 3.2 — Lab 9: Linear Regression
- **WHEN** Milestone 3.1 complete
- **THEN** deliverables:
  - `features/labs/lab-09-linear-regression`: y = wx + b, MSE, fitting, prediction
  - Experiment: interactive line fit (adjust w, b sliders → see MSE)
  - Visualization: scatter-plot with regression line, MSE curve
  - "Under the hood": shows gradient computation for MSE
  - Challenge: find w,b that achieve MSE < threshold
- **AND** validation: Manual fit matches TF.js optimizer result

#### Scenario: Milestone 3.3 — Lab 10: Gradient Descent
- **WHEN** Milestone 3.2 complete
- **THEN** deliverables:
  - `features/labs/lab-10-gradient-descent`: cost surface, gradient, lr, convergence, divergence
  - Experiment: 3D cost surface (MSE bowl) + ball rolling down (adjustable LR)
  - Visualization: line-chart (loss per epoch), 2D contour with trajectory
  - LR presets: too small (slow), good (fast), too large (diverges), oscillating
  - Challenge: find LR that converges in < 50 epochs without overshoot
- **AND** validation: All LR behaviors demonstrable, training in worker

### Requirement: Phase 4 — Neurons, Activations & Networks (Weeks 13-18)
The system SHALL implement Labs 11-14 (Neuron, Activations, Neural Networks, Classification) in weeks 13-18.

#### Scenario: Milestone 4.1 — Lab 11: The Neuron
- **WHEN** Phase 3 complete
- **THEN** deliverables:
  - `features/labs/lab-11-neuron`: inputs, weights, bias, weighted sum, activation, output
  - Experiment: single neuron classifying 2D points (adjust w1, w2, b → see decision line)
  - Visualization: network-graph (1 neuron), decision-boundary (line), activation-curve
  - "Under the hood": shows weighted sum + activation step by step
  - Challenge: find weights that separate two clusters
- **AND** validation: Neuron matches `tf.layers.dense({units: 1, activation: 'sigmoid'})`

#### Scenario: Milestone 4.2 — Lab 12: Activation Functions
- **WHEN** Milestone 4.1 complete
- **THEN** deliverables:
  - `features/labs/lab-12-activations`: Sigmoid, ReLU, Tanh, Softmax
  - Experiment: interactive curve (drag x → see y, derivative, saturation zones)
  - Visualization: activation-curve (all 4 overlay), derivative toggle
  - "Under the hood": shows derivative formulas, vanishing gradient demo
  - Challenge: match activation to use case (binary output → sigmoid, hidden → relu, etc.)
- **AND** validation: Derivatives numerically verified

#### Scenario: Milestone 4.3 — Lab 13: Neural Networks
- **WHEN** Milestone 4.2 complete
- **THEN** deliverables:
  - `features/labs/lab-13-neural-networks`: layers, forward prop, loss, backprop, training loop
  - Experiment: build network (layers/neurons/activations) → train on spiral/moons
  - Visualization: decision-boundary animation (epochs), loss/accuracy charts, network-graph with weight magnitudes
  - Training in worker, streams metrics
  - "Under the hood": shows one backprop step (gradients for 2-layer net)
  - Challenge: achieve > 90% accuracy on moons with < 3 hidden layers
- **AND** validation: Training converges, worker communication works, memory stable

#### Scenario: Milestone 4.4 — Lab 14: Classification & Decision Boundaries
- **WHEN** Milestone 4.3 complete
- **THEN** deliverables:
  - `features/labs/lab-14-classification`: binary/multi-class, decision boundary, XOR
  - Experiment: toggle XOR dataset → see linear fail → add hidden layer → see success
  - Visualization: decision-boundary (evolution slider), confusion matrix, class distribution
  - Multi-class: softmax output, one-hot labels
  - Challenge: design network that solves XOR (min neurons/layers)
- **AND** validation: XOR demonstrably fails with 0 hidden layers, succeeds with ≥ 2 neurons

### Requirement: Phase 5 — Images & Memory (Weeks 19-22)
The system SHALL implement Labs 15-16 (Images as Tensors, Memory Management) in weeks 19-22.

#### Scenario: Milestone 5.1 — Lab 15: Images as Tensors
- **WHEN** Phase 4 complete
- **THEN** deliverables:
  - `features/labs/lab-15-images`: image → pixels → tensor, shape, RGB, grayscale, resize, normalize
  - Experiment: upload image → see tensor (3×H×W), grayscale (1×H×W), resize (224×224), normalize [0,1]
  - Visualization: image-tensor (original + tensor slices side-by-side), channel toggle
  - "Under the hood": shows `tf.browser.fromPixels`, `tf.image.resizeBilinear`, div/255
  - Challenge: preprocess image for MobileNet input (224×224×3, [-1,1])
- **AND** validation: Image loading works, tensor shapes correct, normalization verified

#### Scenario: Milestone 5.2 — Lab 16: Memory Management
- **WHEN** Milestone 5.1 complete
- **THEN** deliverables:
  - `features/labs/lab-16-memory`: tf.memory(), tf.dispose(), tf.tidy(), leaks, best practices
  - Experiment: leak demo (create tensors in loop without dispose) → memory rises → fix with tidy
  - Visualization: memory-timeline (live), leak vs fixed comparison
  - "Under the hood": shows memory before/after each operation
  - Challenge: refactor leaky code to use tidy (code-output validation)
- **AND** validation: Leak demo actually leaks, tidy fix recovers memory, challenge validates

### Requirement: Phase 6 — Polish & Integration (Weeks 23-26)
The system SHALL address cross-cutting concerns, glossary, progress dashboard, accessibility, and performance in weeks 23-26.

#### Scenario: Milestone 6.1 — Glossary & Concept Integration
- **WHEN** Phase 5 complete
- **THEN** deliverables:
  - `features/glossary`: page, search, detail view, inline modal
  - Concept registry populated from all labs (40+ concepts)
  - Inline glossary links in all lab content (markdown → linkify)
  - Cross-references: "Ver também", "Pré-requisito", "Reforçado em"
- **AND** validation: All terms linked, glossary search works, navigation seamless

#### Scenario: Milestone 6.2 — Progress Dashboard & Analytics
- **WHEN** Milestone 6.1 complete
- **THEN** deliverables:
  - `ProgressComponent`: overall %, radar chart (12 concepts), per-lab detail
  - Analytics events: lab-started, stage-completed, challenge-passed, etc.
  - Local analytics view: "Seu aprendizado" (time, streak, struggle points)
  - Export includes analytics (opt-in)
- **AND** validation: Dashboard reflects actual progress, radar updates on lab completion

#### Scenario: Milestone 6.3 — Accessibility & Performance Audit
- **WHEN** Milestone 6.2 complete
- **THEN** deliverables:
  - Full axe-core audit: 0 violations AA
  - Keyboard testing all flows
  - Screen reader testing (NVDA/VoiceOver)
  - Lighthouse: Performance > 90, Accessibility > 95, Best Practices > 90
  - Bundle analysis: budgets met
  - Memory stress test: 30 min session, no leaks
- **AND** validation: All audits pass, documented in `AUDIT_RESULTS.md`

#### Scenario: Milestone 6.4 — Documentation & Release Prep
- **WHEN** Milestone 6.3 complete
- **THEN** deliverables:
  - `README.md`: project overview, quick start, architecture summary
  - `docs/architecture.md`: from technical-architecture spec
  - `docs/learning-path.md`: from learning-journey spec
  - `docs/labs/`: one page per lab (concepts, stages, experiment guide)
  - `docs/tensorflow-concepts.md`: TF.js API reference used
  - `docs/mathematical-concepts.md`: math background for each lab
  - `docs/development-guide.md`: adding labs, testing, debugging
  - `docs/testing-guide.md`: test strategies, running tests
  - `docs/contribution-guide.md`: content + code contribution process
  - Release: GitHub Pages deploy, version tag, changelog
- **AND** validation: All docs render, deploy works, new contributor can add lab following guide

### Requirement: Phase 7 — V2 Preparation (Post-V1 Release)
The system SHALL validate architectural readiness for the Challenge system after V1 release.

#### Scenario: Milestone 7.1 — Challenge Infrastructure Spike
- **WHEN** V1 released
- **THEN** spike: implement Challenge 1 (Food Cost Prediction) using V1 infrastructure
- **AND** validate: no breaking changes to labs, reuse > 80% components
- **AND** document: required extensions to `LaboratoryConfig`, new services, new components

#### Scenario: Milestone 7.2 — Challenge Architecture Decision
- **WHEN** spike complete
- **THEN** decision: proceed with current architecture / refactor needed
- **AND** update OpenSpec with `challenge-architecture` modifications
- **AND** create V2 roadmap

### Requirement: Dependency Graph & Critical Path
The system SHALL identify blocking dependencies between milestones.

#### Scenario: Critical path
```
Phase 0 (0.1→0.2→0.3→0.4) 
  → Phase 1 (1.1→1.2→1.3→1.4) 
    → Phase 2 (2.1→2.2→2.3→2.4→2.5→2.6→2.7) 
      → Phase 3 (3.1→3.2→3.3) 
        → Phase 4 (4.1→4.2→4.3→4.4) 
          → Phase 5 (5.1→5.2) 
            → Phase 6 (6.1→6.2→6.3→6.4)
```
- **Total sequential**: ~26 weeks (6.5 months)
- **Parallelization opportunities**:
  - Phase 0.3 (UI) || Phase 0.2 (TF.js) after 0.1
  - Phase 1.3 (Visualizations) can start after 1.1 (registry exists)
  - Lab content authoring (educational-content) can start after 1.4 (schema stable)
  - Phase 6.1 (Glossary) can start after Lab 3 concepts defined

#### Scenario: Risk buffers
- **WHEN** estimating
- **THEN** add 20% buffer per phase
- **AND** Phase 4 (Neural Networks) highest risk: +2 weeks buffer
- **AND** Phase 6.3 (A11y/Perf) non-negotiable: fixed 2 weeks

### Requirement: Definition of Done per Milestone
The system SHALL enforce a consistent Definition of Done for every milestone.

#### Scenario: Milestone acceptance criteria
- **WHEN** a milestone is submitted for review
- **THEN** all deliverables are implemented and demonstrated
- **AND** unit tests pass with >80% coverage for new code
- **AND** component tests pass for new components
- **AND** E2E test added for new user flow
- **AND** accessibility audit (axe-core) passes with 0 violations AA
- **AND** performance budget met (LCP < 2.5s, bundle < 500KB gzipped)
- **AND** documentation updated (README, architecture, lab guides)
- **AND** code reviewed with minimum 1 approval
- **AND** deployed to staging environment
- **AND** product owner acceptance recorded