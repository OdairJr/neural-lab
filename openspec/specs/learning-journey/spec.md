# Learning Journey Specification

## Purpose
Define the structured learning progression, lab map, prerequisite graph, and pedagogical flow for Neural Lab V1.

## Requirements

### Requirement: Lab Sequence Definition
The system SHALL define 16 labs in a specific learning order with explicit prerequisites.

#### Scenario: Lab 01 - Tensor Fundamentals
- **WHEN** user starts the platform
- **THEN** Lab 01 is available (no prerequisites)
- **THEN** lab covers: scalar, vector, matrix, multidimensional tensor, rank, shape, size, dtype
- **THEN** practical example: city temperatures over days
- **THEN** pedagogical stages: contextualização, conceito, analogia, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

#### Scenario: Lab 02 - Tensor Manipulation
- **WHEN** user completes Lab 01
- **THEN** Lab 02 unlocks
- **THEN** lab covers: reshape, flatten, expandDims, squeeze
- **THEN** practical example: reshaping temperature data for different analyses
- **THEN** pedagogical stages: conceito, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

#### Scenario: Lab 03 - Tensor Operations (Element-wise)
- **WHEN** user completes Lab 02
- **THEN** Lab 03 unlocks
- **THEN** lab covers: add, subtract, multiply, divide, power, sqrt
- **THEN** practical example: recipe ingredient costs (element-wise ops on vectors)
- **THEN** pedagogical stages: conceito, analogia, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

#### Scenario: Lab 04 - Reduction Operations
- **WHEN** user completes Lab 03
- **THEN** Lab 04 unlocks
- **THEN** lab covers: sum, mean, min, max (along axes)
- **THEN** practical example: analyzing temperature statistics across cities/days
- **THEN** pedagogical stages: conceito, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

#### Scenario: Lab 05 - Matrix Operations & Transpose
- **WHEN** user completes Lab 04
- **THEN** Lab 05 unlocks
- **THEN** lab covers: transpose, matrix multiplication (matMul)
- **THEN** practical example: product quantities × prices for cost calculation
- **THEN** pedagogical stages: conceito, analogia, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

#### Scenario: Lab 06 - Broadcasting
- **WHEN** user completes Lab 05
- **THEN** Lab 06 unlocks
- **THEN** lab covers: broadcasting rules, compatible shapes, implicit expansion
- **THEN** practical example: Celsius → Fahrenheit conversion for multiple cities
- **THEN** pedagogical stages: conceito, analogia, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

#### Scenario: Lab 07 - Applied Linear Algebra
- **WHEN** user completes Lab 06
- **THEN** Lab 07 unlocks
- **THEN** lab covers: vectors, matrices, dot product, linear transformations, element-wise vs matrix multiplication
- **THEN** practical example: 2D geometric transformations (rotation, scaling)
- **THEN** pedagogical stages: contextualização, conceito, analogia, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

#### Scenario: Lab 08 - Machine Learning Fundamentals
- **WHEN** user completes Lab 07
- **THEN** Lab 08 unlocks
- **THEN** lab covers: dataset, features, labels, training/validation split, prediction, loss, epoch, batch, learning rate
- **THEN** practical example: house price dataset exploration
- **THEN** pedagogical stages: contextualização, conceito, analogia, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

#### Scenario: Lab 09 - Linear Regression
- **WHEN** user completes Lab 08
- **THEN** Lab 09 unlocks
- **THEN** lab covers: y = wx + b, MSE loss, fitting line to data, prediction
- **THEN** practical example: house price prediction from square footage
- **THEN** pedagogical stages: contextualização, conceito, analogia, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

#### Scenario: Lab 10 - Gradient Descent
- **WHEN** user completes Lab 09
- **THEN** Lab 10 unlocks
- **THEN** lab covers: cost function, gradient, learning rate, weight updates, convergence, divergence, local minima
- **THEN** practical example: interactive gradient descent on MSE surface with adjustable learning rate
- **THEN** pedagogical stages: contextualização, conceito, analogia, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

#### Scenario: Lab 11 - The Neuron
- **WHEN** user completes Lab 10
- **THEN** Lab 11 unlocks
- **THEN** lab covers: inputs, weights, bias, weighted sum, activation, output
- **THEN** practical example: binary classification of synthetic 2D points
- **THEN** visual representation: input → weights → weighted sum → activation → output
- **THEN** pedagogical stages: contextualização, conceito, analogia, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

#### Scenario: Lab 12 - Activation Functions
- **WHEN** user completes Lab 11
- **THEN** Lab 12 unlocks
- **THEN** lab covers: Sigmoid, ReLU, Tanh, Softmax — formulas, graphs, use cases, derivatives
- **THEN** practical example: interactive function explorer with adjustable inputs
- **THEN** pedagogical stages: conceito, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

