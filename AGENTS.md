# Project Instructions

## Architecture

- Read the existing code before designing new abstractions.
- Prefer existing patterns over introducing new patterns.
- Avoid speculative architecture.
- Keep modules/components/services cohesive.
- Keep dependencies flowing in an intentional direction.

## Angular

- Follow the conventions of the current Angular major version.
- Prefer standalone APIs, signals and the established project conventions.
- Preserve the existing change-detection and state-management strategy unless the spec explicitly requires a change.
- Keep templates accessible and testable.
- Avoid putting business logic in templates.
- This project uses hash-based routing (`withHashLocation()`) so that it works as
  a static GitHub Pages project site; preserve that strategy unless a spec
  explicitly changes it.

## Testing

- The Angular unit/component test runner (Vitest) is used through `ng test`.
- Playwright is the browser/E2E test runner.
- New behavior should include meaningful automated tests.
- Prefer behavior-focused tests over implementation-detail tests.
- Do not weaken tests merely to make them pass.

## OpenSpec

OpenSpec is the source of truth for change intent.

Before coding:
1. Read the relevant change artifacts.
2. Understand the requirements and scenarios.
3. Inspect existing implementation patterns.

When implementation exposes a specification problem:
1. Do not silently reinterpret the requirement.
2. Report the conflict.
3. Revise the OpenSpec artifacts.
4. Revalidate.
5. Continue implementation.

## Workflow

For autonomous delivery of an OpenSpec change:

1. Validate the specification.
2. Implement tasks incrementally.
3. Run relevant tests.
4. Run OpenSpec verification.
5. Perform adversarial code review.
6. Correct code or specification as indicated.
7. Repeat until accepted.
8. Run the complete local CI gate (`npm run ci`).
9. Sync/archive the OpenSpec change when complete.

## Git safety

- Never push directly from an AI agent.
- Never rewrite shared history.
- Never expose secrets.
- Do not commit generated secrets, local environment files or credentials.

## Autonomy

When explicitly asked to deliver a complete OpenSpec change, continue through normal workflow phases automatically.

Stop only for a real business or architectural ambiguity that cannot be resolved from the current specification, codebase, repository instructions or established conventions.