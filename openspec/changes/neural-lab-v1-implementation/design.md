# Design

## Context

See proposal.md for motivation. Current state: an Angular CLI 22 application (standalone components + signals, Vitest via `ng test`, Playwright) plus 9 OpenSpec specifications defining product vision, learning journey, information architecture, domain model, technical architecture, laboratory architecture, challenge architecture (V2 prep), requirements, and roadmap.

**Key constraints from specs:**
- 16 labs with strict pedagogical progression
- TensorFlow.js 4.x with WebGPU/WebGL/CPU backends
- Tailwind CSS 4.x for styling (CSS variables theming)
- localStorage-only persistence (no backend V1)
- WCAG 2.1 AA accessibility required
- Performance budgets: initial < 500KB gzipped, lab chunks < 100KB
- Content-first: declarative TypeScript configs validated at build
- All implementation MUST consult MCP Context7 for current library documentation

## Goals / Non-Goals

**Goals:**
- Implement complete V1 platform per all 9 specs
- Achieve zero-delta between specs and implementation behavior
- Establish extensible architecture for V2 Challenges
- Meet all performance, accessibility, and quality gates

**Non-Goals:**
- Backend/API development (V2)
- Challenge system implementation (V2 prep only)
- Mobile-first responsive (desktop-first, responsive after)
- Internationalization beyond PT-BR string externalization
- Service Worker / offline support (V2)

## Decisions

### 1. Angular CLI Layered Folders & Module Boundaries
**Decision**: Layered folders under `src/app/` (`core` → `domain` → `shared` → `features`), with path aliases in `tsconfig.json` and dependency rules enforced by ESLint `no-restricted-imports`.

**Rationale**: 
- Keeps the existing Angular CLI workspace instead of introducing an Nx monorepo (matches README/AGENTS)
- Clear separation: `core` (leaf) → `domain` → `shared` → `features` → app
- Prevents circular deps and architectural drift without extra tooling

**Alternatives considered**: 
- Nx monorepo (rejected: the repo is a single Angular CLI app; Nx would add unnecessary tooling)
- Unstructured `src/app` (rejected: no boundary enforcement)

### 2. Angular Architecture: Standalone + Signals
**Decision**: Pure standalone components, `signal()`/`computed()`/`effect()` for state, no NgRx/NgRx Signals.

**Rationale**:
- Angular 22+ optimized for standalone + signals
- Local lab state doesn't need global store complexity
- `ProgressService` as root signal sufficient for cross-cutting progress
- Reduces boilerplate and bundle size

**Alternatives considered**:
- NgRx (rejected: overkill for V1 scope)
- RxJS BehaviorSubject services (rejected: signals simpler for sync UI state)

### 3. TensorFlow.js Integration Strategy
**Decision**: 
- `TFJS_TOKEN` injection token for `tf` instance (testable, mockable)
- `TfjsInitService` registered with `provideAppInitializer` with backend priority: webgpu → webgl → cpu
- `TfjsMemoryService` wraps all tensor ops: `tidy()`, `track()`, `disposeAll()`, `watchMemory()`
- `TrainingWorkerService` for multi-epoch training (Web Worker with TF.js bundle)
- `TensorSerializerService` for "Under the Hood" panel data

**Rationale**:
- Centralized TF.js access enables testing and backend switching
- Memory management is critical for long sessions → framework-enforced `tidy`
- Training must not block UI → Worker mandatory for epochs > 1
- Serialization needed for panel accuracy

**Alternatives considered**:
- Direct `import * as tf` everywhere (rejected: untestable, no memory tracking)
- Main-thread training with `setTimeout` yielding (rejected: still blocks, poor UX)

### 4. Lab Architecture: Lazy Features + Shell
**Decision**: Each lab = lazy-loaded standalone feature (`loadChildren`), wrapped by universal `LabShellComponent`.

**Rationale**:
- Code splitting: users only download labs they visit
- `LabShellComponent` provides consistent UX: header, stage navigator, "Under the Hood" panel
- `LabRuntimeService` provided by the lab's route providers → automatic disposal on navigation
- `ComponentRegistry` + `VisualizationRegistry` for dynamic stage rendering

**Alternatives considered**:
- Single `LabComponent` with config-driven stages (rejected: no code splitting, all lab code bundled)
- Route-level lazy loading without shell (rejected: duplicated layout logic)

### 5. Content as Declarative TypeScript Configs
**Decision**: Lab configs = TypeScript `const` objects in `educational-content` lib, validated by Zod schemas at build.

**Rationale**:
- Type-safe authoring: TS validates stage/component config shapes
- Build-time validation catches errors before runtime
- No runtime parsing overhead
- Version-controlled, diffable, reviewable

**Alternatives considered**:
- JSON/YAML files (rejected: no TS validation, separate tooling)
- Database/CMS (rejected: V1 local-first, no backend)

