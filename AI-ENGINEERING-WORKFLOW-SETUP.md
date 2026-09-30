# AI Engineering Workflow Setup

## OpenCode + OpenSpec + Angular + Jest + Playwright + GitHub Pages

**Purpose:** use this document as a setup/runbook for an AI coding agent to configure a new Angular project with a small, professional, extensible agent workflow.

**Primary objective:** create a simple autonomous loop:

```text
Idea
  -> OpenSpec proposal/spec/design/tasks
  -> specification validation
  -> implementation
  -> OpenSpec verification
  -> adversarial code review
  -> code correction OR specification correction
  -> repeat until accepted
  -> local CI gate
  -> GitHub CI
  -> GitHub Pages deployment
```

The workflow must remain easy to understand and easy to extend. Do not introduce a custom agent framework, database, event bus, Docker, or custom orchestration service in this first version.

---

## 1. Target stack

The project is expected to use:

- Angular: latest stable release available when the project is initialized.
- TypeScript: the version required/compatible with that Angular release.
- Node.js: a supported LTS version, pinned through `.nvmrc` or equivalent after checking Angular compatibility.
- Package manager: npm unless the repository already standardizes on another package manager.
- Unit/component tests: Jest.
- E2E/browser tests: Playwright.
- CI/CD: GitHub Actions.
- Hosting: GitHub Pages.
- Containerization: **not used**.
- Specification: OpenSpec.
- AI development workflow: OpenCode V2 project agents and custom commands.

At the time this document was written, Angular's supported-release schedule lists Angular 22 as the current actively supported major release. Do not hardcode a major/minor version in the workflow; resolve the latest compatible release at project creation time and record the result in `package-lock.json`, `.nvmrc`, and the project's documentation.

---

## 2. Important architectural decisions

### 2.1 OpenSpec is the source of truth for change intent

OpenSpec defines **what** should be built:

```text
proposal
specs
 design
tasks
```

Application source code must not silently reinterpret the intended behavior. If implementation reveals that the specification is wrong or ambiguous, update the OpenSpec artifacts first, validate them, and then continue implementation.

### 2.2 OpenCode is the orchestrator

OpenCode coordinates specialized agents. It should not contain a giant monolithic system prompt that tries to perform specification, implementation, review, CI, and deployment simultaneously.

### 2.3 Specialized subagents

Use only four project agents initially:

```text
orchestrator      primary
spec-engineer     subagent
implementer       subagent
reviewer          subagent
```

Responsibilities:

```text
orchestrator
  owns the workflow state and loop

spec-engineer
  owns OpenSpec artifacts only

implementer
  owns application implementation and tests

reviewer
  owns read-only adversarial review
```

### 2.4 CI/CD is outside the agent graph

The AI agent may run the same checks locally through `npm run ci`, but the authoritative delivery boundary remains GitHub Actions.

The agent must never push or deploy directly in this first version.

### 2.5 GitHub Pages is static hosting

Do not introduce a server runtime merely to host the Angular application.

Use GitHub Pages' custom GitHub Actions workflow and the official Pages artifact/deployment actions.

### 2.6 Routing strategy for the first version

For a GitHub Pages **project site** (`https://OWNER.github.io/REPOSITORY/`), use Angular hash routing unless there is a concrete reason to implement a custom SPA fallback.

With modern Angular standalone routing, prefer:

```ts
provideRouter(routes, withHashLocation())
```

If the existing project uses `RouterModule.forRoot`, preserve its architecture and use the equivalent hash-location configuration.

This avoids server-side deep-link rewrite requirements on GitHub Pages.

The Angular build still needs the repository base path for static assets. The deployment workflow must compute and pass the correct `--base-href`.

If the repository is a user/organization Pages site named `<owner>.github.io`, use `/` as the base href instead of `/<repository>/`.

---

## 3. Required final repository structure

Create or update the project to approximately this structure:

```text
project/
├── AGENTS.md
├── opencode.jsonc
├── package.json
├── package-lock.json
├── .nvmrc
│
├── .opencode/
│   ├── agents/
│   │   ├── orchestrator.md
│   │   ├── spec-engineer.md
│   │   ├── implementer.md
│   │   └── reviewer.md
│   └── commands/
│       └── deliver.md
│
├── openspec/
│   ├── config.yaml
│   ├── specs/
│   └── changes/
│
├── playwright.config.ts
├── setup-jest.ts
├── jest.config.ts
│
├── src/
│   └── ...
│
└── .github/
    └── workflows/
        └── ci-cd.yml
```

