# Challenge Architecture Specification (V2 Preparation)

## Purpose
Define the architectural foundation for the Challenge system (V2) that allows users to apply learned concepts to solve open-ended problems, while ensuring V1 lab infrastructure supports this without refactoring.

## Requirements

### Requirement: Challenge as Lab Variant
The system SHALL model Challenges as a variant of Laboratories, reusing the same infrastructure.

#### Scenario: Challenge configuration
- **WHEN** a challenge is defined
- **THEN** it uses `ChallengeConfig` extending `LaboratoryConfig`:
  - `id`: "challenge-house-price-prediction"
  - `type`: "challenge" (vs "lab")
  - `prerequisiteLabs`: ["lab-09-linear-regression", "lab-10-gradient-descent"]
  - `concepts`: ["linear-regression", "gradient-descent", "mse", "feature-scaling"]
  - `stages`: only [contextualizacao, experimentacao, desafio, explicacao, codigo, resumo]
  - `challengeSpec`: ChallengeSpec (see below)
  - `memoryBudgetMB`: higher (e.g., 200) for training
  - `estimatedMinutes`: 30-60

#### Scenario: Challenge registry
- **WHEN** app loads
- **THEN** `ChallengeRegistry` loads all challenges from `src/app/educational-content/challenges/`
- **AND** challenges appear in separate "Desafios" section in catalog
- **AND** locked until prerequisite labs completed (hard gate for challenges)

### Requirement: Challenge Specification
The system SHALL define ChallengeSpec for open-ended problem solving.

#### Scenario: Challenge spec structure
- **WHEN** challenge is configured
- **THEN** `ChallengeSpec` contains:
  - `problemStatement`: markdown (context, goal, success criteria)
  - `dataset`: DatasetSpec (source, loading, preprocessing hints)
  - `allowedOperations`: string[] (TF.js APIs user may use)
  - `starterCode`: string (boilerplate with TODO comments)
  - `solution`: SolutionSpec (reference implementation, hidden)
  - `validation`: ChallengeValidation (automated checks)
  - `hints`: Hint[] (progressive, unlockable)
  - `extensions`: ExtensionSpec[] (optional bonus objectives)

#### Scenario: Dataset specification
- **WHEN** challenge uses data
- **THEN** `DatasetSpec`:
  - `source`: "builtin" | "generated" | "upload" (V2: builtin/generated only)
  - `builtinId`: string (e.g., "housing-prices", "iris", "mnist-subset")
  - `generatedFn`: `(params) => { features: tf.Tensor, labels: tf.Tensor }` (for synthetic)
  - `preprocessingHints`: string[] (e.g., "normalize features", "split train/test")
  - `preview`: { features: number[][], labels: number[] } (for UI preview)

#### Scenario: Solution specification (hidden)
- **WHEN** challenge has reference solution
- **THEN** `SolutionSpec`:
  - `modelArchitecture`: LayerSpec[] (for neural network challenges)
  - `trainingConfig`: { optimizer, loss, metrics, epochs, batchSize, lr }
  - `expectedMetrics`: { minAccuracy?, maxLoss?, maxEpochs? }
  - `code`: string (complete reference solution)
  - **NOT** revealed to the user until validation passes (no backend on static hosting — the solution ships with the client bundle but is gated in the UI)

#### Scenario: Challenge validation
- **WHEN** user submits challenge solution
- **THEN** `ChallengeValidator` runs:
  - Static checks: uses only allowed APIs, no prohibited patterns
  - Dynamic checks: executes user code in sandboxed worker
  - Metric checks: trains model, evaluates against `expectedMetrics`
  - Returns: `ValidationResult` { passed, metrics, feedback, hintsUsed }

### Requirement: Challenge Sandbox Execution
The system SHALL execute user challenge code in isolated environment.

#### Scenario: Sandbox architecture
- **WHEN** user runs challenge code
- **THEN** `ChallengeSandboxService`:
  - Spawns dedicated `Worker` with TF.js
  - Injects: `tf`, dataset (as tensors), allowed APIs only
  - User code runs in `tf.tidy()` with timeout (60s default)
  - Captures: console.log, returned tensors, thrown errors
  - Enforces: memory limit (challenge budget), execution time limit
  - Returns structured result to main thread

#### Scenario: Allowed API enforcement
- **WHEN** sandbox initializes
- **THEN** it creates `tf` proxy that:
  - Only exposes APIs in `allowedOperations` list
  - Throws descriptive error on disallowed API access
  - Logs all API calls for "Under the hood" replay

### Requirement: Challenge UI Components
The system SHALL provide reusable challenge-specific UI components.

#### Scenario: Challenge shell
- **WHEN** user enters challenge
- **THEN** `ChallengeShellComponent` (extends `LabShellComponent`):
  - Header: challenge title, timer (optional), "Ver Requisitos" link
  - Sidebar: problem statement (collapsible), hints panel, dataset preview
  - Main: split view — Code Editor (left) / Visualization + Results (right)
  - Panel: "Under the hood" + "Validação" tabs
  - Footer: "Executar", "Validar", "Ver Solução" (locked until passed)

#### Scenario: Code editor for challenges
- **WHEN** user writes challenge code
- **THEN** `ChallengeCodeEditorComponent`:
  - Monaco Editor (or CodeMirror) with TypeScript support
  - IntelliSense for allowed TF.js APIs only
  - Inline error squiggles (static analysis)
  - "Run" button → executes in sandbox → shows output/visualization
  - "Validar" button → runs full validation suite

