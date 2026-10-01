# Requirements Specification

## Purpose
Consolidate all functional and non-functional requirements with verifiable acceptance criteria for Neural Lab V1.

## Requirements

### Requirement: User Onboarding
The system SHALL provide a zero-friction entry experience.

#### Scenario: First visit
- **WHEN** user visits `/` for the first time
- **THEN** they see Journey page with Lab 1 highlighted as "Comece aqui"
- **AND** no authentication, no modal, no forced tutorial
- **AND** "Como funciona" link opens brief modal (3 screens) explaining pedagogy
- **THEN** clicking Lab 1 navigates to `/lab/01-fundamentos-de-tensores`

#### Scenario: Returning user
- **WHEN** user with progress visits `/`
- **THEN** they see Journey with current lab highlighted "Continue aqui"
- **AND** "Continuar" button deep-links to first incomplete stage

### Requirement: Lab Completion Flow
The system SHALL define clear completion criteria for each lab.

#### Scenario: Lab completion
- **WHEN** user completes all stages in a lab
- **THEN** lab marked `completed` in progress
- **AND** celebration feedback (subtle: checkmark animation, brief toast)
- **AND** next lab unlocks (visual state change in Journey)
- **AND** "Próximo laboratório" button appears in lab shell

#### Scenario: Stage completion criteria
- **WHEN** user interacts with a stage
- **THEN** completion by type:
  - `contextualizacao|conceito|analogia|explicacao|resumo`: scroll to bottom + 3s dwell OR click "Entendi"
  - `exemplo-visual|demonstracao`: interaction observed (hover, click, play) + "Continuar"
  - `experimentacao`: at least 3 parameter changes OR 30s engagement + "Continuar"
  - `desafio`: validation passes
  - `codigo`: "Copiar código" clicked OR 10s view time

### Requirement: TensorFlow.js Execution
The system SHALL execute TF.js operations reliably in browser.

#### Scenario: Basic tensor operations
- **WHEN** lab runs tensor creation/manipulation
- **THEN** operations complete < 100ms for tensors < 10k elements
- **AND** results match TF.js reference implementation (tested)
- **AND** no memory leak: `tf.memory().numTensors` returns to baseline after `tidy`

#### Scenario: Training execution
- **WHEN** lab runs gradient descent / neural network training
- **THEN** training runs in Web Worker (if available) or main thread with `setTimeout` yielding
- **AND** UI remains responsive (60fps metrics updates)
- **AND** epoch metrics streamed to visualization via `postMessage`
- **AND** user can pause/stop training
- **AND** memory monitored: auto-pause at 95% budget

#### Scenario: Backend fallback
- **WHEN** WebGPU unavailable
- **THEN** falls back to WebGL → CPU silently
- **AND** console logs: "TF.js backend: webgl (webgpu not supported)"
- **AND** all labs functional on all backends (CPU slower but correct)

### Requirement: Visualization Rendering
The system SHALL render all visualization types correctly.

#### Scenario: Tensor visualizations
- **WHEN** `tensor-grid` renders rank-1/2/3 tensor
- **THEN** shows: values as colored cells, shape badges, dtype badge
- **AND** rank-3: slice selector (slider) for depth dimension
- **AND** hover: tooltip with exact value, indices
- **AND** responsive: stacks on mobile, grid on desktop

#### Scenario: Chart visualizations
- **WHEN** `line-chart`/`scatter-plot` render
- **THEN** uses Chart.js with: responsive, maintainAspectRatio=false
- **AND** tooltips on hover/touch
- **AND** legend toggle series
- **AND** "Download PNG" button
- **AND** data table alternative for screen readers

#### Scenario: Decision boundary
- **WHEN** `decision-boundary` renders during training
- **THEN** shows: mesh grid colored by prediction, data points overlaid
- **AND** animates smoothly between epochs (requestAnimationFrame)
- **AND** user can pause/scrub epoch slider
- **AND** color-blind safe palette (viridis)

#### Scenario: Memory timeline
- **WHEN** `memory-timeline` renders
- **THEN** shows: line chart of `tf.memory().unreliable` over time
- **AND** markers for: tensor creation, disposal, tidy calls
- **AND** hover shows exact bytes, tensor count

