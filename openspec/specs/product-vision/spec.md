# Product Vision Specification

## Purpose
Define the core product vision for Neural Lab: an interactive educational platform for teaching Machine Learning, Neural Networks, and TensorFlow.js through guided hands-on labs with visualizations.

## Requirements

### Requirement: Core Product Identity
The system SHALL be an interactive web application that teaches ML/DL fundamentals through progressive, visual, hands-on laboratories.

#### Scenario: Product positioning
- **WHEN** a user visits Neural Lab
- **THEN** they encounter a guided learning experience (not a tool collection)
- **AND** each lab follows: concept → example → experiment → challenge → explanation → code
- **AND** the experience runs entirely in-browser with TensorFlow.js

### Requirement: Target Audience Alignment
The system SHALL serve developers with basic/intermediate programming knowledge who are new to Machine Learning.

#### Scenario: Primary persona entry
- **WHEN** a web developer with TypeScript experience starts Lab 1
- **THEN** they understand "what is a tensor" before being asked to manipulate one
- **AND** they see visual representations alongside code
- **AND** they can experiment safely with guardrails

#### Scenario: Secondary persona entry
- **WHEN** a CS student uses the platform
- **THEN** they can follow the structured progression matching curriculum
- **AND** they can revisit prerequisite concepts via contextual hints

### Requirement: Pedagogical Principle Enforcement
The system SHALL enforce the pedagogical progression: contextualização → conceito → analogia → exemplo visual → demonstração → experimentação → desafio → explicação → código TF.js → resumo.

#### Scenario: Lab structure compliance
- **WHEN** any lab is created
- **THEN** it declares which of the 10 pedagogical stages it includes
- **AND** stages are presented in the defined order
- **AND** skipping ahead shows contextual warning (soft gate)

### Requirement: Computational Transparency
The system SHALL provide an "Under the Hood" (Por baixo dos panos) view for every executable operation showing: input tensors, shapes, operation, output tensor, and equivalent TF.js code.

#### Scenario: Operation transparency
- **WHEN** user executes `tf.matMul(A, B)` in a lab
- **THEN** the system displays: Tensor A (values + shape), Tensor B (values + shape), operation (matMul), result tensor (values + shape), and the exact TF.js code
- **AND** this view is accessible without leaving the lab context

### Requirement: Memory Management as First-Class Citizen
The system SHALL teach TensorFlow.js memory management (tf.memory, tf.dispose, tf.tidy) through a dedicated lab and enforce it architecturally.

#### Scenario: Memory lab completion
- **WHEN** user completes the Memory Management lab
- **THEN** they can identify memory leaks in tensor code
- **AND** they understand when to use tf.tidy vs manual dispose
- **AND** they can read tf.memory() output

#### Scenario: Architectural enforcement
- **WHEN** any lab runs
- **THEN** framework wraps lab execution in tf.tidy or equivalent
- **AND** navigation away from lab triggers automatic tensor disposal
- **AND** lab declares memory budget; framework warns on exceedance

### Requirement: Local-First Privacy
The system SHALL store all user progress, experiment parameters, and learning analytics locally (localStorage) with no backend dependency in V1.

#### Scenario: Progress persistence
- **WHEN** user completes a lab stage
- **THEN** progress is saved to localStorage immediately
- **AND** returning to the lab restores experiment state
- **AND** no network request is made for progress tracking

### Requirement: V2 Challenge Architecture Readiness
The system SHALL architecturally support adding a Challenge system in V2 without refactoring core lab infrastructure.

#### Scenario: Challenge extensibility
- **WHEN** V2 Challenge system is designed
- **THEN** existing lab components can be reused as challenge building blocks
- **AND** lab configuration schema supports "challenge mode" variant
- **AND** progress tracking extends to challenge completion