#### Scenario: Progressive hints
- **WHEN** user requests hint
- **THEN** `HintsPanelComponent`:
  - Shows hint 1 (conceptual) → hint 2 (approach) → hint 3 (code snippet)
  - Tracks hints used in progress
  - "Revelar próximo" button unlocks next hint
  - Final hint: "Ver solução completa" (only after validation passed OR max attempts)

### Requirement: Challenge Progress Tracking
The system SHALL track challenge-specific progress distinct from labs.

#### Scenario: Challenge progress aggregate
- **WHEN** challenge progress saved
- **THEN** `ChallengeProgress`:
  - `challengeId`, `status` (not-started | in-progress | completed | abandoned)
  - `attempts`: Attempt[] { timestamp, code, validationResult, hintsUsed }
  - `bestMetrics`: { accuracy?, loss?, epochs? }
  - `timeSpentMs`, `completedAt?`
  - `extensionsCompleted`: string[] (bonus objectives)

#### Scenario: Challenge analytics
- **WHEN** analytics recorded
- **THEN** events: `challenge-started`, `code-run`, `validation-attempted`, `validation-passed`, `hint-used`, `extension-completed`, `challenge-completed`

### Requirement: V1 Infrastructure Readiness
The system SHALL ensure V1 architecture supports V2 challenges without breaking changes.

#### Scenario: Shared infrastructure reuse
- **WHEN** V2 challenges implemented
- **THEN** they reuse:
  - `LabShellComponent` → `ChallengeShellComponent` (composition)
  - `LabRuntimeService` → `ChallengeRuntimeService` (extends with sandbox)
  - `ExperimentStageComponent` → `ChallengeCodeEditorComponent` (different input)
  - `VisualizationRegistry` — same visualizations for results
  - `ProgressService` — extended with `challenges` map
  - `ComponentRegistry` — same component resolution
  - `ContentValidator` — validates challenge configs

#### Scenario: Route extension
- **WHEN** V2 routes added
- **THEN** new routes in `app.routes.ts`:
  - `/desafios` → ChallengeCatalogComponent
  - `/desafio/:slug` → ChallengeShellComponent (lazy loads challenge feature)
- **AND** no changes to existing lab routes

#### Scenario: Content schema extension
- **WHEN** `domain/models` updated
- **THEN** `LaboratoryConfig` gets optional `type: 'lab' | 'challenge'`
- **AND** `ChallengeConfig` interface extends `LaboratoryConfig` with challenge-specific fields
- **AND** existing lab configs valid without migration

### Requirement: Challenge Examples (V2 Scope)
The system SHALL define initial challenge catalog for V2 planning.

#### Scenario: Challenge 1 — Food Cost Prediction
- **WHEN** user attempts
- **THEN** problem: "Predict total cost of a recipe given ingredient quantities and prices"
- **AND** dataset: generated (random recipes with 5-10 ingredients)
- **AND** prerequisites: Labs 1-5 (tensors, operations, broadcasting)
- **AND** success: MSE < threshold on test set
- **AND** extensions: handle missing prices, optimize for budget

#### Scenario: Challenge 2 — House Price Prediction
- **WHEN** user attempts
- **THEN** problem: "Build a linear regression model to predict house prices"
- **AND** dataset: builtin "housing-prices" (synthetic, 10 features, 1000 samples)
- **AND** prerequisites: Labs 8-10 (ML fundamentals, linear regression, gradient descent)
- **AND** success: R² > 0.7 on test set
- **AND** extensions: feature engineering, regularization, compare optimizers

#### Scenario: Challenge 3 — Spam Detection
- **WHEN** user attempts
- **THEN** problem: "Classify messages as spam/not-spam"
- **AND** dataset: builtin "spam-dataset" (text → TF-IDF features precomputed)
- **AND** prerequisites: Labs 11-14 (neuron, activations, networks, classification)
- **AND** success: accuracy > 90%, F1 > 0.85
- **AND** extensions: try different architectures, analyze false positives

#### Scenario: Challenge 4 — Fruit Classification
- **WHEN** user attempts
- **THEN** problem: "Classify fruit type from physical measurements"
- **AND** dataset: builtin "fruit-classification" (4 classes, 6 features, 200 samples)
- **AND** prerequisites: Labs 11-14
- **AND** success: accuracy > 85%
- **AND** extensions: confusion matrix analysis, feature importance

#### Scenario: Challenge 5 — Image Classification
- **WHEN** user attempts
- **THEN** problem: "Classify handwritten digits (MNIST subset)"
- **AND** dataset: builtin "mnist-subset" (10 classes, 28x28 grayscale, 5000 samples)
- **AND** prerequisites: Labs 11-15 (neuron through images as tensors)
- **AND** success: accuracy > 95%
- **AND** extensions: CNN vs dense, data augmentation, misclassified analysis

#### Scenario: Challenge 6 — Build Your Neural Network
- **WHEN** user attempts
- **THEN** problem: "Design a neural network for a given 2D classification dataset"
- **AND** dataset: choose from spiral, moons, circles, XOR
- **AND** prerequisites: Lab 13 (neural networks)
- **AND** user chooses: layers, neurons, activations, optimizer, lr, epochs
- **AND** success: decision boundary separates classes visually + accuracy > threshold
- **AND** extensions: compare architectures, analyze overfitting, learning curves