### Requirement: "Under the Hood" Panel
The system SHALL display computational internals accurately.

#### Scenario: Panel content accuracy
- **WHEN** panel shows operation
- **THEN** input tensors: exact values (sampled if >100 elements), shape, dtype
- **THEN** operation name: exact TF.js API (e.g., "tf.matMul")
- **THEN** output tensor: exact values, shape, dtype
- **THEN** code: runnable TypeScript that reproduces the operation
- **AND** copy button copies to clipboard successfully

#### Scenario: Code view modes
- **WHEN** user toggles code view
- **THEN** Essential: single expression (`tf.matMul(A, B)`)
- **THEN** Annotated: with comments explaining shapes, broadcasting
- **THEN** Full: imports, tensor creation, disposal, error handling

### Requirement: Progress Persistence
The system SHALL persist and restore user progress reliably.

#### Scenario: Progress save
- **WHEN** user completes stage
- **THEN** progress saved to localStorage within 500ms
- **AND** key: `neural-lab:v1:progress`
- **AND** survives: browser close, refresh, 30 days

#### Scenario: Progress restore
- **WHEN** user returns to lab
- **THEN** stage navigator shows completed stages
- **THEN** experiment parameters restored to last state
- **THEN** "Under the hood" panel shows last computation

#### Scenario: Progress export/import
- **WHEN** user clicks "Exportar progresso"
- **THEN** downloads `neural-lab-progress-YYYY-MM-DD.json`
- **WHEN** user imports file
- **THEN** validates schema version, merges (preserves newer timestamps)
- **AND** shows summary: "X labs, Y stages imported"

### Requirement: Accessibility
The system SHALL meet WCAG 2.1 AA standards.

#### Scenario: Keyboard navigation
- **WHEN** user tabs through lab
- **THEN** focus order: header → sidebar → main content → panel → footer
- **AND** all interactive elements reachable and operable
- **AND** focus visible (outline) on all elements
- **AND** `Escape` closes panels/modals, returns focus to trigger

#### Scenario: Screen reader support
- **WHEN** screen reader active
- **THEN** all images have `alt` (visualizations: "Gráfico de linha mostrando loss por época")
- **AND** visualizations have `role="img"` + `aria-describedby` pointing to data table
- **AND** live region announces: "Etapa completada", "Desafio validado com sucesso"
- **AND** math formulas: MathML or text alternative

#### Scenario: Reduced motion
- **WHEN** `prefers-reduced-motion: reduce`
- **THEN** animations disabled: stage transitions, chart animations, boundary evolution
- **AND** instant state changes instead of transitions
- **AND** "Pular animação" button on any remaining motion

#### Scenario: Color independence
- **WHEN** viewed in grayscale / color-blind simulator
- **THEN** all information conveyed by color also has: pattern, label, shape, text
- **AND** charts use: viridis palette + patterns for series
- **AND** status badges: icon + text, not color only

### Requirement: Performance Budgets
The system SHALL meet defined performance targets.

#### Scenario: Initial load
- **WHEN** user visits `/` on 4G / mid-tier device
- **THEN** LCP < 2.5s, TBT < 200ms, CLS < 0.1
- **AND** initial bundle < 500KB gzipped (excl. TF.js)

#### Scenario: Lab load
- **WHEN** user navigates to lab
- **THEN** lazy chunk loads < 3s
- **THEN** first stage interactive < 1s after chunk load
- **AND** TF.js backend initialized (shows spinner if > 2s)

#### Scenario: Experiment interaction
- **WHEN** user changes experiment parameter
- **THEN** visualization updates < 100ms (debounced 150ms)
- **AND** no frame drops during interaction

#### Scenario: Training performance
- **WHEN** training 100 epochs on 1000 samples
- **THEN** completes < 30s on WebGL, < 60s on CPU
- **AND** UI responsive throughout (metrics update 10fps)
- **AND** memory < lab budget (default 100MB)

### Requirement: Error Handling & Resilience
The system SHALL handle errors gracefully.

#### Scenario: TF.js initialization failure
- **WHEN** all backends fail
- **THEN** shows error page: "Não foi possível inicializar TensorFlow.js"
- **AND** offers: "Tentar novamente", "Ver requisitos do navegador", "Reportar problema"
- **AND** logs error to console with context

