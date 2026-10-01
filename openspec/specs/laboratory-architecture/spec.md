# Laboratory Architecture Specification

## Purpose
Define how a laboratory is structured, loaded, executed, and disposed — the runtime architecture for individual labs.

## Requirements

### Requirement: Lab as Lazy-Loaded Feature
The system SHALL implement each laboratory as an Angular lazy-loaded feature (standalone routes) inside `features/labs`.

#### Scenario: Lab feature structure
- **WHEN** lab feature is created (e.g., `lab-01-tensors`)
- **THEN** it contains:
  - `lab-01-tensors.routes.ts` — standalone routes exporting `LAB_01_TENSORS_ROUTES`
  - `lab-01-tensors.config.ts` — imports config from `@content/lab-configs/lab-01-tensors`
  - `components/` — lab-specific components (if any)
  - `experiments/` — experiment implementations (parameter logic, tensor ops)
  - `visualizations/` — lab-specific visualizations (if not in shared)
  - `challenges/` — challenge validation logic
  - `index.ts` — exports the route array and `LAB_CONFIG`

#### Scenario: Lab feature registration
- **WHEN** app routes to `/lab/01-tensors`
- **THEN** router loads the lab routes via `loadChildren`
- **THEN** `LabShellComponent` resolves the `LAB_CONFIG` token for that lab
- **THEN** shell renders stage navigator + first stage

### Requirement: Lab Shell Component
The system SHALL provide a universal `LabShellComponent` that wraps any lab.

#### Scenario: Shell responsibilities
- **WHEN** `LabShellComponent` initializes
- **THEN** it:
  - Receives `LaboratoryConfig` via `LAB_CONFIG` injection token
  - Initializes `LabRuntimeService` (scoped to this lab instance)
  - Renders: header (title, progress, panel toggle), sidebar (stage navigator), main (stage content), panel (under the hood)
  - Subscribes to `LabRuntimeService.stage$` to render current stage component
  - Handles stage navigation (next/prev, jump to completed)
  - On destroy: calls `LabRuntimeService.dispose()` → triggers tensor cleanup

#### Scenario: Stage rendering
- **WHEN** shell renders a stage
- **THEN** it uses `StageRendererComponent` (dynamic component loader):
  - Receives `StageConfig` from lab config
  - Resolves component via `ComponentRegistry` (maps `component` key → ComponentType)
  - Passes `config` and `runtime` as inputs
  - Handles stage-specific lifecycle: `onStageEnter`, `onStageExit`

### Requirement: Lab Runtime Service
The system SHALL provide a per-lab runtime service managing tensor lifecycle and experiment state.