Do not create Docker files unless the repository already requires Docker for some unrelated development reason.

---

# 4. Setup procedure for the AI coding agent

Follow these steps in order.

## Step 0 — inspect before changing anything

First inspect:

```bash
node --version
npm --version
ng version
cat package.json
cat angular.json
find . -maxdepth 2 -name 'AGENTS.md' -o -name 'opencode.jsonc' -o -name 'openspec'
git status --short
```

Also identify:

- Angular version.
- Angular application/project name.
- Build target and builder.
- Build output directory.
- Existing router configuration.
- Existing test framework.
- Existing lint configuration.
- Package manager and lockfile.
- Node version policy.
- Whether the repository is an application or Nx workspace.

### Critical rule

Do not overwrite an existing engineering setup blindly.

If the repository already contains Jest, Playwright, ESLint, OpenSpec, OpenCode, or AGENTS.md, reconcile with the existing configuration instead of creating duplicate files.

If the project is new, initialize the latest Angular CLI/application setup.

---

# 5. Angular initialization

For a new project, resolve the latest CLI at execution time:

```bash
npx @angular/cli@latest new <PROJECT_NAME>
```

Enable routing when the application needs multiple routes.

Prefer the current Angular standalone application structure unless the project explicitly requires another architecture.

After initialization:

```bash
ng version
npm install
npm run build
```

Do not upgrade an existing project's Angular major version merely because this document mentions the latest version. A major upgrade is a separate migration task.

---

# 6. Node.js version

Choose a supported Node.js LTS version compatible with the exact Angular release selected by the project.

Create `.nvmrc` using that version, for example:

```text
<SUPPORTED_NODE_LTS>
```

Do not invent the value. Determine it from the current Angular compatibility table, then use the same version in development and CI.

For GitHub Actions prefer:

```yaml
- uses: actions/setup-node@v6
  with:
    node-version-file: .nvmrc
    cache: npm
```

This keeps local and CI Node versions aligned.

---

# 7. Initialize OpenSpec

Install OpenSpec according to its current official installation instructions.

The current documented global installation is:

```bash
npm install -g @fission-ai/openspec@latest
```

Initialize it for OpenCode:

```bash
openspec init --tools opencode
```

Enable the expanded workflow so `/opsx:verify` is available.

OpenSpec currently stores workflow-profile selection globally. Because the custom workflow picker is interactive, this is the one setup action that may require the developer to perform once on the machine:

```bash
openspec config profile
```

In the picker, keep delivery enabled for both skills and commands, and enable these workflow capabilities:

```text
propose
explore
new
continue
apply
update
ff
sync
archive
verify
bulk-archive (optional)
onboard (optional)
```

Then apply the selected profile to the project:

```bash
openspec update
```

For a non-interactive setup after the global custom workflow selection already exists, initialize with:

```bash
openspec init --tools opencode --profile custom
```

Use the current OpenSpec profile/configuration mechanism rather than manually copying obsolete command files.

The desired workflow capabilities are:

```text
propose
explore
new
continue
apply
update
ff
sync
archive
verify
```

Do not manually recreate OpenSpec-generated skills/commands unless there is a concrete project-specific reason.

Verify installation:

```bash
openspec --version
openspec validate --all --strict --no-interactive
```

---

# 8. OpenSpec configuration

Create or reconcile `openspec/config.yaml`.

Use the project's actual architecture and domain. The baseline configuration should communicate these engineering principles:

```yaml
schema: spec-driven

context: |
  This project follows a specification-driven development workflow.

  Engineering principles:
  - Prefer the simplest solution that satisfies the requirement.
  - Preserve existing architecture and project conventions.
  - Reuse existing components, services, utilities and abstractions before creating new ones.
  - Avoid speculative abstractions.
  - Keep responsibilities explicit and cohesive.
  - Prefer composition over unnecessary inheritance.
  - Treat tests as part of the feature, not as an afterthought.
  - Requirements describe observable behavior.
  - Design documents should explain important architectural decisions and trade-offs.
  - Tasks should be small, concrete and verifiable.

rules:
  proposal:
    - Clearly describe the problem, objective and scope.
    - Avoid introducing technical requirements that are not justified by the problem.

  specs:
    - Requirements must describe observable behavior.
    - Each requirement should contain verifiable scenarios.
    - Avoid specifying implementation details unless implementation behavior is itself part of the contract.

  design:
    - Prefer existing architectural patterns.
    - Document meaningful trade-offs.
    - Avoid introducing new infrastructure without a concrete need.

  tasks:
    - Keep tasks small and independently verifiable.
    - Include tests for new or changed behavior where appropriate.
    - Do not mark tasks complete before verification.
```

