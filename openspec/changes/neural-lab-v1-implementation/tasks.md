# Tasks

## 1. Phase 0 — Foundation (Weeks 1-2)

### 1.1 Workspace & Tooling
- [x] 1.1.1 Adopt the existing Angular 22 CLI workspace (already scaffolded) — verify `npm run build` succeeds
- [x] 1.1.2 Configure TypeScript strict mode in `tsconfig.json` (`strict`, `strictTemplates`) — verify `npm run build` typechecks cleanly
- [x] 1.1.3 Set up ESLint (angular-eslint flat config) + Prettier with layer boundary rules (`no-restricted-imports`) — verify `npm run lint` passes
- [x] 1.1.4 Create layered folder structure per technical architecture under `src/app`: `core/data`, `core/tfjs`, `core/ui`, `core/utils`, `domain/models`, `domain/content`, `domain/progress`, `shared/visualizations`, `shared/experiments`, `shared/challenges`, `shared/code-view`, `features/journey`, `features/lab-shell`, `features/glossary`, `features/settings`, `features/labs`, `educational-content/lab-configs`, `educational-content/concepts`
- [x] 1.1.5 Configure path aliases in `tsconfig.json`: `@core/*`, `@domain/*`, `@shared/*`, `@features/*`, `@content/*` — verify imports work in a test file
- [x] 1.1.6 Configure GitHub Actions CI workflow: OpenSpec validate, lint, unit tests, build, E2E (extend `.github/workflows/ci-cd.yml`) — verify workflow runs on PR
- [x] 1.1.7 Initialize OpenSpec in repo: `openspec init --tools opencode` — verify `openspec/` and `.opencode/` exist
- [ ] 1.1.8 Configure Playwright (`playwright.config.ts`): video on, screenshot on failure + key validation points, trace on retry — verify `npx playwright --version`

### 1.2 TF.js Integration & Memory Layer
- [x] 1.2.1 Install `@tensorflow/tfjs`, `@tensorflow/tfjs-vis` — verify `npm ls @tensorflow/tfjs`
- [x] 1.2.2 Create `TfjsInitService` registered with `provideAppInitializer`: backend selection webgpu→webgl→cpu, log selected backend — verify console shows backend on app start
- [x] 1.2.3 Create `TFJS_TOKEN` injection token for `tf` instance — verify component can inject and use `tf`
- [x] 1.2.4 Create `TfjsMemoryService`: `tidy()`, `track()`, `disposeAll()`, `getMemorySnapshot()`, `watchMemory(budget, onWarn, onCritical)` — verify unit tests: tensor creation/disposal cycle leaks 0 tensors
- [x] 1.2.5 Create `TensorSerializerService`: `serialize(tensor)` → `{ shape, dtype, values[], stats }`, `serializeModel(model)` — verify serialization matches tensor values for rank 1-3 tensors
- [x] 1.2.6 Create demo page "TF.js Status" showing backend, memory, test tensor ops — verify page renders at `/tfjs-status` route

### 1.3 Design System & UI Primitives
- [x] 1.3.1 Install Tailwind CSS 4.x: `npm install -D tailwindcss@4 @tailwindcss/postcss postcss` — verify `npx tailwindcss --version`
- [x] 1.3.2 Configure `styles.css` with CSS variables for theming (light/dark) and `@import "tailwindcss"` — verify dark/light mode works via `data-theme`
- [x] 1.3.3 Implement `core/ui` primitives: Button, Card, Panel, Badge, Tooltip, Modal, Tabs, ProgressRing, CodeBlock, CopyButton — verify Storybook/visual regression for each
- [x] 1.3.4 Create `ThemeService`: persists preference, toggles `data-theme` on `<html>` — verify theme persists across refresh
- [x] 1.3.5 Create `FocusTrapDirective`, `LiveRegionService`, `ReducedMotionMixin` — verify axe-core passes on modal, live region announces
- [ ] 1.3.6 Run accessibility audit baseline: `npm run test:a11y` — verify 0 violations AA