#### Scenario: Runtime service API
- **WHEN** lab code needs TF.js
- **THEN** it injects `LabRuntimeService` (provided in the lab's route providers):
  - `tf` — TF.js instance (from `TFJS_TOKEN`)
  - `tidy<T>(fn: () => T, label?: string): T` — tracked tidy
  - `createTensor(data, shape?, dtype?): tf.Tensor` — tracked creation
  - `track(tensor: tf.Tensor, label: string): tf.Tensor`
  - `getSnapshot(label: string): TensorSnapshot` — serializes for panel
  - `setExperimentState(stageType: string, state: unknown): void`
  - `getExperimentState(stageType: string): unknown`
  - `dispose(): void` — disposes ALL tracked tensors, models, workers

#### Scenario: Automatic disposal
- **WHEN** user navigates away from lab
- **THEN** Angular destroys the lab feature → `LabRuntimeService.ngOnDestroy()` → `dispose()`
- **AND** `dispose()` calls `tf.dispose()` on all tracked tensors
- **AND** cancels any running training workers
- **AND** clears experiment state for this lab (keeps progress only)

### Requirement: Stage Component Contract
The system SHALL define a standard interface for stage components.

#### Scenario: Stage component interface
- **WHEN** a stage component is created
- **THEN** it implements `StageComponent`:
  - `@Input() config: StageConfig` — stage-specific config
  - `@Input() runtime: LabRuntimeService` — tensor runtime
  - `@Output() stageComplete = new EventEmitter<StageCompletionEvent>()`
  - `onStageEnter(): void` — called when stage becomes active (focus, analytics)
  - `onStageExit(): void` — called when leaving (cleanup, save state)
  - `canExit(): boolean | Observable<boolean>` — guard (e.g., unsaved experiment)

#### Scenario: Stage types and base components
- **WHEN** implementing stages
- **THEN** base components provided in `shared/`:
  - `MarkdownStageComponent` — for contextualização, conceito, analogia, explicacao, resumo
  - `ConceptCardStageComponent` — for conceito (renders concept from registry)
  - `VisualizationStageComponent` — for exemplo-visual, demonstracao (wraps visualization)
  - `ExperimentStageComponent` — for experimentacao (parameter controls + live viz)
  - `ChallengeStageComponent` — for desafio (validation, hints, feedback)
  - `CodeViewStageComponent` — for codigo (generated TF.js code with copy)
  - Lab-specific components extend or compose these

### Requirement: Experiment Stage Architecture
The system SHALL provide a reusable experiment stage with parameter controls and live visualization.

#### Scenario: Experiment stage flow
- **WHEN** `ExperimentStageComponent` initializes
- **THEN** it:
  - Reads `ExperimentConfig` from stage config
  - Initializes parameter form (Angular Reactive Forms) from `parameters` config
  - Loads saved state from `runtime.getExperimentState('experimentacao')`
  - Renders: parameter panel (left), visualization (right), "Under the hood" data (bottom)
  - On parameter change: debounced (150ms) → calls `experimentFn(params)` → updates viz + panel
  - `experimentFn` provided by lab via config: `(params, runtime) => { tensors, visualizationData }`
  - Saves state to runtime on each change

#### Scenario: Experiment function signature
- **WHEN** lab defines experiment
- **THEN** it provides `experimentFn` in config:
```typescript
experimentFn: (params: Record<string, unknown>, runtime: LabRuntimeService) => {
  tensors: Map<string, tf.Tensor>,           // for "under the hood"
  visualizationData: VisualizationData,      // for visualization component
  codeSnippet: string                        // for code panel
}
```
- **AND** function MUST use `runtime.tidy()` or `runtime.track()` for all tensors
- **AND** returns plain objects (no tensors) for visualization/code

### Requirement: Challenge Stage Architecture
The system SHALL provide a reusable challenge stage with validation and feedback.

#### Scenario: Challenge stage flow
- **WHEN** `ChallengeStageComponent` initializes
- **THEN** it:
  - Reads `ChallengeValidation` from stage config
  - Renders challenge prompt + input method (form, code editor, parameter controls)
  - On submit: runs validator → emits `stageComplete` with result
  - Shows: success animation, explanation, "View code" link
  - On failure: shows hint (progressive: 1st attempt = hint 1, 2nd = hint 2, etc.)
  - Tracks attempts in progress

#### Scenario: Validator implementations
- **WHEN** validator runs
- **THEN** by type:
  - `parameter-match`: compares current experiment params to target
  - `tensor-value`: runs user's tensor code in `runtime.tidy()`, compares output to expected (shape + values within tolerance)
  - `code-output`: executes user code in sandboxed `tf.tidy()`, checks console output / return value
  - `multiple-choice`: checks selected option(s)
  - `free-form`: keyword matching (V1) — checks required terms present

### Requirement: "Under the Hood" Panel Architecture
The system SHALL provide a consistent panel showing computational internals.

#### Scenario: Panel data flow
- **WHEN** experiment runs / challenge submits
- **THEN** `LabRuntimeService` emits `ComputationEvent`:
  - `operation`: string (e.g., "matMul")
  - `inputs`: TensorSnapshot[] (serialized via `TensorSerializerService`)
  - `output`: TensorSnapshot
  - `code`: string (TF.js code that produced this)
  - `timestamp`: number
- **THEN** `UnderTheHoodPanelComponent` subscribes and displays latest
- **AND** panel shows: tabs for Inputs | Operation | Output | Code
- **AND** code tab has: copy button, view mode toggle (essential/annotated/full)

#### Scenario: Code generation
- **WHEN** panel needs code
- **THEN** `CodeGeneratorService`:
  - Receives: operation name, input tensor specs, output tensor spec
  - Generates TypeScript using template:
```typescript
// Input tensors
const A = tf.tensor([...], [shape], 'dtype');
const B = tf.tensor([...], [shape], 'dtype');

// Operation
const result = tf.matMul(A, B);

// Result: shape [...], dtype ...
```
  - Annotated mode adds comments explaining each step
  - Full mode adds imports, disposal, error handling

### Requirement: Visualization Integration in Labs
The system SHALL standardize how labs use visualizations.

#### Scenario: Visualization data contract
- **WHEN** experiment returns `visualizationData`
- **THEN** it matches `VisualizationData` union:
  - `TensorGridData`: `{ type: 'tensor-grid', tensor: TensorSnapshot }`
  - `MatrixHeatmapData`: `{ type: 'matrix-heatmap', matrix: number[][], labels?: string[] }`
  - `LineChartData`: `{ type: 'line-chart', series: { label, data: number[] }[], xLabels?: string[] }`
  - `ScatterPlotData`: `{ type: 'scatter-plot', points: { x, y, label?, class? }[], boundary?: DecisionBoundary }`
  - `DecisionBoundaryData`: `{ type: 'decision-boundary', mesh: number[][], points: ScatterPoint[], model: tf.LayersModel }`
  - `ActivationCurveData`: `{ type: 'activation-curve', fn: 'sigmoid'|'relu'|'tanh'|'softmax', xRange: [number, number] }`
  - `MemoryTimelineData`: `{ type: 'memory-timeline', snapshots: MemorySnapshot[] }`
  - `ImageTensorData`: `{ type: 'image-tensor', original: ImageData, tensor: TensorSnapshot, channels: 'RGB'|'grayscale' }`
  - `NetworkGraphData`: `{ type: 'network-graph', layers: LayerSpec[], weights?: WeightSnapshot[] }`

#### Scenario: Visualization rendering
- **WHEN** `VisualizationStageComponent` receives data
- **THEN** it:
  - Looks up component in `VisualizationRegistry` by `data.type`
  - Renders component with `data` as input
  - Forwards interaction events to runtime (for panel updates)

### Requirement: Lab Configuration Schema Validation
The system SHALL validate lab configs at build time.

#### Scenario: Validation rules
- **WHEN** the content validation script runs (`npm run validate:content`)
- **THEN** it checks:
  - All `stage.component` keys exist in `ComponentRegistry`
  - `experimentacao` stages have `experimentFn` in config
  - `desafio` stages have `validation` config
  - `codigo` stages have `codeTemplate` or `generationStrategy`
  - `prerequisites` reference existing lab IDs
  - `concepts` reference existing concept IDs
  - `memoryBudgetMB` > 0 and < 500
  - Stage order follows pedagogical sequence (no desafio before experimentacao)
- **AND** fails build on errors; outputs JSON report

### Requirement: Lab Authoring Guide (for Content Team)
The system SHALL provide a clear authoring model for new labs.

#### Scenario: Adding a new lab
- **WHEN** content team adds Lab 17
- **THEN** they:
  1. Create config in `src/app/educational-content/lab-configs/lab-17-new.ts`
  2. Add concepts to `src/app/educational-content/concepts/` if new
  3. Create the lazy feature in `src/app/features/labs/lab-17-new/`
  4. Implement any custom `experimentFn`, `challenge validators`, visualizations
  5. Register the route in `src/app/features/labs/labs.routes.ts` and the config index
  6. Run `npm run validate:content` and `npm run build` — validation passes
  7. Lab appears in journey automatically (config has `number: 17`)

#### Scenario: Reusing shared components
- **WHEN** lab needs tensor visualization
- **THEN** use `shared/visualizations/tensor-grid` — no custom code
- **WHEN** lab needs standard experiment
- **THEN** provide `experimentFn` only — UI from `ExperimentStageComponent`
- **WHEN** lab needs custom visualization
- **THEN** create in lab's `visualizations/` and register in `ComponentRegistry`