Adapt the wording to the real application. Do not overwrite domain-specific rules supplied by the project.

---

# 9. `AGENTS.md`

Create or update the root `AGENTS.md`.

The goal is concise persistent project guidance, not another giant prompt.

Use this baseline and adapt it after inspecting the repository:

```md
# Project Instructions

## Architecture

- Read the existing code before designing new abstractions.
- Prefer existing patterns over introducing new patterns.
- Avoid speculative architecture.
- Keep modules/components/services cohesive.
- Keep dependencies flowing in an intentional direction.

## Angular

- Follow the conventions of the current Angular major version.
- Prefer standalone APIs when they are the established project convention.
- Preserve the existing change-detection and state-management strategy unless the spec explicitly requires a change.
- Keep templates accessible and testable.
- Avoid putting business logic in templates.

## Testing

- Jest is the unit/component test runner.
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
8. Run the complete local CI gate.
9. Sync/archive the OpenSpec change when complete.

## Git safety

- Never push directly from an AI agent.
- Never rewrite shared history.
- Never expose secrets.
- Do not commit generated secrets, local environment files or credentials.

## Autonomy

When explicitly asked to deliver a complete OpenSpec change, continue through normal workflow phases automatically.

Stop only for a real business or architectural ambiguity that cannot be resolved from the current specification, codebase, repository instructions or established conventions.
```

Do not duplicate every rule from each agent inside `AGENTS.md`. Keep the root file focused on project-level rules.

---

# 10. OpenCode V2 configuration

Use **OpenCode V2 syntax**.

Do not use legacy V1 fields such as:

```text
permission
bash
prompt
maxSteps
```

For new V2 configuration use:

```text
permissions
shell
system/body of Markdown agent
steps
subagent
```

The project configuration should be minimal.

Create `opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "default_agent": "orchestrator",

  "permissions": [
    {
      "action": "read",
      "resource": "*",
      "effect": "allow"
    },
    {
      "action": "glob",
      "resource": "*",
      "effect": "allow"
    },
    {
      "action": "grep",
      "resource": "*",
      "effect": "allow"
    },
    {
      "action": "shell",
      "resource": "*",
      "effect": "ask"
    },
    {
      "action": "shell",
      "resource": "git status *",
      "effect": "allow"
    },
    {
      "action": "shell",
      "resource": "git diff *",
      "effect": "allow"
    },
    {
      "action": "shell",
      "resource": "git diff --check",
      "effect": "allow"
    },
    {
      "action": "shell",
      "resource": "git push *",
      "effect": "deny"
    },
    {
      "action": "subagent",
      "resource": "*",
      "effect": "deny"
    },
    {
      "action": "subagent",
      "resource": "spec-engineer",
      "effect": "allow"
    },
    {
      "action": "subagent",
      "resource": "implementer",
      "effect": "allow"
    },
    {
      "action": "subagent",
      "resource": "reviewer",
      "effect": "allow"
    }
  ]
}
```

Important:

- The broad `subagent` deny must come before the explicit allows.
- Rules are order-sensitive; the last matching rule wins.
- Do not automatically allow arbitrary shell commands just to make the workflow convenient.
- The agent can request approval for commands not explicitly allowed.

---

# 11. `orchestrator` agent

Create `.opencode/agents/orchestrator.md`.

