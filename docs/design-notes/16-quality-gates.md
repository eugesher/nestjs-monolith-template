# 16 — Quality gates

Three gates stand between a change and the main branch: the git hooks on the developer's machine,
the coverage thresholds of the unit suite, and the CI workflow.

## Unit coverage

```bash
yarn test:unit:coverage
```

`test/jest-unit.config.js` collects coverage from `apps`, `core` and `libs` and fails the run below
a threshold.

**What is not counted** is code that has no logic of its own or is covered by the e2e suites only:

| Excluded | Why |
| --- | --- |
| `index.ts` | barrels |
| `*.{port,token,enum,entity,dto,view,type,interface,const,command,query,record}.ts` | declarations |
| `*.module.ts`, `apps/*/src/main.ts` | wiring, booted by the e2e suites |
| `infrastructure/persistence/repositories/**` | SQL, checked against the database by the e2e suites |
| `presentation/controllers/**` | routes, guards and pipes, checked over HTTP by the e2e suites |
| `module/*.facade.ts` | each method hands the call to a use case |
| `libs/observability/src/tracer/tracer.ts` | a side-effect entry; its logic is in `tracer.helper.ts` |
| `libs/openapi/src/api-reference/api-reference.ts` | mounts the reference page |
| `libs/*/src/testing/**`, `apps/*/test/**` | test code |

**The thresholds** are 95% for statements, branches, functions and lines, three times over:

- for the whole tree;
- for every file of `domain/` and `application/` in a feature, a nested feature module
  (`features/<area>/modules/<module>`), a processor, a common module and a core module;
- for every persistence mapper.

The per-file keys are what matter. One unit without a spec barely moves the global numbers, but
its file drops to zero and fails its own key.

**ts-jest compiles the unit suite with type information** (`isolatedModules: false`). With
`emitDecoratorMetadata`, a file compiled on its own cannot tell whether a constructor parameter
type is a class, so it guards the reference: `typeof X === "undefined" ? Object : X`. Istanbul
counts that guard as a branch no test can take, and a use case with an injected service lands at
75% of branches with 100% of lines. With the whole program the compiler knows `X` is a class and
emits it as is. The e2e configs keep the faster per-file compile: they collect no coverage.

## Git hooks

[husky](https://typicode.github.io/husky/) installs the hooks of `.husky/` on `yarn install`:

| Hook | Runs |
| --- | --- |
| `pre-commit` | `lint-staged`: `eslint --cache --fix` on the staged `*.ts` files; the whole `yarn lint` when `eslint.config.mjs`, `eslint/**/*.mjs`, `tsconfig.json` or `package.json` is staged |
| `pre-push` | `yarn typecheck` |

A change to the lint config or the aliases can break files that are not staged, so it lints the
whole tree.

**The hooks are installed by `postinstall`, not `prepare`.** Yarn 4 does not run `prepare` on
install. The script is `husky || true`: the production install of the `Dockerfile` drops dev
dependencies, and without the `husky` binary the install would fail.

## CI

`.github/workflows/ci.yml` runs on every push, one job after another:

```text
lint → typecheck → build → unit → e2e
```

- `lint` also runs `yarn format:check`;
- `unit` runs `yarn test:unit:coverage`: CI is where the thresholds are enforced, no hook runs them;
- `e2e` starts MySQL and Redis of `docker-compose/database-and-tests` and reseeds before each
  suite, as `15-e2e-suites.md` requires. The seeding runs on the runner through
  `yarn test:e2e:infra:reseed`, so the `node` service of the compose file is not built. The suites
  read no env file: `test/jest-setup.js` sets the whole environment.

Node is the latest 24, and Yarn comes from `packageManager` through `corepack enable`.
