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
| `npm run ci` | Full local CI gate (OpenSpec + lint + unit + build + e2e) |

`npm run e2e` serves an existing production build, so run `npm run build`
first when running E2E locally. `npm run ci` already does this.

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

1. **Quality** — OpenSpec validation, lint, unit tests.
2. **Build and E2E** — production build, Playwright, then (on `main`) a Pages
   build with the correct base href.
3. **Deploy** — publishes the Pages artifact via `actions/deploy-pages`.

Pull requests never deploy; only pushes to `main` deploy.

### Required manual repository setting

In GitHub, set `Settings -> Pages -> Build and deployment -> Source` to
**GitHub Actions** (not a `gh-pages` branch).