```md
---
description: Orchestrates OpenSpec delivery from validation through implementation, review and CI
mode: primary
steps: 50
---

You are the workflow orchestrator for this project.

Your job is to drive one OpenSpec change to a verified, reviewed and CI-clean state.

You are a coordinator, not the default implementation author.
Prefer delegating specialized work to subagents.

## Workflow

Given an OpenSpec change <CHANGE>:

### 1. Specification gate

Run:

openspec validate <CHANGE> --strict --no-interactive

If validation fails:

1. Invoke `spec-engineer`.
2. Give it the validation findings.
3. Ask it to correct only the OpenSpec artifacts.
4. Validate again.
5. Repeat until valid.

Do not implement while the specification gate is failing.

### 2. Implementation

Invoke `implementer` with the change name and implementation instructions.

The implementer must:
- inspect the existing code first
- read proposal, specs, design and tasks
- implement incrementally
- write/update tests
- verify its changes
- update task completion only after verification

### 3. OpenSpec verification

Run the project's OpenSpec verification workflow for the current change.

The verification result must be evaluated for:
- completeness
- correctness
- coherence

If implementation is incomplete, invoke `implementer`.

If the artifacts are wrong or inconsistent, invoke `spec-engineer`.

### 4. Adversarial review

Invoke `reviewer`.

The reviewer may only inspect; it must not modify files.

Allowed outcomes:

PASS
FIX_CODE
REVISE_SPEC

### 5. Correction loop

For `FIX_CODE`:

1. invoke `implementer`
2. apply the findings
3. re-run OpenSpec verification
4. invoke `reviewer` again

For `REVISE_SPEC`:

1. invoke `spec-engineer`
2. revalidate OpenSpec
3. invoke `implementer` for required changes
4. verify again
5. review again

For `PASS`, continue.

### 6. Local CI gate

Run:

npm run ci

If the command fails:

1. identify the failure category
2. invoke `implementer`
3. fix the issue
4. run the failing check again
5. run `npm run ci` again

Never declare the change complete while CI is failing.

### 7. Finalization

When all gates pass:

- verify all intended tasks are complete
- run the final verification
- use the OpenSpec sync/archive workflow
- do not push
- summarize exactly what changed and what was verified

## Rules

- Never silently change requirements.
- Never bypass a failing test or lint rule.
- Never declare success because code merely compiles.
- Never push or deploy.
- Avoid unrelated refactors.
- Keep iteration focused on the active change.
- Stop only for a genuine unresolved business/architecture ambiguity.
```

Note: use the OpenSpec slash/skill commands actually installed in the repository. Do not invent CLI subcommands for workflow operations that are agent commands.

---

# 12. `spec-engineer` agent

Create `.opencode/agents/spec-engineer.md`:

```md
---
description: Creates and corrects OpenSpec artifacts without modifying application code
mode: subagent
steps: 25
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: edit
    resource: "openspec/**"
    effect: allow
  - action: shell
    resource: "*"
    effect: deny
  - action: shell
    resource: "openspec validate *"
    effect: allow
  - action: read
    resource: "*"
    effect: allow
  - action: glob
    resource: "*"
    effect: allow
  - action: grep
    resource: "*"
    effect: allow
---

You are the specification engineer.

Your responsibility is to make the OpenSpec change coherent, precise and implementable.

You may modify OpenSpec artifacts only.
Never modify application source code.

Inspect:
- proposal
- specs
- design
- tasks
- relevant project architecture
- validation findings

Check:
- scope
- requirement clarity
- scenario completeness
- consistency among artifacts
- implementability
- architectural coherence
- unnecessary complexity

Rules:
- Do not invent business requirements.
- Do not broaden the scope.
- Prefer the smallest clarification/change that resolves the problem.
- Preserve valid existing requirements.

Return:

STATUS: PASS
or
STATUS: REVISED

Then summarize the exact artifact changes.
```

Because permissions are additive and order-sensitive, validate the resulting permission behavior in OpenCode after creating the file.

---

# 13. `implementer` agent

Create `.opencode/agents/implementer.md`:

```md
---
description: Implements OpenSpec changes incrementally with tests and verification
mode: subagent
steps: 50
permissions:
  - action: read
    resource: "*"
    effect: allow
  - action: glob
    resource: "*"
    effect: allow
  - action: grep
    resource: "*"
    effect: allow
  - action: edit
    resource: "*"
    effect: allow
  - action: shell
    resource: "*"
    effect: ask
  - action: shell
    resource: "git status *"
    effect: allow
  - action: shell
    resource: "git diff *"
    effect: allow
  - action: shell
    resource: "git diff --check"
    effect: allow
  - action: shell
    resource: "npm run lint*"
    effect: allow
  - action: shell
    resource: "npm run test*"
    effect: allow
  - action: shell
    resource: "npm run build*"
    effect: allow
  - action: shell
    resource: "npm run ci*"
    effect: allow
  - action: shell
    resource: "npx jest*"
    effect: allow
  - action: shell
    resource: "npx playwright *"
    effect: allow
  - action: shell
    resource: "git push *"
    effect: deny
---

You are the implementation engineer.

Read before editing:
- AGENTS.md
- relevant OpenSpec change
- existing architecture
- relevant source files
- relevant tests

Implement only the intended change.

## Implementation rules

1. Preserve existing architecture where possible.
2. Prefer small, explicit changes.
3. Reuse existing components/services/utilities before creating new ones.
4. Do not introduce new dependencies unless justified by the specification.
5. Add or update meaningful Jest tests for unit/component behavior.
6. Add or update Playwright tests for user-visible/browser behavior where appropriate.
7. Do not weaken existing tests to force success.
8. Keep formatting/linting clean.
9. Do not make unrelated refactors.

After each meaningful increment:
- run focused tests
- inspect the diff
- fix failures

Only mark OpenSpec tasks complete after verification.

If the implementation reveals a specification problem, return:

STATUS: SPEC_PROBLEM

Explain:
- the affected requirement
- the conflict
- the evidence in the current code/architecture
- the smallest specification change that would resolve it

Do not silently reinterpret requirements.
```