#### Scenario: Experiment runtime error
- **WHEN** `experimentFn` throws
- **THEN** catches error, shows inline: "Erro no experimento: {message}"
- **AND** "Tentar novamente" button re-runs with default params
- **AND** "Reportar" copies error details to clipboard

#### Scenario: localStorage quota exceeded
- **WHEN** save fails with QuotaExceededError
- **THEN** auto-cleans analytics, compresses experiment states
- **AND** retries save
- **AND** if still fails: shows toast "Progresso não salvo — armazenamento cheio"

#### Scenario: Corrupted progress data
- **WHEN** localStorage parse fails
- **THEN** shows modal: "Dados de progresso corrompidos. Restaurar backup ou reiniciar?"
- **AND** backup: last known good version (stored separately)
- **AND** "Reiniciar" clears progress, keeps settings

### Requirement: Content Management
The system SHALL support content updates without code deployment.

#### Scenario: Content versioning
- **WHEN** `educational-content` version bumped
- **THEN** build includes new content
- **AND** progress migration: if lab config changed (stages added/removed), maps old stage completion to new

#### Scenario: Concept glossary sync
- **WHEN** concepts updated
- **THEN** glossary page reflects changes automatically
- **AND** inline glossary links in labs point to current definitions

### Requirement: Internationalization Readiness
The system SHALL be structured for future i18n (V2).

#### Scenario: String externalization
- **WHEN** components use text
- **THEN** all user-facing strings in `core/i18n/messages.pt-BR.ts` (V1: single file)
- **AND** accessed via `I18nService.translate(key, params)`
- **AND** no hardcoded strings in components (enforced by lint rule)

#### Scenario: Number/date formatting
- **WHEN** displaying numbers/dates
- **THEN** uses `Intl.NumberFormat('pt-BR')`, `Intl.DateTimeFormat('pt-BR')`
- **AND** configurable via settings (V2)

### Requirement: Security
The system SHALL follow security best practices for client-side app.

#### Scenario: No code injection
- **WHEN** user code runs in challenge sandbox (V2)
- **THEN** executed in isolated Worker with restricted globals
- **AND** no access to `localStorage`, `fetch`, `eval`, `Function` constructor
- **AND** TF.js proxy blocks Node.js APIs

#### Scenario: Content Security Policy
- **WHEN** app served
- **THEN** CSP header: `script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:;`
- **AND** TF.js WebGL shader compilation requires `'wasm-unsafe-eval'`

#### Scenario: No external dependencies at runtime
- **WHEN** app runs offline (after first load)
- **THEN** all functionality works (except initial load)
- **AND** no CDN calls for fonts, icons, libraries
- **AND** TF.js bundled locally

### Requirement: Testing Requirements
The system SHALL have defined test coverage targets with mandatory Playwright E2E validation.

#### Scenario: Unit test coverage
- **WHEN** `npm run test:unit` runs
- **THEN** coverage: statements > 80%, branches > 70%, functions > 80%, lines > 80%
- **AND** critical paths: progress persistence, TF.js wrappers, validation logic — 100%

#### Scenario: Component tests
- **WHEN** component tests run
- **THEN** all `shared/visualizations` components tested with snapshot + interaction
- **AND** `LabShellComponent` tested with 3 different lab configs
- **AND** `ChallengeStageComponent` tested with all validation types

#### Scenario: E2E critical paths with Playwright
- **WHEN** Playwright runs
- **THEN** tests: complete Lab 1, complete Lab 9 (regression), export/import progress, dark mode toggle, accessibility audit (axe)
- **AND** all E2E tests generate video recordings of full test execution
- **AND** screenshots captured on failure and at key validation points
- **AND** videos saved to `test-results/videos/`, screenshots to `test-results/screenshots/`
- **AND** test execution must pass for any task to be considered complete
- **AND** artifacts (videos/screenshots) available for UI review without running project

#### Scenario: TF.js deterministic tests
- **WHEN** math tests run
- **THEN** use the browser `@tensorflow/tfjs` package (CPU backend, fixed seeds) for reproducible results — no `@tensorflow/tfjs-node`
- **AND** tests: tensor ops, gradient descent convergence, backprop correctness