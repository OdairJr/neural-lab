# Information Architecture Specification

## Purpose
Define the navigation structure, content hierarchy, URL routing, and user flow for Neural Lab.

## Requirements

### Requirement: Top-Level Navigation
The system SHALL provide a persistent top-level navigation with four primary sections.

#### Scenario: Navigation structure
- **WHEN** user is on any page
- **THEN** they see: **Jornada** (Learning Path), **Laboratórios** (All Labs), **Glossário** (Glossary), **Progresso** (Progress)
- **AND** current section highlighted
- **AND** mobile: collapses to hamburger menu

### Requirement: Learning Path View (Jornada)
The system SHALL present a visual, linear learning path as the default entry point.

#### Scenario: Journey page layout
- **WHEN** user visits `/` or `/jornada`
- **THEN** they see vertical timeline of 16 labs in order
- **AND** each lab shows: number, title, status (completed/in-progress/locked), estimated time
- **AND** clicking a lab navigates to `/lab/:id`
- **AND** completed labs show checkmark; current lab pulses; locked labs show lock icon
- **AND** "Continuar" button on current lab takes user to first incomplete stage

#### Scenario: Lab card in journey
- **WHEN** user hovers/focuses a lab card
- **THEN** tooltip shows: prerequisites, concepts covered, pedagogical stages included
- **AND** "Ver pré-requisitos" link jumps to prerequisite labs

### Requirement: Laboratory Catalog (Laboratórios)
The system SHALL provide a filterable, searchable catalog of all labs.

#### Scenario: Lab catalog view
- **WHEN** user visits `/laboratorios`
- **THEN** they see grid of all 16 labs with: number, title, short description, tags, duration
- **AND** filters: by concept category (Tensors, Operations, ML, Neural Networks, Images, Memory), by completion status
- **AND** search by keyword (title, description, concepts)
- **AND** sort by: order, alphabetical, duration, completion rate

### Requirement: Lab Detail Page
The system SHALL render each lab as a multi-stage, single-page experience with persistent context.

#### Scenario: Lab URL structure
- **WHEN** user accesses Lab 03
- **THEN** URL is `/lab/03-operacoes-de-tensores` (kebab-case PT-BR title for sharing)
- **AND** deep-link to stage: `/lab/03-operacoes-de-tensores?stage=experimentacao`
- **AND** browser back/forward navigates between stages

#### Scenario: Lab page layout
- **WHEN** user is in a lab
- **THEN** persistent header: lab title, progress ring (stages), "Por baixo dos panos" toggle, exit to journey
- **THEN** sidebar (desktop) / bottom sheet (mobile): stage navigator with completion status
- **THEN** main content area: current stage content
- **THEN** footer: previous/next stage navigation, stage indicator (e.g., "Etapa 5 de 8")

#### Scenario: Stage navigator
- **WHEN** user opens stage navigator
- **THEN** they see all 10 possible stages with icons
- **AND** completed stages: green check; current: blue dot; locked: gray (future) or accessible (past)
- **AND** clicking completed stage navigates instantly
- **AND** clicking future stage shows "Complete previous stages first" toast

### Requirement: "Under the Hood" Panel (Por baixo dos panos)
The system SHALL provide a persistent, resizable panel showing computational details.

#### Scenario: Panel behavior
- **WHEN** user clicks "Por baixo dos panos" toggle
- **THEN** panel slides in from right (desktop) / bottom (mobile)
- **AND** shows for current operation: input tensors (values + shape + dtype), operation name, output tensor (values + shape + dtype), TF.js code snippet
- **AND** "Copy code" button copies formatted TypeScript
- **AND** panel state persists across stages and lab navigation

#### Scenario: Code view modes
- **WHEN** user views code in panel
- **THEN** they can toggle: "Essential" (one-liner), "Annotated" (with comments), "Full" (with imports, tensor creation, disposal)
- **AND** default: "Annotated"

### Requirement: Glossary
The system SHALL provide a searchable, cross-referenced glossary.

#### Scenario: Glossary page
- **WHEN** user visits `/glossario`
- **THEN** they see A-Z list of terms with: term, one-line definition, related labs count
- **AND** click term → detail view with: full definition, visual/diagram, mathematical formula (if applicable), TF.js API, related labs (links), "See also" cross-refs
- **AND** search filters list in real-time

#### Scenario: Inline glossary
- **WHEN** user clicks glossary link in lab content
- **THEN** modal opens with term detail (same as detail view)
- **AND** "Voltar ao laboratório" returns to exact scroll position

### Requirement: Progress Dashboard
The system SHALL show comprehensive learning analytics.

#### Scenario: Progress page
- **WHEN** user visits `/progresso`
- **THEN** they see: overall completion %, labs completed, total time spent, current streak
- **AND** per-lab: completion %, stages completed, time spent, challenge attempts, last visited
- **AND** concept mastery radar chart: Tensors, Operations, Algebra, ML, Regression, Gradient Descent, Neurons, Activations, Networks, Classification, Images, Memory
- **AND** "Export progress" button downloads JSON

### Requirement: Settings / Preferences
The system SHALL provide minimal settings.

#### Scenario: Settings page
- **WHEN** user visits `/configuracoes`
- **THEN** they can toggle: dark/light/system theme, reduced motion, show/hide "Por baixo dos panos" by default, language (PT-BR only V1)
- **AND** "Reset all progress" with confirmation dialog
- **AND** "Export/Import progress" for backup

### Requirement: URL Routing Strategy
The system SHALL use Angular Router with lazy-loaded lab features and hash location.

#### Scenario: Route configuration
- **WHEN** app loads
- **THEN** routes:
  - `/` → redirect to `/jornada`
  - `/jornada` → JourneyComponent (eager)
  - `/laboratorios` → CatalogComponent (eager)
  - `/lab/:slug` → LabShellComponent (lazy loads lab feature)
  - `/glossario` → GlossaryComponent (lazy)
  - `/progresso` → ProgressComponent (lazy)
  - `/configuracoes` → SettingsComponent (lazy)
  - `**` → redirect to `/jornada`

#### Scenario: Lab feature lazy loading
- **WHEN** user navigates to `/lab/03-operacoes-de-tensores`
- **THEN** Angular lazy-loads the lab feature routes on demand
- **AND** the feature declares its stages, visualizations, experiments
- **AND** previous lab feature is destroyed (triggers tensor disposal)

### Requirement: Responsive Breakpoints
The system SHALL adapt layout at defined breakpoints.

#### Scenario: Breakpoint behavior
- **WHEN** viewport < 768px (mobile)
- **THEN** sidebar → bottom sheet; top nav → hamburger; "Por baixo dos panos" → bottom sheet
- **WHEN** viewport 768px–1199px (tablet)
- **THEN** sidebar collapsible; panel overlays content
- **WHEN** viewport ≥ 1200px (desktop)
- **THEN** full three-pane: sidebar | content | panel