---

# 14. `reviewer` agent

Create `.opencode/agents/reviewer.md`:

```md
---
description: Adversarial read-only reviewer for OpenSpec implementations
mode: subagent
steps: 25
permissions:
  - action: read
    resource: "*"
    effect: allow
  - action: glob
    resource: "*"
    effect: allow
  - action: grep
    resource: "*"
    effect: allow
  - action: edit
    resource: "*"
    effect: deny
  - action: shell
    resource: "*"
    effect: deny
  - action: shell
    resource: "git status *"
    effect: allow
  - action: shell
    resource: "git diff *"
    effect: allow
  - action: shell
    resource: "git diff --check"
    effect: allow
  - action: shell
    resource: "npm run lint*"
    effect: allow
  - action: shell
    resource: "npm run test*"
    effect: allow
  - action: shell
    resource: "npm run build*"
    effect: allow
---

You are an adversarial software reviewer.

Do not modify any files.

Review the OpenSpec change against the implementation.

Inspect:
- requirements
- scenarios
- design
- tasks
- implementation
- tests
- regression risks
- edge cases
- accessibility implications for user-facing UI
- architecture coherence
- unrelated changes

Try to disprove correctness rather than simply confirm that the code exists.

Classify the result as exactly one of:

PASS
FIX_CODE
REVISE_SPEC

For FIX_CODE, report:
- problem
- evidence
- affected file(s)
- expected behavior
- suggested correction

For REVISE_SPEC, report:
- conflicting requirement
- why implementation cannot satisfy the current artifacts
- smallest specification clarification/change

Do not treat personal stylistic preferences as blocking defects.
```

---

# 15. `/deliver` command

Create `.opencode/commands/deliver.md`:

```md
---
description: Execute an OpenSpec change from validation through CI-ready completion
agent: orchestrator
---

Execute the complete delivery workflow for the OpenSpec change:

$ARGUMENTS

Operate autonomously through normal workflow phases.

Do not ask for confirmation between normal phases.

Use subagents for specification, implementation and review.

Repeat the correction loop until the change passes verification, review and local CI.

Ask the user only for a genuine business or architectural ambiguity that cannot be resolved from the OpenSpec artifacts, project instructions, existing code or established conventions.
```

Usage:

```text
/deliver add-user-profile
```

---

# 16. Jest setup

Angular does not provide Jest as its default test runner, so configure Jest explicitly using the current `jest-preset-angular` guidance compatible with the project's Angular/TypeScript/Node versions.

Install:

```bash
npm install -D jest jest-preset-angular @types/jest jest-environment-jsdom jsdom
```

Use the current preset documentation to create:

```text
jest.config.ts
setup-jest.ts
```

Baseline setup for a zone-based Angular test environment:

```ts
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();
```

Baseline CJS-style Jest config:

```ts
import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets';

export default {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
} satisfies Config;
```

If the project uses ESM semantics, use the ESM configuration shown by the current `jest-preset-angular` documentation rather than forcing CJS.

Create/update package scripts:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --ci",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

The implementation agent should adapt these scripts to the project's package manager and workspace style.

## Jest acceptance criteria

The agent must verify:

```bash
npm run test:unit
```

passes with at least one real Angular unit/component test.

Do not create fake tests solely to satisfy the workflow.

---

# 17. Playwright setup

Install the latest Playwright test package at setup time:

```bash
npm install -D @playwright/test@latest
npx playwright install chromium
```

For local development, Chromium is sufficient for the first workflow version.

Create `playwright.config.ts`.

Use the project's actual production build output directory when configuring the static server.

