# Neural Lab — Project Context

## Overview
Neural Lab is an educational interactive web platform for teaching Machine Learning, Neural Networks, and TensorFlow.js fundamentals through hands-on labs and interactive visualizations.

## Tech Stack
- **Framework**: Angular 22+ (Angular CLI single application, standalone + signals)
- **Language**: TypeScript (strict mode)
- **ML Engine**: TensorFlow.js 4.x (WebGL/WebGPU/CPU backends)
- **Visualization**: Custom Canvas/WebGL + Chart.js for metrics
- **Styling**: Tailwind CSS 4.x
- **Testing**: Angular unit-test runner (Vitest) via `ng test` + Playwright (E2E)
- **Package Manager**: npm

## Architecture Principles
- **Content-First**: Educational content as declarative TypeScript/JSON configs, separated from presentation components
- **Lab as Lazy Feature**: Each lab is a lazy-loaded Angular feature (standalone routes) inside `features/labs`
- **State Isolation**: Lab state fully isolated; navigation triggers complete disposal (tf.dispose)
- **Memory Budget**: Each lab declares memory budget; framework enforces via tf.tidy wrappers
- **Visualization Contracts**: Standardized interface for visualizations (input tensors/config → canvas/SVG + events)
- **Code-View Generation**: TF.js code generated from execution trace, not hardcoded
- **Local-First**: All progress stored in localStorage; no backend in V1

## Pedagogical Principles
1. **Concept → Example → Experiment → Challenge → Explanation → Code**
2. **Never "here's a tensor, do something"** — always explain what/why first
3. **Visualization as bridge**: Abstract math → Visual → Code
4. **Safe experimentation**: Adjustable parameters with guardrails + immediate feedback
5. **Computational transparency**: "Under the hood" panel always accessible
6. **Memory as first-class citizen**: TF.js memory management taught explicitly

## Target Audience
- Primary: Developers with basic/intermediate JS/TS starting ML
- Secondary: CS/Engineering students, instructors
- Language: PT-BR (V1)

## Scope V1
16 Labs: Tensor Fundamentals → Tensor Manipulation → Element-wise Operations → Reductions → Matrix Operations → Broadcasting → Applied Linear Algebra → ML Fundamentals → Linear Regression → Gradient Descent → The Neuron → Activation Functions → Neural Networks → Classification & Decision Boundaries → Images as Tensors → Memory Management

## Out of Scope V1
- Challenges system (V2)
- Gamification (V2)
- Backend/Cloud sync (V2)
- Mobile-first (responsive only)
- i18n (PT-BR only)
- Model import/export
- Custom dataset upload

## Key Risks
- Tensor visualization complexity > 3D
- TF.js WebGL memory leaks in long sessions
- Training blocking UI thread
- Pedagogical scope creep