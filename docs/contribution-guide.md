# Contribution Guide

NeuralLab is developed with a **specification-driven workflow**. OpenSpec holds
the change intent; application code must not silently reinterpret it. This guide
covers the branch/PR flow, the spec workflow, the required local gate, commit and
style conventions, and Git safety.

## 1. Specification-driven workflow

OpenSpec is the source of truth for *what* should be built:

- Specs live in [`openspec/specs/`](../openspec/specs/).
- A change lives in `openspec/changes/<change>/` and typically contains
  `proposal.md`, `design.md`, `tasks.md` and delta specs.
- The V1 implementation is tracked by the change
  `neural-lab-v1-implementation`.

The project agents are configured in [`.opencode/agents/`](../.opencode/agents)
and driven by the orchestrator:

| Agent | Responsibility |
| --- | --- |
| `orchestrator` | Owns the workflow loop and gates |
| `spec-engineer` | Owns OpenSpec artifacts only |
| `implementer` | Owns application implementation and tests |
| `reviewer` | Read-only adversarial review (returns `PASS`, `FIX_CODE` or `REVISE_SPEC`) |

The typical loop is:

```text
propose → validate → implement → OpenSpec verify → adversarial review
        → correct code or spec → repeat → local CI → PR → CI → merge → deploy
```

Common commands (installed as OpenCode commands, see
[`.opencode/commands/`](../.opencode/commands)):

```text
/opsx-propose <change>     # create proposal, specs, design, tasks
/opsx-apply <change>       # implement tasks from a change
/opsx-verify <change>      # verify implementation against the artifacts
/opsx-sync <change>        # sync delta specs into main specs
/opsx-archive <change>     # archive a completed change
/deliver <change>          # run the full delivery loop (orchestrator)
```

**When implementation exposes a specification problem**, do not silently
reinterpret the requirement. Report the conflict, revise the OpenSpec artifacts,
revalidate, then continue. The `implementer` reports `STATUS: SPEC_PROBLEM` when
it cannot satisfy the current artifacts without changing them.

## 2. Branch and pull request flow

1. Start from an up-to-date `main`.
2. Create a focused feature branch (for example `feat/lab-17`, `fix/glossary-search`).
3. Make the change **and its tests**; keep the diff scoped to the change.
4. Run the full local gate (section 3).
5. Open a pull request against `main`. The PR runs the `quality` and
   `build-and-e2e` jobs; **PRs never deploy**.
6. A human reviews and merges. Only a push to `main` deploys.

Keep changes small and reviewable. Do not mix unrelated refactors into a
feature PR.

## 3. Required local gate

Before opening or updating a pull request, run:

```bash
npm run ci
```

This is the project's canonical CI command and runs:

```text
openspec validate  →  content validate  →  lint  →  unit tests  →  build  →  E2E
```

Never solve a failing gate by disabling tests, weakening lint rules, deleting
assertions, skipping verification or suppressing compilation errors. Fix the
cause — or escalate a genuine specification problem.

## 4. Commit conventions

The repository uses [Conventional Commits](https://www.conventionalcommits.org/).
Existing history uses scoped types such as:

```text
feat(labs): implement Phase 5 images and memory laboratories
feat(progress): glossary integration and learning analytics dashboard
test(a11y): axe-core audit for both themes, keyboard flows and audit report
ci(pages): add GitHub Actions quality/build-e2e/deploy workflow
chore(e2e): add playwright with cross-platform static server and local CI gate
```

Use a lowercase type, an optional scope in parentheses, a colon and a concise
imperative description:

| Type | Use for |
| --- | --- |
| `feat` | New user-visible behavior |
| `fix` | Bug fixes |
| `docs` | Documentation only |
| `test` | Tests only |
| `refactor` | Behavior-preserving code changes |
| `chore` | Tooling, config, dependencies |
| `ci` | CI/CD changes |
| `build` | Build configuration |

Reference the affected area in the scope (`labs`, `lab-14`, `progress`,
`content`, `a11y`, `pages`, …).

## 5. Code and style conventions

- **Angular**: standalone components, signals, the project's zoneless
  change-detection strategy, hash routing. Preserve existing patterns.
- **Layers**: `core → domain → shared → features`; `educational-content` is pure
  data. `npm run lint` enforces the boundaries with `no-restricted-imports`.
- **Path aliases**: `@core/*`, `@domain/*`, `@shared/*`, `@features/*`,
  `@content/*`.
- **Content**: lab copy is PT-BR; code, comments and developer docs are English.
- **Tests**: behavior-focused; tests are part of the feature (see
  [`testing-guide.md`](testing-guide.md)).
- **Formatting**: Prettier is configured ([`.prettierrc`](../.prettierrc));
  angular-eslint covers TypeScript and templates.
- **Adding a lab**: follow [`development-guide.md`](development-guide.md).

## 6. Git safety

The project rules in [`AGENTS.md`](../AGENTS.md) are authoritative:

- **AI agents must never push directly.** A human reviews and merges; GitHub
  Actions owns delivery.
- Never rewrite shared history.
- Never expose secrets.
- Do not commit generated secrets, local environment files or credentials.

Agent shell permissions are declared in [`opencode.jsonc`](../opencode.jsonc);
`AGENTS.md` remains the source of truth for what agents are allowed to do.

## 7. GitHub Actions pipeline

[`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml) runs on pull
requests to `main`, pushes to `main`, and manual dispatch.

```text
quality                  build-and-e2e                         deploy
─────────────────────    ─────────────────────────────────     ─────────────────
OpenSpec validate        npm ci                                if: push to main
content validate         install Chromium                      needs: build-and-e2e
lint                     build (production, default base)      environment: github-pages
unit tests               Playwright E2E                        actions/deploy-pages
                         upload Playwright report
                         (on main) rebuild with Pages base-href
                         configure/upload Pages artifact
```

- `quality` runs the same checks as the first half of `npm run ci`.
- `build-and-e2e` always builds and runs Playwright. On `main` it then rebuilds
  with the computed `--base-href` and uploads the Pages artifact.
- `deploy` runs **only on a push to `main`** and publishes through the
  `github-pages` environment. Pull requests stop after `build-and-e2e`.

The workflow needs `contents: read`, `pages: write` and `id-token: write`
permissions, and the repository Pages source must be set to **GitHub Actions**
(`Settings → Pages → Build and deployment → Source`). Deployment details are in
the [README](../README.md#deployment-github-pages).

## 8. Review checklist

Before requesting review, confirm:

- [ ] `npm run ci` passes locally.
- [ ] The change matches its OpenSpec artifacts (or the artifacts were updated).
- [ ] New behavior has meaningful tests; user-visible behavior has E2E coverage
      where appropriate.
- [ ] Layer boundaries and path aliases are respected.
- [ ] No unrelated changes or new dependencies without justification.
- [ ] Documentation is updated when structure or behavior changes.
- [ ] No secrets, credentials or local environment files are included.