Baseline configuration:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'python3 -m http.server 4173 --directory <DIST_BROWSER_DIR>',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
```

Replace `<DIST_BROWSER_DIR>` with the actual Angular production browser output discovered during setup.

This uses Python's standard library as a tiny static server in CI, so Docker or an additional static-server dependency is unnecessary.

Create at least one real smoke test in `e2e/`, for example:

```ts
import { test, expect } from '@playwright/test';

test('application loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
});
```

Adapt the assertion to the actual application instead of keeping a meaningless placeholder.

CI script:

```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui"
  }
}
```

## Playwright acceptance criteria

Verify:

```bash
npx playwright test
```

The CI configuration should install only the browser actually used in the first version:

```bash
npx playwright install chromium --with-deps
```

Use one CI worker for predictable resource usage initially. Increase parallelism or introduce sharding only when the suite has grown enough to justify it.

---

# 18. NPM scripts and local CI contract

The exact Angular commands depend on the generated workspace. Detect the project name rather than inventing it.

The final `package.json` must expose one canonical local CI command:

```json
{
  "scripts": {
    "lint": "<project-lint-command>",
    "test:unit": "jest --ci",
    "e2e": "playwright test",
    "build": "<project-production-build-command>",
    "openspec:validate": "openspec validate --all --strict --no-interactive",
    "ci": "npm run openspec:validate && npm run lint && npm run test:unit && npm run build && npm run e2e"
  }
}
```

The agent must replace placeholder commands with commands that really work in this repository.

### Important

Do not add a fake `typecheck` command just because the workflow diagram contains the word typecheck.

For Angular, production build compilation is already a strong compiler/template gate. If the project benefits from a separate TypeScript-only check, add it deliberately and document why.

After defining scripts, run:

```bash
npm run ci
```

and keep fixing issues until the command is green.

---

# 19. GitHub Pages configuration

Use the GitHub Pages **GitHub Actions** publishing source.

Repository settings:

```text
Settings
  -> Pages
  -> Build and deployment
  -> Source: GitHub Actions
```

Do not use the old `gh-pages` branch deployment approach for this baseline.

The workflow must use:

```text
actions/configure-pages@v5
actions/upload-pages-artifact@v4
actions/deploy-pages@v4
```

The deploy job must grant:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

Use the `github-pages` environment for the deployment.

Protect the deployment environment so only the intended branch can deploy when the repository setup allows it.

---

# 20. GitHub Actions CI/CD workflow

Create `.github/workflows/ci-cd.yml`.

The first version should use a single workflow so the dependency chain is easy to understand.

Baseline:

```yaml
name: CI / CD

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main
  workflow_dispatch:

concurrency:
  group: pages-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Quality
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Validate OpenSpec
        run: npm run openspec:validate

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm run test:unit

  build-and-e2e:
    name: Build and E2E
    needs: quality
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Chromium
        run: npx playwright install chromium --with-deps

      - name: Compute GitHub Pages base href
        id: pages-meta
        shell: bash
        run: |
          REPO_NAME="${GITHUB_REPOSITORY#*/}"
          OWNER_NAME="${GITHUB_REPOSITORY_OWNER}"

          if [[ "$REPO_NAME" == "${OWNER_NAME}.github.io" ]]; then
            echo "base_href=/" >> "$GITHUB_OUTPUT"
          else
            echo "base_href=/${REPO_NAME}/" >> "$GITHUB_OUTPUT"
          fi

      - name: Build production application
        run: |
          npx ng build \
            --configuration production \
            --base-href "${{ steps.pages-meta.outputs.base_href }}"

      - name: Run Playwright
        run: npm run e2e

      - name: Upload Playwright report
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v5
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

      - name: Configure GitHub Pages
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: actions/configure-pages@v5

      - name: Upload GitHub Pages artifact
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v4
        with:
          path: <DIST_BROWSER_DIR>

  deploy:
    name: Deploy to GitHub Pages
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: build-and-e2e
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy GitHub Pages artifact
        id: deployment
        uses: actions/deploy-pages@v4
```

Replace `<DIST_BROWSER_DIR>` with the actual build output directory.

Do not blindly assume it is the same across every Angular workspace.

---

# 21. Why the CI/CD order matters

The intended dependency graph is:

```text
                   pull request / main push
                             |
                             v
                         QUALITY
                /            |            \
          OpenSpec          lint        Jest
                \            |            /
                 \           |           /
                  +------ PASS --------+
                             |
                             v
                       BUILD + E2E
                             |
                +------------+------------+
                |                         |
             PR only                 main push
                |                         |
               STOP                      v
                                  Pages artifact
                                        |
                                        v
                                      DEPLOY