#### Scenario: Lab 13 - Neural Networks
- **WHEN** user completes Lab 12
- **THEN** Lab 13 unlocks
- **THEN** lab covers: input layer, hidden layers, output layer, forward propagation, loss, backpropagation, training loop
- **THEN** practical example: multi-class classification on spiral/moons datasets
- **THEN** pedagogical stages: contextualização, conceito, analogia, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

#### Scenario: Lab 14 - Classification & Decision Boundaries
- **WHEN** user completes Lab 13
- **THEN** Lab 14 unlocks
- **THEN** lab covers: binary/multi-class classification, decision boundary visualization, XOR problem demonstrating need for hidden layers
- **THEN** practical example: interactive 2D classifier with live decision boundary evolution during training
- **THEN** pedagogical stages: contextualização, conceito, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

#### Scenario: Lab 15 - Images as Tensors
- **WHEN** user completes Lab 14
- **THEN** Lab 15 unlocks
- **THEN** lab covers: image → pixels → tensor, shape, RGB channels, grayscale, resize, normalization
- **THEN** practical example: upload image → visualize as tensor → preprocess for ML
- **THEN** pedagogical stages: contextualização, conceito, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

#### Scenario: Lab 16 - Memory Management
- **WHEN** user completes Lab 15
- **THEN** Lab 16 unlocks
- **THEN** lab covers: tf.memory(), tf.dispose(), tf.tidy(), common leaks, best practices
- **THEN** practical example: memory leak demonstration + fix with tf.tidy
- **THEN** pedagogical stages: contextualização, conceito, exemplo visual, demonstração, experimentação, desafio, explicação, código, resumo

### Requirement: Prerequisite Graph
The system SHALL maintain a directed acyclic graph of lab prerequisites.

#### Scenario: Prerequisite enforcement (soft gate)
- **WHEN** user attempts Lab N without completing Lab N-1
- **THEN** system allows access but shows contextual warning: "This lab assumes knowledge from Lab X. Recommended: complete Lab X first."
- **AND** warning includes one-click navigation to prerequisite lab
- **AND** progress tracking marks "prerequisite gap" for analytics

#### Scenario: Prerequisite visualization
- **WHEN** user views lab map
- **THEN** they see visual graph: Lab 1 → Lab 2 → ... → Lab 16
- **AND** completed labs shown in green, current in blue, locked in gray
- **AND** hovering a lab shows its prerequisite chain

### Requirement: Pedagogical Stage Template
The system SHALL define a standard pedagogical stage structure that each lab implements selectively.

#### Scenario: Stage definitions
- **WHEN** lab author creates content
- **THEN** they choose from these stages:
  1. **Contextualization**: Why this matters, real-world hook
  2. **Concept**: Formal definition with minimal math
  3. **Analogy**: Intuitive comparison to familiar domain
  4. **Visual Example**: Static or interactive diagram illustrating concept
  5. **Demonstration**: Guided walkthrough with predefined inputs
  6. **Experimentation**: User adjusts parameters, observes results
  7. **Challenge**: Specific task with success criteria
  8. **Explanation**: Why the result occurred, connecting to concept
  9. **TF.js Code**: Equivalent production code with annotations
  10. **Summary**: Key takeaways, connections to next lab

#### Scenario: Stage optionality
- **WHEN** a lab doesn't need a stage (e.g., no analogy for reshape)
- **THEN** lab config omits that stage
- **THEN** UI gracefully skips missing stages
- **AND** no empty placeholder shown

### Requirement: Learning Progress Tracking
The system SHALL track granular progress per lab per stage.

#### Scenario: Stage completion
- **WHEN** user completes a stage (scrolls through, interacts with experiment, passes challenge)
- **THEN** stage marked complete in localStorage
- **THEN** lab progress = completed stages / total stages in lab
- **THEN** overall journey progress = weighted average across labs

#### Scenario: Challenge validation
- **WHEN** user attempts a challenge
- **THEN** system validates answer against expected criteria
- **THEN** on success: stage marked complete, celebration feedback
- **THEN** on failure: contextual hint offered, retry allowed unlimited

### Requirement: Concept Glossary
The system SHALL maintain a searchable glossary of ML/TensorFlow.js terms linked from labs.

#### Scenario: Inline glossary access
- **WHEN** user encounters highlighted term (e.g., "broadcasting")
- **THEN** click/tap shows inline definition with visual
- **THEN** "View full entry" navigates to glossary page
- **AND** glossary entry shows: definition, visual, related labs, TF.js API