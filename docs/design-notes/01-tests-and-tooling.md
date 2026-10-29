# 01 — Tests and tooling

## `spec/` — architecture lint specs

The architecture lint lives in `lint/`. `spec/architecture/*.spec.ts` keeps it honest: a rule
that gets weaker turns `yarn test:unit` red even while `yarn lint:all` is still green, because the
weaker rule has nothing left to complain about in the real tree.

### `spec/support/lint.ts`

**Real config, no type information.** The matchers lint a fixture with `ESLint.lintText` against
the real `eslint.config.mjs`, picked up from the repository root. Fixture paths are virtual and
outside every `tsconfig.json` project, so `typescript-eslint`'s `disableTypeChecked` is laid over
the config: type-aware rules would otherwise fail to parse the fixture. Only the architecture rules
are counted (`boundaries/*`, `no-restricted-globals`, `no-restricted-imports`,
`no-restricted-syntax`); style findings in a
one-line fixture are noise.

**An unresolved import throws.** `eslint-plugin-boundaries` classifies the TARGET of an import by
resolving it. An import that does not resolve has no target, so the plugin reports nothing, and a
negative case would pass for the wrong reason. `toBreakRule` and `toPassArchitectureLint` resolve
every import of the fixture first and throw if one does not resolve.

### `spec/support/scaffold.ts`

**Targets are scaffolded, fixtures are not.** A fixture is linted from memory, but what it imports
must exist on disk (see above). Each spec creates the files it imports in `beforeAll` and removes
them in `afterAll`. A scaffold creates only files that are missing and removes only what it
created, so a spec that scaffolds `libs/kernel/src/index.ts` leaves a real `libs/kernel` alone.

Scaffolded apps and modules are named `__<topic>-fixture__` so they never collide with real code.
Libs keep their real names: the lint rules capture the lib name, and the edges are per lib.

**`--runInBand` is mandatory.** Scaffolds write into the real tree. Two spec files running in
parallel would see each other's half-built scaffolds: one removes a directory the other is still
linting against, or an unknown-file case finds a file that belongs to its neighbor. `test:unit`
runs Jest in band, and nothing else may run the specs in parallel.

**Imports are relative until the aliases exist.** A spec may import `@acme-libs/<lib>` only once
`tsconfig.json` maps it; before that the alias does not resolve and the plugin treats it as an
external package. Cases that are about aliases (`app-entry-points`, deep lib entry points) are
added together with the aliases.

**The config does not depend on the working directory.** An editor runs ESLint from the nearest
`package.json`, and `migrations/` and `scripts/` have their own (they run under plain `node` as ES
modules). Both `eslint-plugin-boundaries` and the `typescript-eslint` project service default to
`process.cwd()`, so from a sub-folder every file pattern misses and the project service finds no
`tsconfig.json`. `boundaries/root-path` and `tsconfigRootDir` are pinned to the repository root,
and `repo.spec.ts` lints from `migrations/` and `apps/admin-api/` in a child process to keep it
that way: an in-process `new ESLint({ cwd })` does not change `process.cwd()` and would pass
either way.
