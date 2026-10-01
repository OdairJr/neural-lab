# Technical Architecture Specification

## Purpose
Define the Angular/TensorFlow.js technical architecture, module boundaries, data flow, and infrastructure decisions for Neural Lab.

## Requirements

### Requirement: Workspace Structure
The system SHALL use the existing Angular CLI application with a layered folder structure inside `src/app`.

#### Scenario: Workspace layout
- **WHEN** the project is organized
- **THEN** structure:
```
src/
├── app/
│   ├── core/                # Shared utilities, types, guards (leaf layer)
│   │   ├── data/            # LocalStorage, progress persistence
│   │   ├── tfjs/            # TF.js initialization, memory management, wrappers
│   │   ├── ui/              # Design system components (Button, Card, Panel, etc.)
│   │   └── utils/           # Pure functions, validators, formatters
│   ├── domain/              # Domain models, content schemas, progress aggregates
│   │   ├── models/          # Laboratory, Stage, Concept, Experiment, Challenge types
│   │   ├── content/         # Content schema validation (Zod), type guards
│   │   └── progress/        # Progress aggregate, signals, selectors
│   ├── shared/              # Reusable presentational building blocks
│   │   ├── visualizations/  # Visualization components (tensor-grid, matrix-heatmap, etc.)
│   │   ├── experiments/     # Experiment components (parameter controls, live preview)
│   │   ├── challenges/      # Challenge components (validation, hints, feedback)
│   │   └── code-view/       # "Under the hood" code display components
│   ├── features/            # Feature areas
│   │   ├── journey/         # Learning path, catalog, progress dashboard
│   │   ├── lab-shell/       # Lab layout, stage navigator, "under the hood" panel
│   │   ├── glossary/        # Glossary feature
│   │   ├── settings/        # Settings feature
│   │   └── labs/            # Individual lab features (lazy loaded, routed)
│   │       ├── lab-01-tensors/
│   │       ├── lab-02-manipulation/
│   │       └── ... (up to lab-16-memory)
│   ├── educational-content/ # Declarative lab content configs (TypeScript consts)
│   │   ├── lab-configs/     # Lab configs index + individual lab configs
│   │   └── concepts/        # Concept definitions
│   ├── app.config.ts        # Application providers (router, TF.js init)
│   ├── app.routes.ts        # Top-level routes
│   └── app.ts               # Root standalone component
├── main.ts
└── styles.css
scripts/
└── validate-content.mjs     # Build-time content validation (Node script)
```

#### Scenario: Path aliases
- **WHEN** code imports across layers
- **THEN** `tsconfig.json` defines path aliases:
  - `@core/*` → `src/app/core/*`
  - `@domain/*` → `src/app/domain/*`
  - `@shared/*` → `src/app/shared/*`
  - `@features/*` → `src/app/features/*`
  - `@content/*` → `src/app/educational-content/*`

#### Scenario: Layer dependency rules
- **WHEN** lint enforces dependencies
- **THEN** rules:
  - `app` (root/app.routes) → can import from any layer
  - `features/*` → can import from `core/*`, `domain/*`, `shared/*`, `educational-content/*`
  - `shared/*` → can import from `core/*`, `domain/*` only
  - `domain/*` → can import from `core/*` only
  - `core/*` → no internal layer imports (leaf)
  - `educational-content/*` → no imports (pure data)
- **AND** enforced via ESLint `no-restricted-imports` patterns in the project's flat `eslint.config.js`

### Requirement: Angular Application Architecture
The system SHALL use Angular 22+ with standalone components, signals, and modern patterns.