```

This means:

- Pull requests prove the code is healthy but do not deploy.
- Main branch pushes deploy only after quality, build and E2E pass.
- The agent never has to possess a GitHub deployment secret.
- GitHub's deployment identity/permissions control the final deployment boundary.

---

# 22. OpenSpec + CI relationship

Do not require that every local OpenSpec change be archived before running tests.

Instead:

- OpenSpec validates the specification structure and change deltas.
- The implementation loop verifies the current change.
- CI validates the repository as a whole.

When a change is completed, use the OpenSpec workflow for:

```text
sync
archive
```

Do not invent custom scripts to mutate OpenSpec internals unless the project later requires them.

---

# 23. Agent graph

The final workflow should behave like this:

```text
                 /deliver CHANGE
                       |
                       v
                +--------------+
                | ORCHESTRATOR |
                +------+-------+
                       |
                       v
                SPEC VALIDATION
                       |
              +--------+--------+
              |                 |
            PASS              FAIL
              |                 |
              |          +------v-------+
              |          | SPEC ENGINEER|
              |          +------+-------+
              |                 |
              |             validate
              |                 |
              +<----------------+
              |
              v
         IMPLEMENTER
              |
              v
        OPENSPEC VERIFY
              |
          +---+---+
          |       |
       correct  wrong spec
          |       |
          v       v
    IMPLEMENTER SPEC ENGINEER
          |       |
          +---+---+
              |
              v
           REVIEWER
              |
      +-------+--------+
      |       |        |
     PASS FIX_CODE REVISE_SPEC
      |       |        |
      |       v        v
      | IMPLEMENTER  SPEC ENGINEER
      |       |        |
      +-------+--------+
              |
              v
             CI
              |
         +----+----+
         |         |
       PASS      FAIL
         |         |
         v         v
       DONE    IMPLEMENTER
```

This is intentionally a graph represented by agent decisions rather than by a custom orchestration runtime.

---

# 24. Completion criteria

A `/deliver CHANGE` execution is complete only when all of the following are true:

```text
[ ] OpenSpec validation passes
[ ] proposal/spec/design/tasks are coherent
[ ] all intended tasks are complete
[ ] implementation is present
[ ] meaningful Jest tests pass
[ ] Playwright tests pass when applicable
[ ] OpenSpec verification passes
[ ] adversarial reviewer returns PASS
[ ] npm run ci passes
[ ] OpenSpec sync/archive workflow is complete
[ ] no unintended unrelated changes remain
[ ] no git push performed by the AI agent
```

---

# 25. Failure handling rules

## Specification failure

```text
validate fails
  -> spec-engineer
  -> validate again
```

## Implementation failure

```text
reviewer = FIX_CODE
  -> implementer
  -> verify
  -> reviewer
```

## Specification/design failure discovered during implementation

```text
implementer = SPEC_PROBLEM
  -> spec-engineer
  -> validate
  -> implementer
  -> verify
  -> reviewer
```

## CI failure

```text
npm run ci fails
  -> identify failing stage
  -> implementer
  -> rerun failing stage
  -> rerun npm run ci
```

Never solve failures by:

- disabling tests
- weakening lint rules
- deleting assertions
- skipping verification
- suppressing compilation errors
- marking incomplete OpenSpec tasks as complete

unless a human explicitly changes the project requirement.

---

# 26. First-run validation checklist

After setup, the AI agent must prove the setup works.

## OpenCode

Verify that these agents are discovered:

```text
orchestrator
spec-engineer
implementer
reviewer
```

Verify that `/deliver` appears as a custom command.

## OpenSpec

Run:

```bash
openspec --version
openspec validate --all --strict --no-interactive
```

Confirm the expected OpenSpec commands are installed for the selected workflow profile.

## Jest

Run:

```bash
npm run test:unit
```

## Playwright

Run:

```bash
npx playwright install chromium
npm run e2e
```

## Local CI

Run:

```bash
npm run ci
```

## GitHub Pages

Push to a feature branch and open a pull request.

Confirm:

- Quality job passes.
- Build/E2E job passes.
- Deployment is not triggered.

Merge to `main`.

Confirm:

- Quality job passes.
- Production build passes.
- Playwright passes.
- Pages artifact is produced.
- Deployment succeeds.

---

# 27. First end-to-end OpenSpec test

After the platform setup is green, create a tiny real change to test the entire AI workflow.

Example:

```text
/opsx:propose add-health-status-page
```

Review the generated artifacts.

Then run:

```text
/deliver add-health-status-page
```

The expected sequence is:

```text
orchestrator
 -> validation
 -> implementer
 -> verify
 -> reviewer
 -> CI
 -> OpenSpec finalization