### 6. Visualization Engine: Registry + Contract
**Decision**: `VisualizationRegistry` (Map<string, ComponentType>) with `VisualizationComponent` interface.

**Rationale**:
- Pluggable: labs declare viz type in config, shell resolves component
- Shared visualizations (tensor-grid, line-chart) in `shared/visualizations`
- Lab-specific visualizations can register locally
- Contract ensures `ngOnDestroy` disposal (WebGL/Chart.js cleanup)

**Alternatives considered**:
- Direct component imports in labs (rejected: no abstraction, hard to swap implementations)
- Single monolithic viz component (rejected: bundle size, maintenance)

### 7. "Under the Hood" Panel: ComputationEvent Stream
**Decision**: `LabRuntimeService` emits `ComputationEvent` on each tensor operation; panel subscribes and displays latest.

**Rationale**:
- Decouples execution from display
- Enables code generation from actual execution (not hardcoded)
- Single source of truth for tensor values

**Alternatives considered**:
- Lab passes data directly to panel (rejected: tight coupling, panel not reusable)

### 8. Progress Persistence: Signal + Debounced localStorage
**Decision**: `ProgressService` holds `signal<ProgressState>`, `LocalStorageService` debounced saves (500ms).

**Rationale**:
- Signals: reactive UI updates on progress change
- Debounce: avoids excessive writes during rapid stage completion
- Migration: `ProgressMigrator` handles schema versions
- Export/Import: JSON roundtrip for backup

**Alternatives considered**:
- NgRx Store with localStorage sync (rejected: overkill)
- Immediate writes (rejected: performance, quota risk)

### 9. Styling: Tailwind CSS 4.x with CSS Variables
**Decision**: Tailwind 4 (Oxide engine), CSS custom properties for theming, `ThemeService` toggles `data-theme`.

**Rationale**:
- Tailwind 4: faster builds, native CSS cascade, no config file needed
- CSS variables: runtime theme switching without rebuild
- `prefers-color-scheme` + manual override supported

**Alternatives considered**:
- Angular Material (rejected: bundle size, design constraints)
- Plain CSS + CSS Modules (rejected: less productive, no design tokens)

### 10. Accessibility: Framework-Level Primitives
**Decision**: A11y built into `core/ui` primitives: `FocusTrapDirective`, `LiveRegionService`, `ReducedMotionMixin`, data-table alternatives for all charts.

**Rationale**:
- Prevents retrofitting: primitives enforce AA by default
- Live regions critical for dynamic content (stage complete, challenge result)
- Reduced motion: single mixin applied to all animated components

**Alternatives considered**:
- Per-component a11y (rejected: inconsistent, easy to miss)

### 11. Testing Strategy
**Decision**: 
- Unit: Angular unit-test runner (Vitest) with browser `@tensorflow/tfjs` (CPU backend, fixed seeds) for deterministic math tests
- Component: Angular TestBed + Vitest for standalone components
- Integration: Playwright for user flows (lab completion, progress)
- Visual regression: Playwright screenshot comparison for visualization components
- E2E: Playwright critical paths with mandatory video/screenshot artifacts

**Rationale**:
- Vitest via `ng test`: the project's established unit runner; avoids `tfjs-node` (Node-only, incompatible with the browser/jsdom runner)
- Playwright: superior video/screenshot capture, multi-browser support, better CI integration
- Visual regression via Playwright screenshot comparison
- Mandatory video/screenshot generation enables UI review without running project
- Task completion requires passing Playwright validation

### 12. MCP Context7 Integration
**Decision**: All implementation tasks MUST query MCP Context7 for current documentation before using any library (Angular, TF.js, Tailwind, Chart.js, Vitest, Zod, etc.).

**Rationale**:
- Library APIs change; training data may be stale
- Ensures implementation uses current best practices
- Reduces rework from deprecated patterns

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| TF.js WebGL memory leaks in long sessions | `TfjsMemoryService.tidy()` mandatory; auto-dispose on navigation; `watchMemory()` with budget alerts |
| Training blocks UI even in Worker | Chunk epochs; `postMessage` per epoch; main thread only updates charts via signals |
| Lab chunk size exceeds 100KB budget | Tree-shaking: only import used visualizations; lazy-load heavy deps (Three.js, D3) |
| Content schema changes break progress | `ProgressMigrator` maps old stage IDs; versioned schema in localStorage key |
| Accessibility gaps in custom visualizations | All viz components MUST implement data-table alternative; axe-core in CI |
| Bundle size: TF.js ~200KB + app | TF.js separate chunk (cached); code-split by route; analyze the Angular esbuild output stats |
| WebGPU unavailable on many devices | Graceful fallback chain; log backend; all labs tested on CPU |
| Scope creep in lab content | Content schema validation at build; spec freeze after Phase 1.4 |
| Challenge V2 requires refactoring | Design docs explicitly address V2 readiness; challenge-architecture spec defines extension points |