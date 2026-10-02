# NeuralLab

Angular single-page application, specified with OpenSpec and deployed as a
static site to GitHub Pages.

## Stack

| Area | Choice |
| --- | --- |
| Framework | Angular 22.2.0 (standalone components, signals) |
| Language | TypeScript 6.0.x (required by Angular 22) |
| Node.js | 26 (pinned in `.nvmrc`; Angular 22 supports `^22.22.3 \|\| ^24.15.0 \|\| >=26.0.0`) |
| Package manager | npm |
| Unit/component tests | Angular unit-test runner (Vitest) via `ng test` |
| Browser/E2E tests | Playwright (Chromium) |
| Lint | angular-eslint (ESLint flat config) |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages (static, hash routing) |
| Spec workflow | OpenSpec + OpenCode V2 agents |

## Architecture

NeuralLab is a static Angular single-page application with a layered `src/app`
and declarative, build-time-validated educational content. The full design is in
[`docs/architecture.md`](docs/architecture.md).

### Layers and dependency direction

```text
core  →  domain  →  shared  →  features
                 ▲
        educational-content (pure data; type-only domain imports)
```

- `core/` — leaf utilities: `tfjs/`, `data/`, `ui/`, `utils/`, `images/`, `training/`.
- `domain/` — `models/`, `content/` (Zod schemas), `progress/`.
- `shared/` — reusable building blocks: `stages/`, `visualizations/`, `experiments/`,
  `challenges/`, `code-view/`, `concepts/`, `runtime/`.
- `features/` — routed areas: `journey/`, `lab-shell/`, `labs/`, `glossary/`,
  `settings/`, `tfjs-status/`, `main-layout/`.
- `educational-content/` — `lab-configs/` and `concepts/` (TypeScript consts).

Dependencies flow `core → domain → shared → features`; `educational-content` is
pure data. The boundary is enforced by `no-restricted-imports` patterns in
`eslint.config.js`. Path aliases (`@core/*`, `@domain/*`, `@shared/*`,
`@features/*`, `@content/*`) are defined in `tsconfig.json`.

### Lab runtime model

- Each of the 16 labs is a lazy-loaded feature under `features/labs/`, registered
  through `labRoute(...)` with its `LAB_CONFIG`.
- `LabShellComponent` renders the lab; `StageRendererComponent` resolves the ten
  pedagogical stage types through `ComponentRegistry`, and visualizations through
  `VisualizationRegistry`.
- `LabRuntimeService` is provided per lab route and owns tensor lifecycle
  (`tidy`/`track`/`dispose`) plus the "Por baixo dos panos" computation stream.
- TensorFlow.js initializes through `TfjsInitService` (backend priority
  `webgpu → webgl → cpu`) and is injected via `TFJS_TOKEN`.

### Content as TypeScript configs

Labs are typed `LaboratoryConfig` objects in `educational-content/lab-configs/`.
`scripts/validate-content.mjs` (`npm run validate:content`) checks every config
against the Zod schemas in `domain/content/schemas.ts` and against
`lab-catalog.ts` at build time. The `image` parameter type renders an image file
picker and receives a decoded image at runtime; it has no serializable default
and is excluded from persisted progress.

### Persistence

Progress is local-first. `ProgressService` + `LocalStorageService` persist under
the `neural-lab:v1:progress` key (schema version 2 with a migrator, and a
1000-event analytics cap). Analytics are included in an export only when the
user opts in. There is no backend runtime.

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`.
The application automatically reloads when you modify source files.

## Building

```bash
npm run build
```

Build artifacts are written to `dist/neural-lab/browser`.

## Testing, lint and CI

| Command | Purpose |
| --- | --- |
| `npm run test:unit` | Unit/component tests (single run) |
| `npm run test:watch` | Unit/component tests (watch mode) |
| `npm run lint` | Lint TypeScript and templates with angular-eslint |
| `npm run build` | Production build (`dist/neural-lab/browser`) |
| `npm run e2e` | Playwright tests against the production build |
| `npm run e2e:ui` | Playwright interactive UI |
| `npm run openspec:validate` | Validate OpenSpec artifacts |
| `npm run validate:content` | Validate every lab config against the Zod schemas |
| `npm run ci` | Full local CI gate (OpenSpec + content validation + lint + unit + build + e2e) |

`npm run e2e` serves an existing production build, so run `npm run build`
first when running E2E locally. `npm run ci` already does this.

## Documentation

| Document | Contents |
| --- | --- |
| [`docs/architecture.md`](docs/architecture.md) | Layers, TF.js integration, lab and content architecture, build/deploy |
| [`docs/learning-path.md`](docs/learning-path.md) | 16-lab sequence, prerequisites, pedagogical stages, glossary |
| [`docs/development-guide.md`](docs/development-guide.md) | Adding a laboratory end to end |
| [`docs/testing-guide.md`](docs/testing-guide.md) | Vitest, Playwright, accessibility and the local CI gate |
| [`docs/contribution-guide.md`](docs/contribution-guide.md) | OpenSpec workflow, PR flow, Git safety |
| [`docs/labs/`](docs/labs/) | One page per laboratory (concepts, stages, experiment guide) |
| [`docs/tensorflow-concepts.md`](docs/tensorflow-concepts.md) | TensorFlow.js API reference used by the labs |
| [`docs/mathematical-concepts.md`](docs/mathematical-concepts.md) | Math background for the labs |
| [`AUDIT_RESULTS.md`](AUDIT_RESULTS.md) | Accessibility and performance audit results |

## AI engineering workflow

This project uses a specification-driven workflow:

- **OpenSpec** is the source of truth for change intent
  (`openspec/changes` and `openspec/specs`).
- **OpenCode V2** coordinates four project agents
  (`.opencode/agents`) and the `/deliver` command.

Typical flow:

```text
/opsx-propose <change>   # create proposal, specs, design, tasks
/deliver <change>        # validate, implement, verify, review, run CI, finalize
```

The orchestrator delegates to `spec-engineer`, `implementer` and `reviewer`.
The agent never pushes or deploys; GitHub Actions owns delivery.

## Deployment (GitHub Pages)

The site is a GitHub Pages **project site** served from
`https://OdairJr.github.io/neural-lab/`, so the build uses
`--base-href /neural-lab/` and the app uses hash routing
(`withHashLocation()`), which avoids SPA deep-link rewrites.

The `CI / CD` workflow (`.github/workflows/ci-cd.yml`) runs on pull requests
and pushes to `main`:

1. **Quality** — OpenSpec validation, content validation, lint, unit tests.
2. **Build and E2E** — production build, Playwright, then (on `main`) a Pages
   build with the correct base href.
3. **Deploy** — publishes the Pages artifact via `actions/deploy-pages`.

Pull requests never deploy; only pushes to `main` deploy.

### Required manual repository setting

In GitHub, set `Settings -> Pages -> Build and deployment -> Source` to
**GitHub Actions** (not a `gh-pages` branch).
