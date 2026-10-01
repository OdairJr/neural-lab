# Domain Model Specification

## Purpose
Define the core domain entities, value objects, aggregates, and relationships for Neural Lab's educational content and runtime state.

## Requirements

### Requirement: Laboratory Entity
The system SHALL define a Laboratory as the primary content aggregate root.

#### Scenario: Lab structure
- **WHEN** a lab is defined
- **THEN** it has: `id` (string, e.g., "lab-01-tensors"), `number` (1-16), `title`, `description`, `estimatedMinutes`, `prerequisites` (lab IDs), `concepts` (concept IDs), `stages` (ordered StageConfig[]), `memoryBudgetMB` (number), `tags` (string[])
- **AND** `id` is immutable; `number` determines journey order
- **AND** lab is loaded as declarative config (TypeScript const), not runtime entity

#### Scenario: Lab identity
- **WHEN** two labs have same `id`
- **THEN** they are the same lab (value equality on id)
- **AND** slug for URL derived from `number` + kebab-case `title`

### Requirement: Stage Configuration
The system SHALL define StageConfig as a value object describing one pedagogical stage.

#### Scenario: Stage config structure
- **WHEN** a stage is configured
- **THEN** it has: `type` (enum: contextualizacao | conceito | analogia | exemplo-visual | demonstracao | experimentacao | desafio | explicacao | codigo | resumo), `title`, `component` (component type key), `config` (stage-specific config object), `validation` (optional ChallengeValidation for desafio type)
- **AND** `component` maps to registered Angular component (e.g., "tensor-visualizer", "code-editor", "challenge-form")
- **AND** `config` is typed per component (discriminated union)

#### Scenario: Stage completeness
- **WHEN** lab config is validated
- **THEN** each stage has required fields per type:
  - `exemplo-visual`: requires `visualizationType` + `initialData`
  - `experimentacao`: requires `experimentConfig` (parameters, constraints, visualization)
  - `desafio`: requires `validation` (success criteria, hints)
  - `codigo`: requires `codeTemplate` or `generationStrategy`

### Requirement: Concept Entity
The system SHALL define Concept as a reusable knowledge unit referenced by labs.

#### Scenario: Concept structure
- **WHEN** a concept is defined
- **THEN** it has: `id` (e.g., "tensor-rank"), `title`, `shortDefinition`, `fullDefinition`, `mathematicalNotation` (optional LaTeX), `visualAnalogy`, `tfjsApi` (API names), `relatedConcepts` (concept IDs), `introducedInLab` (lab ID), `reinforcedInLabs` (lab IDs[])
- **AND** concepts form a DAG (prerequisite relationships)
- **AND** glossary entries derived from concepts

### Requirement: Experiment Configuration
The system SHALL define ExperimentConfig for interactive experimentation stages.

#### Scenario: Experiment config structure
- **WHEN** an experiment is configured
- **THEN** it has: `parameters` (ParameterConfig[]), `visualization` (VisualizationConfig), `constraints` (ConstraintConfig[]), `defaultState` (Record<string, unknown>), `onParameterChange` (event spec for live update)
- **AND** `ParameterConfig`: `name`, `type` (number|string|boolean|tensor-shape), `label`, `min`/`max`/`options`, `step`, `description`, `tfjsEquivalent` (how param maps to TF.js)
- **AND** `ConstraintConfig`: `expression` (JS expression string evaluated safely), `message` (shown when violated), `severity` (warning|error)

#### Scenario: Experiment runtime
- **WHEN** user interacts with experiment
- **THEN** parameters update in local state
- **THEN** visualization re-renders via `requestAnimationFrame` or signal
- **THEN** "Under the hood" panel updates with current tensor values
- **AND** state persisted to localStorage per lab per stage

### Requirement: Challenge Validation
The system SHALL define ChallengeValidation for desafio stages.

#### Scenario: Challenge validation structure
- **WHEN** a challenge is configured
- **THEN** it has: `type` (enum: parameter-match | tensor-value | code-output | multiple-choice | free-form), `criteria` (type-specific), `hints` (string[]), `maxAttempts` (null = unlimited), `showSolutionAfter` (attempt count)
- **AND** `parameter-match`: user must set experiment params to target values
- **AND** `tensor-value`: user must produce tensor matching expected shape/values (with tolerance)
- **AND** `code-output`: user writes code snippet; system executes in sandbox and checks output
- **AND** `multiple-choice`: selects correct option(s)
- **AND** `free-form`: text answer; validated via keyword matching (V1) or LLM (V2)