#### Scenario: App bootstrap
- **WHEN** app starts
- **THEN** `main.ts` calls `bootstrapApplication(App, appConfig)` (standalone)
- **AND** `appConfig` providers: `provideBrowserGlobalErrorListeners`, `provideRouter(routes, withHashLocation())`, and app initializers; change detection stays zoneless (the project's current strategy) — do not add `provideZoneChangeDetection`
- **AND** TF.js initialization uses `provideAppInitializer`: sets backend priority (webgpu → webgl → cpu), registers custom ops if needed
- **AND** hash location is preserved because the app is deployed as a static GitHub Pages project site

#### Scenario: Routing & Lazy Loading
- **WHEN** router configures
- **THEN** `app.routes.ts` defines routes with `loadComponent`/`loadChildren` for lazy loading
- **AND** each lab: `loadChildren: () => import('@features/labs/lab-01-tensors/lab-01-tensors.routes').then(m => m.LAB_01_TENSORS_ROUTES)`
- **AND** `LabShellComponent` wraps lazy lab content (provides layout, stage navigator, panel)

#### Scenario: Signals for State
- **WHEN** components manage state
- **THEN** use Angular `signal()`, `computed()`, `effect()` for local state
- **AND** global progress: `signal<ProgressState>()` in `ProgressService` (provided in root)
- **AND** lab runtime: `signal<LabRuntimeState>()` in `LabRuntimeService` (provided by the lab's route providers)

### Requirement: TensorFlow.js Integration Layer
The system SHALL provide a robust TF.js abstraction layer.

#### Scenario: TF.js Initialization
- **WHEN** app initializes
- **THEN** `TfjsInitService` registered via `provideAppInitializer`:
  - Awaits `tf.ready()`
  - Sets backend: `await tf.setBackend('webgpu')` → fallback `webgl` → fallback `cpu`
  - Logs selected backend, WebGL version, memory info
  - Exposes `tf` via injection token `TFJS_TOKEN` for testing/mocking

#### Scenario: Memory Management Utilities
- **WHEN** lab code uses tensors
- **THEN** they use `TfjsMemoryService`:
  - `tidy<T>(fn: () => T): T` — wrapper around `tf.tidy` with logging
  - `track(tensor: tf.Tensor, label: string): tf.Tensor` — registers for auto-disposal
  - `disposeAll(trackedOnly = true): void` — disposes tracked tensors
  - `getMemorySnapshot(): MemorySnapshot` — returns current `tf.memory()`
  - `watchMemory(budgetMB: number, onWarning: () => void, onCritical: () => void): Subscription`

#### Scenario: Tensor Serialization for "Under the Hood"
- **WHEN** panel needs tensor data
- **THEN** `TensorSerializerService`:
  - `serialize(tensor: tf.Tensor): TensorSnapshot` — returns `{ shape, dtype, values: number[], stats: { min, max, mean, std } }`
  - `serializeModel(model: tf.LayersModel): ModelSnapshot`
  - Handles large tensors: samples first N elements + stats
  - Runs in `tf.tidy` to avoid leaks

#### Scenario: Web Worker for Training
- **WHEN** lab runs training (epochs > 1)
- **THEN** `TrainingWorkerService`:
  - Spawns `Worker` with `tfjs` bundle
  - Communicates via `postMessage`: `{ type: 'train', config, data }` → `{ type: 'epoch', metrics, weights }`
  - Main thread updates charts via signals
  - Worker calls `tf.dispose()` on tensors each epoch
  - Falls back to main thread if Worker unsupported

### Requirement: Visualization Engine
The system SHALL provide a pluggable visualization system.

#### Scenario: Visualization Registry
- **WHEN** app starts
- **THEN** `VisualizationRegistry` (Map<string, VisualizationComponent>) registers:
  - `tensor-grid` → `TensorGridComponent`
  - `tensor-3d` → `Tensor3dComponent` (Three.js/WebGL)
  - `matrix-heatmap` → `MatrixHeatmapComponent`
  - `line-chart` → `LineChartComponent` (Chart.js)
  - `scatter-plot` → `ScatterPlotComponent` (Chart.js/Canvas)
  - `decision-boundary` → `DecisionBoundaryComponent` (Canvas)
  - `activation-curve` → `ActivationCurveComponent` (Canvas)
  - `memory-timeline` → `MemoryTimelineComponent` (Chart.js)
  - `image-tensor` → `ImageTensorComponent` (Canvas)
  - `network-graph` → `NetworkGraphComponent` (D3/Canvas)

#### Scenario: Visualization Contract
- **WHEN** a visualization component is created
- **THEN** it implements `VisualizationComponent` interface:
  - `@Input() config: VisualizationConfig`
  - `@Input() data: VisualizationData` (tensors, metrics, etc.)
  - `@Output() interaction = new EventEmitter<InteractionEvent>()`
  - `ngOnChanges()` — re-renders on data/config change
  - `ngOnDestroy()` — disposes WebGL contexts, Chart.js instances

### Requirement: Content Loading & Validation
The system SHALL load and validate educational content at build time and runtime.

#### Scenario: Build-time validation
- **WHEN** `npm run validate:content` runs (wired into the build/CI)
- **THEN** `scripts/validate-content.mjs`:
  - Imports all lab configs from `educational-content`
  - Validates against Zod schemas (from `domain/content`)
  - Checks: all referenced concepts exist, stage components registered, no circular prerequisites
  - Fails with a non-zero exit code on errors; warns on missing optional fields

#### Scenario: Runtime content access
- **WHEN** lab feature loads
- **THEN** it imports its config: `import { lab01Config } from '@content/lab-configs/lab-01-tensors'`
- **AND** `LabShellComponent` receives config via the `LAB_CONFIG` injection token
- **AND** config is typed as `LaboratoryConfig` (from `@domain/models`)

### Requirement: State Persistence (localStorage)
The system SHALL persist progress reliably.

#### Scenario: Storage Service
- **WHEN** `ProgressService` mutates state
- **THEN** `LocalStorageService`:
  - Key: `neural-lab:v1:progress`
  - Serializes via `JSON.stringify` with custom replacer for `tf.Tensor` (excluded)
  - Debounced write: `setTimeout(() => save(), 500)` coalesced
  - Reads on service init; migrates via `ProgressMigrator` (versioned)

#### Scenario: Storage Quota Management
- **WHEN** localStorage near quota
- **THEN** service: removes oldest `analytics` events beyond 1000 entries
- **AND** compresses `experimentStates` (removes verbose tensor snapshots)
- **AND** warns user if still > 4.5MB

### Requirement: Theming & Styling
The system SHALL use Tailwind CSS 4.x with CSS variables for theming.

#### Scenario: Theme implementation
- **WHEN** styles load
- **THEN** `styles.css` defines CSS custom properties:
  - `--color-primary`, `--color-bg`, `--color-surface`, `--color-text`, `--color-border`
  - `--radius`, `--spacing`, `--font-sans`, `--font-mono`
  - Dark mode: `@media (prefers-color-scheme: dark)` overrides
- **AND** Tailwind `theme` extends these variables
- **AND** `ThemeService` toggles `data-theme="dark"` on `<html>` for manual override

### Requirement: Accessibility Foundation
The system SHALL implement accessibility at the framework level.

#### Scenario: A11y primitives
- **WHEN** `core/ui` components built
- **THEN** they include: `aria-*` attributes, keyboard navigation, focus management, `prefers-reduced-motion` media query handling
- **AND** `FocusTrapDirective` for modals/panels
- **AND** `LiveRegionService` for announcements (stage complete, challenge result)
- **AND** Chart visualizations provide: data table alternative, pattern fills for color-blind, text descriptions

### Requirement: Testing Strategy
The system SHALL define test layers and tools with Playwright for E2E validation.

#### Scenario: Test pyramid
- **Unit** (Vitest): pure functions, services, reducers, validators, serializers — target 80% coverage
- **Component** (Angular Testing + Vitest): standalone components with TestBed — critical paths
- **Integration** (Playwright): key user flows (complete lab, challenge, progress persist)
- **E2E** (Playwright): full journey: start → complete 3 labs → check progress
- **AND** all E2E tests generate video recordings and screenshots on failure
- **AND** videos saved to `test-results/videos/`, screenshots to `test-results/screenshots/`
- **AND** test execution must pass for task to be considered complete

#### Scenario: TF.js Testing
- **WHEN** testing TF.js code
- **THEN** use the browser `@tensorflow/tfjs` package under the Angular unit-test runner (Vitest) — do not depend on `@tensorflow/tfjs-node`
- **AND** make math tests deterministic with fixed seeds and the CPU backend
- **AND** mock `TFJS_TOKEN` for component tests (returns mock tensors)
- **AND** visual regression for visualizations (Playwright screenshot comparison)

### Requirement: Build & Deployment
The system SHALL support production builds and static hosting.

#### Scenario: Build configuration
- **WHEN** `npm run build` runs (`ng build --configuration production`)
- **THEN** output: `dist/neural-lab/browser/` (static files)
- **AND** optimizations: the Angular application builder (ESBuild), tree-shaking, code splitting by route, TF.js kept in its own chunk (cached)
- **AND** deployed to GitHub Pages as a project site using `--base-href /neural-lab/` and hash routing (`withHashLocation()`)
- **AND** no Service Worker / offline support in V1
- **AND** also deployable to any other static host

#### Scenario: Bundle Budget
- **WHEN** budgets enforced
- **THEN** initial < 500KB gzipped (excluding TF.js)
- **AND** TF.js ~200KB gzipped (separate chunk)
- **AND** lazy lab chunks < 100KB each