```

Do not test the orchestration only with an artificial task that makes no source change. Use a small but real feature so the tests exercise the complete lifecycle.

---

# 28. Extension points for V2

Do not implement these yet. Keep the architecture ready for them.

Possible next agents:

```text
architecture-reviewer
security-reviewer
performance-reviewer
test-engineer
accessibility-reviewer
```

Possible future graph:

```text
                  reviewer
               /     |      \
       architecture security  tests
               \      |       /
                +-----+------+
                      |
                    result
```

Other future improvements:

- parallel reviewer subagents
- agent-specific model selection
- structured review result files
- CI result ingestion
- pull-request automation
- change-risk classification
- test impact analysis
- cost/step budgets
- human escalation states
- release notes generation

Do not add them until V1 is reliable.

---

# 29. Operational philosophy

The system should optimize for **clarity before autonomy**.

Good:

```text
few agents
clear responsibilities
explicit gates
observable loop
external CI/CD
```

Bad first-version design:

```text
many agents
hidden state
nested supervisors
custom event bus
AI-controlled deployment
complex retry engine
```

The goal is not to make the AI appear autonomous.

The goal is to make the engineering workflow deterministic enough that the AI can safely execute it autonomously.

---

# 30. Definition of V1 success

V1 is successful when a developer can do this:

```text
1. Describe a feature.
2. Create/review its OpenSpec change.
3. Run /deliver <change>.
4. Watch the orchestrator delegate the work.
5. See implementation/review corrections happen automatically.
6. Get a green local CI result.
7. Open/merge the PR.
8. Have GitHub Actions validate and deploy to GitHub Pages.
```

No Docker daemon.
No custom agent server.
No custom orchestration code.
No direct AI deployment credentials.

That is the intended V1 boundary.

---

# 31. References to consult while implementing

Use current official documentation when syntax or versions differ from this runbook:

- Angular releases: https://angular.dev/reference/releases
- Angular deployment: https://angular.dev/tools/cli/deployment
- Angular router/base href: https://angular.dev/guide/routing/router-reference
- OpenCode V2 agents: https://opencode.ai/v2/docs/agents
- OpenCode V2 permissions: https://opencode.ai/v2/docs/permissions
- OpenCode commands: https://opencode.ai/v2/docs/commands
- OpenCode instructions/rules: https://opencode.ai/v2/docs/instructions
- OpenSpec CLI: https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md
- OpenSpec commands/workflows: https://github.com/Fission-AI/OpenSpec/blob/main/docs/commands.md
- OpenSpec workflows: https://github.com/Fission-AI/OpenSpec/blob/main/docs/workflows.md
- GitHub Pages custom workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GitHub Pages publishing source: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Playwright CI: https://playwright.dev/docs/ci
- Playwright best practices: https://playwright.dev/docs/best-practices
- Jest configuration: https://jestjs.io/docs/configuration
- jest-preset-angular installation: https://thymikee.github.io/jest-preset-angular/docs/getting-started/installation

When this runbook conflicts with a current official tool schema, prefer the official current schema and update the project configuration accordingly rather than forcing the obsolete example.

---

# 32. Final instruction to the implementing AI agent

You are not being asked merely to describe the setup. You are being asked to **inspect this repository, implement the setup, run the verification commands, and leave the project in a working state**.

Proceed in small, reviewable steps.

Before editing, inspect the repository.

After editing, run the smallest relevant validation command.

At the end, run the complete validation suite.

Do not stop at generating configuration files. Prove that the configuration actually works.

Final report must contain:

```text
SETUP STATUS

OpenSpec: PASS/FAIL
OpenCode agents: PASS/FAIL
/deliver command: PASS/FAIL
Jest: PASS/FAIL
Playwright: PASS/FAIL
npm run ci: PASS/FAIL
GitHub Pages workflow: PASS/FAIL

Files created/changed:
- ...

Remaining manual GitHub configuration:
- ...

Known limitations:
- ...
```