### Requirement: Visualization Configuration
The system SHALL define VisualizationConfig for all visual outputs.

#### Scenario: Visualization config structure
- **WHEN** a visualization is configured
- **THEN** it has: `type` (enum: tensor-grid | tensor-3d | matrix-heatmap | line-chart | scatter-plot | decision-boundary | activation-curve | memory-timeline | image-tensor | network-graph), `props` (type-specific), `interactions` (InteractionConfig[]), `accessibility` (A11yConfig)
- **AND** `InteractionConfig`: `trigger` (hover|click|drag|scroll), `action` (tooltip|highlight|filter|drill-down|parameter-change), `target` (element selector)
- **AND** `A11yConfig`: `ariaLabel`, `dataTableAlternative` (boolean), `colorBlindSafe` (boolean), `reducedMotionAlternative` (description)

### Requirement: User Progress Aggregate
The system SHALL define UserProgress as the aggregate tracking learning state.

#### Scenario: Progress structure
- **WHEN** progress is saved
- **THEN** it has: `version` (schema version), `lastUpdated` (ISO timestamp), `labs` (LabProgress[]), `glossaryViews` (concept ID[]), `settings` (UserSettings), `analytics` (AnalyticsEvents[])
- **AND** `LabProgress`: `labId`, `status` (not-started | in-progress | completed), `completedStages` (stage type[]), `currentStageIndex`, `timeSpentMs`, `challengeAttempts` (ChallengeAttempt[]), `experimentStates` (stageType → parameter state)
- **AND** `ChallengeAttempt`: `stageIndex`, `timestamp`, `success`, `userInput`, `hintUsed`
- **AND** `AnalyticsEvents`: `eventType` (lab-started | stage-completed | challenge-passed | challenge-failed | lab-completed | glossary-viewed | settings-changed), `timestamp`, `payload`

#### Scenario: Progress persistence
- **WHEN** any progress mutation occurs
- **THEN** debounced save to localStorage (key: `neural-lab:v1:progress`) within 500ms
- **AND** migration logic handles schema version changes
- **AND** corruption recovery: invalid JSON → reset with backup offer

### Requirement: TensorFlow.js Runtime State
The system SHALL define TensorRuntimeState for managing TF.js tensors during lab execution.

#### Scenario: Runtime state structure
- **WHEN** a lab is active
- **THEN** runtime holds: `tensors` (Map<string, tf.Tensor>), `models` (Map<string, tf.LayersModel>), `memorySnapshots` (MemorySnapshot[]), `disposalRegistry` (Disposable[])
- **AND** `MemorySnapshot`: `timestamp`, `tfMemory` (tf.memory()), `tensorCount`, `peakMemoryMB`
- **AND** `Disposable`: `dispose()` function; registered on creation, called on lab unload

#### Scenario: Memory budget enforcement
- **WHEN** lab declares `memoryBudgetMB`
- **THEN** framework monitors `tf.memory().unreliable` vs budget
- **AND** at 80%: warning toast; at 95%: pause experiment, show disposal guidance
- **AND** automatic `tf.tidy` wrap on experiment parameter changes

### Requirement: Content Configuration Schema
The system SHALL define TypeScript interfaces for all content config, enabling type-safe authoring.

#### Scenario: Type-safe authoring
- **WHEN** content author writes lab config
- **THEN** they import types from `@domain/content`
- **AND** TypeScript validates: stage types match components, required fields present, parameter types match visualization expectations
- **AND** build-time validation catches config errors before runtime

#### Scenario: Config example (conceptual)
```typescript
// labs/lab-01-tensors.config.ts
export const lab01Config: LaboratoryConfig = {
  id: 'lab-01-tensors',
  number: 1,
  title: 'Fundamentos de Tensores',
  estimatedMinutes: 20,
  prerequisites: [],
  concepts: ['tensor', 'scalar', 'vector', 'matrix', 'rank', 'shape', 'dtype'],
  memoryBudgetMB: 50,
  stages: [
    { type: 'contextualizacao', title: 'Por que tensores?', component: 'markdown', config: { content: '...' } },
    { type: 'conceito', title: 'O que é um tensor', component: 'concept-card', config: { conceptId: 'tensor' } },
    { type: 'exemplo-visual', title: 'Temperaturas como tensor', component: 'tensor-grid', config: { visualizationType: 'tensor-grid', initialData: sampleTemperatures } },
    // ...
  ]
}
```