### 1.4 Routing, Layout, Progress Persistence
- [x] 1.4.1 Create `app.routes.ts` with lazy routes for all sections (hash location preserved) — verify `npm run start` loads routes
- [x] 1.4.2 Create `App` + `MainLayoutComponent` (header, nav, router-outlet) — verify navigation renders
- [x] 1.4.3 Create `JourneyComponent` (static 16 labs), `CatalogComponent`, `GlossaryComponent`, `ProgressComponent`, `SettingsComponent` — verify all routes accessible
- [x] 1.4.4 Create `ProgressService` (signal-based) + `LocalStorageService` (debounced 500ms, key `neural-lab:v1:progress`) — verify progress persists across refresh
- [x] 1.4.5 Create `ProgressMigrator` v1 schema — verify migration handles version bump
- [x] 1.4.6 Implement Export/Import progress JSON — verify roundtrip: export → clear localStorage → import → progress restored

## 2. Phase 1 — Lab Infrastructure (Weeks 3-4)

### 2.1 Lab Shell & Runtime
- [x] 2.1.1 Create `LabShellComponent`: header (title, progress ring, panel toggle), sidebar (stage navigator), main (stage content), panel (under the hood) — verify shell renders with empty lab
- [x] 2.1.2 Create `StageRendererComponent`: dynamic component loader via `ComponentRegistry` — verify renders stage component from config
- [x] 2.1.3 Create `StageNavigatorComponent`: shows all 10 stages with completion status, click navigation — verify completed stages clickable, future locked
- [x] 2.1.4 Create `LabRuntimeService` (provided in the lab's route providers): `tf`, `tidy()`, `track()`, `createTensor()`, `getSnapshot()`, `set/getExperimentState()`, `dispose()` — verify tensors disposed on component destroy
- [x] 2.1.5 Create `ComponentRegistry` (Map<string, ComponentType>) — verify resolves registered components
- [x] 2.1.6 Create `VisualizationRegistry` (Map<string, ComponentType>) — verify resolves viz components
- [x] 2.1.7 Create `UnderTheHoodPanelComponent` + `CodeGeneratorService` — verify panel shows tensor data, code copy works
- [x] 2.1.8 Configure route `/lab/:slug` → loads lab feature routes, renders shell — verify lazy loading works, previous lab disposed

### 2.2 Stage Base Components
- [x] 2.2.1 Create `MarkdownStageComponent` (renders markdown with frontmatter) — verify renders markdown correctly
- [x] 2.2.2 Create `ConceptCardStageComponent` (reads from concept registry) — verify displays concept definition
- [x] 2.2.3 Create `VisualizationStageComponent` (wraps registry viz) — verify renders visualization from config
- [x] 2.2.4 Create `ExperimentStageComponent`: reactive form from params, debounced `experimentFn` (150ms), live viz update — verify parameter changes update visualization
- [x] 2.2.5 Create `ChallengeStageComponent`: validation types (parameter-match, tensor-value, multiple-choice) — verify validation passes/fails correctly
- [x] 2.2.6 Create `CodeViewStageComponent`: view modes (essential/annotated/full), copy button — verify code displays in all modes, copy works
- [x] 2.2.7 Implement stage completion tracking + `stageComplete` emission — verify stage marks complete, progress updates

### 2.3 Visualization Engine (Core Set)
- [ ] 2.3.1 Create `TensorGridComponent`: rank 1-3, slice selector, value tooltip, responsive — verify visual regression test passes
- [x] 2.3.2 Create `MatrixHeatmapComponent`: color scale, labels, hover values — verify renders matrix correctly
- [x] 2.3.3 Create `LineChartComponent` (Chart.js): multi-series, epoch animation, tooltip — verify chart updates on data change
- [x] 2.3.4 Create `ScatterPlotComponent`: classes, decision boundary overlay, hover details — verify decision boundary renders
- [x] 2.3.5 Create `ActivationCurveComponent`: 4 functions, adjustable x-range, derivative toggle — verify curves match mathematical functions
- [x] 2.3.6 Create `MemoryTimelineComponent`: snapshots, markers, hover stats — verify timeline shows memory events
- [ ] 2.3.7 Ensure all visualizations: data table alternative, color-blind patterns, reduced motion — verify axe-core passes, reduced motion works

### 2.4 Content Schema & Validation
- [x] 2.4.1 Define Zod schemas in `domain/content`: `LaboratoryConfig`, `StageConfig`, `ExperimentConfig`, `ChallengeValidation`, `VisualizationConfig`, `Concept` — verify TypeScript types generated
- [x] 2.4.2 Create TypeScript configs for all 16 labs in `src/app/educational-content/lab-configs/` (stubs with stages) — verify imports work
- [x] 2.4.3 Create `scripts/validate-content.mjs` (Node script, `npm run validate:content`): validates all configs at build — verify it fails on an invalid config
- [x] 2.4.4 Integrate content validation in CI — verify build fails on invalid lab config

## 3. Phase 2 — Core Labs: Tensors & Operations (Weeks 5-8)

### 3.1 Lab 1: Tensor Fundamentals
- [x] 3.1.1 Create `lab-01-tensors` lazy feature with config — verify it loads at `/lab/01-fundamentos-de-tensores`
- [x] 3.1.2 Implement stages: contextualização, conceito, analogia, exemplo-visual (tensor-grid: temperatures), demonstração, experimentação (create tensors), desafio (match shape), explicação, código, resumo — verify all stages render
- [x] 3.1.3 Register concepts: tensor, scalar, vector, matrix, rank, shape, size, dtype — verify concepts appear in glossary
- [x] 3.1.4 Implement experiment: create tensor from array, inspect shape/rank/dtype — verify tensor created, displayed in panel
- [x] 3.1.5 Validate complete lab flow: progress saved, all stages functional — verify lab marked complete in journey

### 3.2 Lab 2: Tensor Manipulation
- [x] 3.2.1 Create `lab-02-manipulation` lazy feature — verify route works
- [x] 3.2.2 Implement reshape, flatten, expandDims, squeeze experiments — verify operations produce correct shapes
- [x] 3.2.3 Experiment: reshape temperature tensor for weekly/monthly views — verify reshaped data displayed
- [x] 3.2.4 Challenge: transform (3,4,5) → (5,3,4) using allowed ops — verify challenge validates correct solution

### 3.3 Lab 3: Element-wise Operations
- [x] 3.3.1 Create `lab-03-elementwise` lazy feature — verify route works
- [x] 3.3.2 Implement add, sub, mul, div, pow, sqrt experiments — verify operations correct
- [x] 3.3.3 Experiment: recipe costs (ingredient vectors × price vectors) — verify broadcasting works implicitly
- [x] 3.3.4 Visualization: tensor-grid showing before/after — verify grid displays correctly
- [x] 3.3.5 Challenge: compute total cost per recipe — verify challenge validates

### 3.4 Lab 4: Reduction Operations
- [x] 3.4.1 Create `lab-04-reductions` lazy feature — verify route works
- [x] 3.4.2 Implement sum, mean, min, max along axes — verify axis parameter works (0 vs 1 vs -1)
- [x] 3.4.3 Experiment: temperature statistics (avg per city, max per day) — verify stats correct
- [x] 3.4.4 Visualization: line-chart (daily avg), heatmap (city×day) — verify charts render
- [x] 3.4.5 Challenge: find city with highest temp variance — verify challenge validates

### 3.5 Lab 5: Matrix Operations
- [x] 3.5.1 Create `lab-05-matrix` lazy feature — verify route works
- [x] 3.5.2 Implement transpose, matMul — verify matMul shape rules enforced
- [x] 3.5.3 Experiment: product quantities (3×5) — prices (5×1) = costs (3×1) — verify result correct
- [x] 3.5.4 Visualization: matrix-heatmap for each matrix, network-graph for matMul — verify visualizations render
- [x] 3.5.5 Challenge: compute revenue for different price scenarios — verify challenge validated

### 3.6 Lab 6: Broadcasting
- [x] 3.6.1 Create `lab-06-broadcasting` lazy feature — verify route works
- [x] 3.6.2 Implement broadcasting rules, compatible shapes, implicit expansion — verify shape alignment correct
- [x] 3.6.3 Experiment: Celsius → Fahrenheit for multiple cities (vector + scalar, matrix + vector) — verify conversion correct
- [x] 3.6.4 Visualization: step-by-step broadcast animation (shape alignment) — verify animation shows broadcasting
- [x] 3.6.5 Challenge: predict output shape for 5 broadcast scenarios — verify challenge covers edge cases

### 3.7 Lab 7: Applied Linear Algebra
- [x] 3.7.1 Create `lab-07-linear-algebra` lazy feature — verify route works
- [x] 3.7.2 Implement vectors, dot product, linear transformations — verify math correct
- [x] 3.7.3 Experiment: 2D points → rotation/scaling matrices → transformed points — verify geometric transformation correct
- [x] 3.7.4 Visualization: scatter-plot with before/after, transformation matrix display — verify plot shows transformation
- [x] 3.7.5 Challenge: find transformation matrix that maps set A to set B — verify challenge validates

## 4. Phase 3 — ML Fundamentals & Regression (Weeks 9-12)

### 4.1 Lab 8: ML Fundamentals
- [x] 4.1.1 Create `lab-08-ml-fundamentals` lazy feature — verify route works
- [x] 4.1.2 Implement dataset, features, labels, train/val split, loss, epoch, batch, lr — verify concepts registered
- [x] 4.1.3 Experiment: explore housing dataset (features, distributions, correlations) — verify dataset loads
- [x] 4.1.4 Visualization: scatter-plot matrix, correlation heatmap — verify charts render
- [x] 4.1.5 Challenge: identify which feature correlates most with price — verify challenge validates

### 4.2 Lab 9: Linear Regression
- [x] 4.2.1 Create `lab-09-linear-regression` lazy feature — verify route works
- [x] 4.2.2 Implement y = wx + b, MSE, fitting, prediction — verify math correct
- [x] 4.2.3 Experiment: interactive line fit (adjust w, b sliders → see MSE) — verify MSE updates live
- [x] 4.2.4 Visualization: scatter-plot with regression line, MSE curve — verify line fits data
- [x] 4.2.5 "Under the hood": shows gradient computation for MSE — verify panel shows gradients
- [x] 4.2.6 Challenge: find w,b that achieve MSE < threshold — verify challenge validates

### 4.3 Lab 10: Gradient Descent
- [x] 4.3.1 Create `lab-10-gradient-descent` lazy feature — verify route works
- [x] 4.3.2 Implement cost surface, gradient, lr, convergence, divergence — verify concepts correct
- [x] 4.3.3 Experiment: 3D cost surface (MSE bowl) + ball rolling down (adjustable LR) — verify LR presets work
- [x] 4.3.4 Visualization: line-chart (loss per epoch), 2D contour with trajectory — verify charts animate
- [x] 4.3.5 Training in worker, streams metrics — verify worker communicates, UI responsive
- [x] 4.3.6 Challenge: find LR that converges in < 50 epochs without overshoot — verify challenge validates

## 5. Phase 4 — Neurons, Activations & Networks (Weeks 13-18)

### 5.1 Lab 11: The Neuron
- [x] 5.1.1 Create `lab-11-neuron` lazy feature — verify route works
- [x] 5.1.2 Implement inputs, weights, bias, weighted sum, activation, output — verify neuron math correct
- [x] 5.1.3 Experiment: single neuron classifying 2D points (adjust w1, w2, b → see decision line) — verify decision boundary updates
- [x] 5.1.4 Visualization: network-graph (1 neuron), decision-boundary (line), activation-curve — verify all render
- [x] 5.1.5 "Under the hood": shows weighted sum + activation step by step — verify panel shows steps
- [x] 5.1.6 Challenge: find weights that separate two clusters — verify challenge validates

### 5.2 Lab 12: Activation Functions
- [x] 5.2.1 Create `lab-12-activations` lazy feature — verify route works
- [x] 5.2.2 Implement Sigmoid, ReLU, Tanh, Softmax — verify formulas correct
- [x] 5.2.3 Experiment: interactive curve (drag x → see y, derivative, saturation zones) — verify derivative matches
- [x] 5.2.4 Visualization: activation-curve (all 4 overlay), derivative toggle — verify overlay works
- [x] 5.2.5 "Under the hood": shows derivative formulas, vanishing gradient demo — verify panel shows math
- [x] 5.2.6 Challenge: match activation to use case — verify challenge validates

### 5.3 Lab 13: Neural Networks
- [x] 5.3.1 Create `lab-13-neural-networks` lazy feature — verify route works
- [x] 5.3.2 Implement layers, forward prop, loss, backprop, training loop — verify training converges
- [x] 5.3.3 Experiment: build network (layers/neurons/activations) → train on spiral/moons — verify network trains
- [x] 5.3.4 Visualization: decision-boundary animation (epochs), loss/accuracy charts, network-graph with weight magnitudes — verify animation smooth
- [x] 5.3.5 Training in worker, streams metrics — verify worker communication, memory stable
- [x] 5.3.6 "Under the hood": shows one backprop step (gradients for 2-layer net) — verify panel shows gradients
- [x] 5.3.7 Challenge: achieve > 90% accuracy on moons with < 3 hidden layers — verify challenge validates

### 5.4 Lab 14: Classification & Decision Boundaries
- [x] 5.4.1 Create `lab-14-classification` lazy feature — verify route works
- [x] 5.4.2 Implement binary/multi-class, decision boundary, XOR — verify XOR fails with 0 hidden layers
- [x] 5.4.3 Experiment: toggle XOR dataset → see linear fail → add hidden layer → see success — verify XOR solved
- [x] 5.4.4 Visualization: decision-boundary (evolution slider), confusion matrix, class distribution — verify all render
- [x] 5.4.5 Multi-class: softmax output, one-hot labels — verify softmax works
- [x] 5.4.6 Challenge: design network that solves XOR (min neurons/layers) — verify challenge validates

## 6. Phase 5 — Images & Memory (Weeks 19-22)

### 6.1 Lab 15: Images as Tensors
- [ ] 6.1.1 Create `lab-15-images` lazy feature — verify route works
- [ ] 6.1.2 Implement image → pixels → tensor, shape, RGB, grayscale, resize, normalize — verify tensor shapes correct
- [ ] 6.1.3 Experiment: upload image → see tensor (3×H×W), grayscale (1×H×W), resize (224×224), normalize [0,1] — verify upload works
- [ ] 6.1.4 Visualization: image-tensor (original + tensor slices side-by-side), channel toggle — verify visualization renders
- [ ] 6.1.5 "Under the hood": shows `tf.browser.fromPixels`, `tf.image.resizeBilinear`, div/255 — verify panel shows ops
- [ ] 6.1.6 Challenge: preprocess image for MobileNet input (224×224×3, [-1,1]) — verify challenge validates

### 6.2 Lab 16: Memory Management
- [ ] 6.2.1 Create `lab-16-memory` lazy feature — verify route works
- [ ] 6.2.2 Implement tf.memory(), tf.dispose(), tf.tidy(), leaks, best practices — verify concepts registered
- [ ] 6.2.3 Experiment: leak demo (create tensors in loop without dispose) → memory rises → fix with tidy — verify leak detected, fix works
- [ ] 6.2.4 Visualization: memory-timeline (live), leak vs fixed comparison — verify timeline shows leak
- [ ] 6.2.5 "Under the hood": shows memory before/after each operation — verify panel shows memory
- [ ] 6.2.6 Challenge: refactor leaky code to use tidy (code-output validation) — verify challenge validates

## 7. Phase 6 — Polish & Integration (Weeks 23-26)

### 7.1 Glossary & Concept Integration
- [ ] 7.1.1 Create `features/glossary`: page, search, detail view, inline modal — verify glossary page works
- [ ] 7.1.2 Populate concept registry from all labs (40+ concepts) — verify all concepts linked
- [ ] 7.1.3 Implement inline glossary links in lab content (markdown → linkify) — verify links work in labs
- [ ] 7.1.4 Add cross-references: "Ver também", "Pré-requisito", "Reforçado em" — verify cross-refs appear

### 7.2 Progress Dashboard & Analytics
- [ ] 7.2.1 Create `ProgressComponent`: overall %, radar chart (12 concepts), per-lab detail — verify dashboard renders
- [ ] 7.2.2 Implement analytics events: lab-started, stage-completed, challenge-passed, etc. — verify events recorded
- [ ] 7.2.3 Local analytics view: "Seu aprendizado" (time, streak, struggle points) — verify view shows data
- [ ] 7.2.4 Export includes analytics (opt-in) — verify export JSON contains analytics

### 7.3 Accessibility & Performance Audit
- [ ] 7.3.1 Run full axe-core audit — verify 0 violations AA
- [ ] 7.3.2 Keyboard testing all flows — verify tab order, focus management
- [ ] 7.3.3 Screen reader testing (NVDA/VoiceOver) — verify announcements work
- [ ] 7.3.4 Lighthouse audit: Performance > 90, Accessibility > 95, Best Practices > 90 — verify scores
- [ ] 7.3.5 Bundle analysis: budgets met (initial < 500KB, lab chunks < 100KB) - verify `npm run build` enforces Angular budgets
- [ ] 7.3.6 Memory stress test: 30 min session, no leaks — verify `tf.memory()` stable
- [ ] 7.3.7 Document results in `AUDIT_RESULTS.md` — verify file exists

### 7.4 Documentation & Release Prep
- [ ] 7.4.1 Write `README.md`: project overview, quick start, architecture summary — verify renders on GitHub
- [ ] 7.4.2 Write `docs/architecture.md` from technical-architecture spec — verify complete
- [ ] 7.4.3 Write `docs/learning-path.md` from learning-journey spec — verify complete
- [ ] 7.4.4 Write `docs/labs/` one page per lab (concepts, stages, experiment guide) — verify 16 pages exist
- [ ] 7.4.5 Write `docs/tensorflow-concepts.md` — verify TF.js API reference complete
- [ ] 7.4.6 Write `docs/mathematical-concepts.md` — verify math background complete
- [ ] 7.4.7 Write `docs/development-guide.md` — verify adding labs documented
- [ ] 7.4.8 Write `docs/testing-guide.md` — verify test strategies documented
- [ ] 7.4.9 Write `docs/contribution-guide.md` — verify contribution process documented
- [ ] 7.4.10 Configure GitHub Pages deploy, version tag, changelog — verify deploy works

## 8. Phase 7 — V2 Preparation (Post-V1 Release)

### 8.1 Challenge Infrastructure Spike
- [ ] 8.1.1 Implement Challenge 1 (Food Cost Prediction) using V1 infrastructure — verify challenge works
- [ ] 8.1.2 Validate: no breaking changes to labs, reuse > 80% components — verify reuse metrics
- [ ] 8.1.3 Document required extensions to `LaboratoryConfig`, new services, new components — verify design doc

### 8.2 Challenge Architecture Decision
- [ ] 8.2.1 Decision: proceed with current architecture / refactor needed — verify decision recorded
- [ ] 8.2.2 Update OpenSpec with `challenge-architecture` modifications — verify specs updated
- [ ] 8.2.3 Create V2 roadmap — verify roadmap created

## 9. Verification & Acceptance

### 9.1 Playwright E2E Test Suite Setup
- [ ] 9.1.1 Create Playwright test project structure: `e2e/` folder with page objects for Journey, Lab, Catalog, Glossary, Progress, Settings — verify page objects compile
- [ ] 9.1.2 Implement core E2E tests: complete Lab 1 (tensors), complete Lab 9 (regression), export/import progress, dark/light theme toggle, reduced motion, keyboard navigation, accessibility audit (axe-playwright) — verify all tests pass
- [ ] 9.1.3 Implement lab-specific E2E tests for each of 16 labs: stage navigation, experiment interaction, challenge validation, "Under the Hood" panel, progress persistence — verify all 16 lab test suites pass
- [ ] 9.1.4 Configure Playwright to generate videos for all test runs: `video: 'on'` — verify videos saved to `test-results/videos/`
- [ ] 9.1.5 Configure Playwright to capture screenshots on failure and at key validation points: `screenshot: 'only-on-failure'` + manual `page.screenshot()` calls — verify screenshots saved to `test-results/screenshots/`
- [ ] 9.1.6 Configure CI to upload Playwright artifacts (videos, screenshots, traces) — verify GitHub Actions uploads artifacts
- [ ] 9.1.7 Establish gate: no task considered complete until corresponding Playwright tests pass — verify CI fails on test failure

### 9.2 End-to-End Validation
- [ ] 9.2.1 Complete full journey: Labs 1-16 via Playwright — verify all labs completable, videos generated
- [ ] 9.2.2 Verify progress export/import roundtrip via Playwright — verify data integrity, screenshots captured
- [ ] 9.2.3 Verify dark/light theme, reduced motion, keyboard-only navigation via Playwright — verify all work, videos generated
- [ ] 9.2.4 Verify production build deploys to GitHub Pages via Playwright — verify live site works, screenshots captured
- [ ] 9.2.5 Product owner acceptance with Playwright artifact review — verify sign-off recorded with video/screenshot evidence



