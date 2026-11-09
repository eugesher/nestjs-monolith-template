# 015 — Quality gates

Three gates stand between a change and the main branch: the git hooks on the developer's machine,
the coverage thresholds of the unit suite, and the CI workflow.

## Unit coverage

```bash
yarn test:unit:coverage
```

`jest/jest-unit.config.js` collects coverage from `apps`, `core` and `libs` and fails the run below
a threshold.

**What is not counted** is code that has no logic of its own or is covered by the e2e suites only:

| Excluded                                                                                        | Why                                                             |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `index.ts`                                                                                      | barrels                                                         |
| `*.{port,token,enum,entity,dto,view,type,interface,const,command,query,record,input,output}.ts` | declarations                                                    |
| `*.module.ts`, `apps/*/src/main.ts`                                                             | wiring, booted by the e2e suites                                |
| `infrastructure/persistence/repositories/**`                                                    | SQL, checked against the database by the e2e suites             |
| `infrastructure/persistence/host/**`                                                            | repository getters and query builder factories                  |
| `presentation/controllers/**`                                                                   | routes, guards and pipes, checked over HTTP by the e2e suites   |
| `shell/*.facade.ts`                                                                             | each method hands the call to a use case                        |
| `libs/observability/src/tracer/index.ts`                                                        | a side-effect entry; its logic is in `helpers/tracer.helper.ts` |
| `libs/openapi/src/api-reference/api-reference.ts`                                               | mounts the reference page                                       |
| `libs/*/src/testing/**`, `apps/*/test/**`                                                       | test code                                                       |

**The thresholds** are 95% for statements, branches, functions and lines, twice over:

- for the whole tree;
- for every file of `domain/` and `application/` in a feature, a nested feature module
  (`features/<area>/modules/<module>`), a processor, a common module and a core module.

The per-file keys are what matter. One unit without a spec barely moves the global numbers, but its
file drops to zero and fails its own key.

**ts-jest compiles the unit suite with type information** (`isolatedModules: false`). With
`emitDecoratorMetadata`, a file compiled on its own cannot tell whether a constructor parameter type
is a class, so it guards the reference: `typeof X === "undefined" ? Object : X`. Istanbul counts
that guard as a branch no test can take, and a use case with an injected service lands at 75% of
branches with 100% of lines. With the whole program the compiler knows `X` is a class and emits it
as is. The e2e configs keep the faster per-file compile: they collect no coverage.

**TS151002 is silenced on purpose.** ts-jest warns that a `nodenext` module needs
`isolatedModules: true`; the per-file compile is exactly what loses the classes above.

## Git hooks

[husky](https://typicode.github.io/husky/) installs the hooks of `.husky/` on `yarn install`:

| Hook         | Runs                                                                                                                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pre-commit` | `yarn lint`: `pretty-quick --staged` formats every staged file Prettier knows, then `lint-staged` runs `eslint --cache --fix` on the staged `*.ts` files, and the whole `yarn lint:all` when `eslint.config.mjs`, `lint/**/*.mjs`, `tsconfig.json` or `package.json` is staged |
| `pre-push`   | `yarn typecheck`                                                                                                                                                                                                                                                               |

`yarn lint` checks the staged files only; `yarn lint:all` checks the whole tree, as CI does. A
change to the lint config or the aliases can break files that are not staged, so it runs the
whole-tree lint.

**The hooks are installed by `postinstall`, not `prepare`.** Yarn 4 does not run `prepare` on
install. The script is `husky || true`: the production install of the `Dockerfile` drops dev
dependencies, and without the `husky` binary the install would fail.

## CI

`.github/workflows/ci.yml` runs on every push, one job after another:

```text
lint → typecheck → build → unit → e2e
```

- `lint` runs `yarn lint:all` and `yarn format:check`, which checks every file Prettier knows
  outside `.gitignore`;
- `unit` runs `yarn test:unit:coverage`: CI is where the thresholds are enforced, no hook runs them;
- `e2e` starts MySQL and Redis of `test/infra` and reseeds before each suite, as `014-e2e-suites.md`
  requires. The seeding runs on the runner through `yarn test:e2e:infra:reseed`, so the `node`
  service of the compose file is not built. The job first copies every `.env.example` to
  `.env.test`, which the compose file and the suites read.

Node is the latest 24, and Yarn comes from `packageManager` through `corepack enable`.

## Order the lint keeps

`eslint-plugin-perfectionist` keeps the order of imports, exports, class members and module keys,
one rule per file of `lint/configs`, so the order is fixed by `eslint --fix` and never argued in a
review.

**Line width has two limits.** Prettier wraps at `printWidth` 100, and `max-len` of `style.mjs`
fails a line over 150. An import of one name is never wrapped by Prettier, so the path decides its
length: a host importing its builder or a spec importing its subject can run past 100 under the
naming of `029-naming.md`, and stays within the limit of the lint.

**Imports** (`imports.mjs`, `sort-imports`) come in three blocks, separated by one blank line:

1. `@nestjs/*`, then the other packages;
2. the aliases of the repository: the libs, the lib contracts, the core, the core contracts, then
   the `app`, `common`, `contracts`, `features` and `processors` of an app;
3. relative imports: two levels up and more, one level up, the same folder.

Within a block the groups follow each other without a blank line, and a group's `import type` comes
after all the value imports of its block. Names are sorted alphabetically, case ignored.
`sort-named-imports` puts the `type` specifiers of one import after its values.

**Exports** (`exports.mjs`, `sort-exports`) of a barrel are sorted alphabetically within each run of
lines; a blank line starts a new run, so a barrel can keep its folders apart.

**Class members** (`classes.mjs`, `sort-classes`) go by kind and accessibility, not by name
(`type: 'unsorted'`):

1. fields and accessors: public, protected, then private; in each, static fields, then decorated
   instance fields, then plain ones;
2. the static block, then the constructor;
3. methods: public, protected, then private, static before instance in each.

Groups are separated by one blank line. Static fields and plain instance fields stand together
without one. A decorated field of a DTO or an entity spans several lines, so decorated fields and
the members of a getter or method group are separated by one. The rule tells the two kinds of field
apart by the decorator, not by the number of lines.

**Module keys** (`modules.mjs`, `sort-objects`) go `module`, `global`, `imports`, `exports`,
`controllers`, `providers`: what the module takes and shows comes before how it is built. The rule
applies to an object whose keys are all among these six, the argument of `@Module` and the object a
`forRoot` returns alike, and leaves every other object as it is written.
