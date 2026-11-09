# 001 — Tests and tooling

## `spec/` — architecture lint specs

The architecture lint lives in `lint/`. `spec/architecture/*.spec.ts` keeps it honest: a rule that
gets weaker turns `yarn test:unit` red even while `yarn lint:all` is still green, because the weaker
rule has nothing left to complain about in the real tree.

### `spec/support/lint.ts`

**Real config, no type information.** The matchers lint a fixture with `ESLint.lintText` against the
real `eslint.config.mjs`, picked up from the repository root. Fixture paths are virtual and outside
every `tsconfig.json` project, so `typescript-eslint`'s `disableTypeChecked` is laid over the
config: type-aware rules would otherwise fail to parse the fixture. Only the architecture rules are
counted (`boundaries/*`, `no-restricted-globals`, `no-restricted-imports`, `no-restricted-syntax`);
style findings in a one-line fixture are noise.

**An unresolved import throws.** `eslint-plugin-boundaries` classifies the TARGET of an import by
resolving it. An import that does not resolve has no target, so the plugin reports nothing, and a
negative case would pass for the wrong reason. `toBreakRule` and `toPassArchitectureLint` resolve
every import of the fixture first and throw if one does not resolve.

### `spec/support/scaffold.ts`

**Targets are scaffolded, fixtures are not.** A fixture is linted from memory, but what it imports
must exist on disk (see above). Each spec creates the files it imports in `beforeAll` and removes
them in `afterAll`. A scaffold creates only files that are missing and removes only what it created,
so a spec that scaffolds `libs/kernel/src/index.ts` leaves a real `libs/kernel` alone.

Scaffolded apps and modules are named `__<topic>-fixture__` so they never collide with real code.
Libs keep their real names: the lint rules capture the lib name, and the edges are per lib.

**A killed run leaves no scaffold behind.** A scaffold may write outside `__*-fixture__`, such as
`libs/http/src/exceptions/unauthorized-http.exception.ts`, where `.gitignore` does not hide it. A
scaffold records every path in the gitignored `.scaffold-manifest` before it writes it and strikes
the path out in `remove`. `spec/support/global-setup.ts`, the `globalSetup` of the unit config,
removes whatever the manifest still lists, so a run killed before its `afterAll` is cleaned up at
the start of the next one.

**One spec file at a time is mandatory.** Scaffolds write into the real tree. Two spec files running
in parallel would see each other's half-built scaffolds: one removes a directory the other is still
linting against, or an unknown-file case finds a file that belongs to its neighbor. `test:unit` runs
Jest with `--maxWorkers=1`, and nothing else may run the specs in parallel.

**The worker restarts at 2 GB.** Every spec file gets its own module registry, and with
`--experimental-vm-modules` Node keeps the compiled ES modules of every finished file alive, so one
process grows by about 10 MB per file and by about 60 MB per architecture spec, which loads ESLint.
In band the run outgrows the 4 GB heap of Node. A single worker with `--workerIdleMemoryLimit=2GB`
keeps the order and drops the leak whenever Jest replaces it.

**Every test script logs the heap and hides the VM Modules warning.** `--logHeapUsage` prints the
heap size after each spec file, so growth toward the 2 GB limit shows in the output of CI.
`--disable-warning=ExperimentalWarning` in `NODE_OPTIONS` reaches every worker; without it each new
worker process prints the VM Modules warning once. Jest prints the per-file lines only with its
default reporter, which it replaces with a short summary when it detects an AI agent.

**An alias must resolve.** A spec may import `@acme-libs/<lib>` only when `tsconfig.json` maps it;
an alias that is not mapped does not resolve, and the plugin treats it as an external package.

**The config does not depend on the working directory.** An editor runs ESLint from the nearest
`package.json`, and `migrations/` and `scripts/` have their own (they run under plain `node` as ES
modules). Both `eslint-plugin-boundaries` and the `typescript-eslint` project service default to
`process.cwd()`, so from a sub-folder every file pattern misses and the project service finds no
`tsconfig.json`. `boundaries/root-path` and `tsconfigRootDir` are pinned to the repository root, and
`repo.spec.ts` lints from `migrations/` and `apps/staff-app/` in a child process to keep it that
way: an in-process `new ESLint({ cwd })` does not change `process.cwd()` and would pass either way.
