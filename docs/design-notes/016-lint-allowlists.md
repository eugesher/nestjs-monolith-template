# 016 — Lint allowlists

Every `allow` entry of a policy in `lint/boundaries/policies/` is a dependency the code has. An
entry no file uses is removed, unless it is kept on purpose for one of the reasons below.

**A forbidden edge is pinned by a spec.** An edge the code must not have keeps one negative case,
with the reason in its name, and the case fails against a policy that allows the edge. The case
lives with the rule that covers the importer:

- **in the spec of the layer** when the layer has a positive case for where the code belongs:
  `features.spec.ts` says the module root may NOT reach its own outbound, because infrastructure
  binds the tokens, and that a use case may NOT take the config lib, next to the case where
  `infrastructure/config` may; `app-global.spec.ts` and `libs-by-layer.spec.ts` do the same for
  global modules and for the libs of each layer;
- **in `spec/architecture/unused-edges.spec.ts`** when no layer spec covers the importer: the app
  module may NOT import `typeorm`, because the database lib configures it.

**An edge used only by specs counts as used.** A lib module spec imports `@nestjs/core`, and a
common-module spec imports the kernel; both are code the lint checks.

## Why an edge without a use stays

### `policies/selectors.mjs` — the base libs

`baseLibs(...names)` is `libs('kernel', 'toolkit', ...names)`. The kernel is the vocabulary and the
toolkit is the technique of every layer, so each layer gets both whether or not one of its files
imports them. The names after them are what the layer adds: `baseLibs('observability')` for an
application layer, `baseLibs('ledger', 'queue')` for the module root of a core module.

`main.ts` and the core entities are the exceptions: they list their libs one by one.

### A layer may import itself

A layer split over several files imports its own files. The entry stays even where every layer of
that kind is one file: the module root of a common or core module, the application and outbound of a
global module.

### Positive cases of the architecture specs

Some edges are part of the documented shape of the template and have a `MAY` case in
`spec/architecture/`, even though no file uses them:

- the index of nested features and processors, and the module roots that mount through it;
- a bootstrap file that mounts the features, processors and global modules through their indexes;
- a global module that reaches app contracts, common modules, the entities and the database
  contracts;
- shared code that reaches the contracts of its namesake, the http lib, the cache contracts and
  `nestjs-pino`;
- the e2e code that reaches app contracts, the queue contracts `@acme-core/contracts/ledger` and
  `@acme-core/contracts/product-stock`, and the testing lib;
- a feature queue adapter and a processor that reach app contracts: a queue between the modules of
  one app keeps its contract in the app, while a queue written by more than one app keeps it in core
  or in the lib that writes it, `product-stock-post-subtract` in
  `@acme-core/contracts/product-stock` and `ledger-record` in `@acme-core/contracts/ledger`;
- the core-adapters and common-adapters of a common module, and a common module root that mounts a
  core module, another common module or a shared barrel;
- the core-adapters of a core module, and a core module root that mounts another core module;
- a processor whose application reaches its domain, and the libs of the processor layers: the
  database contracts and the entities;
- the libs a layer is meant to reach: the cache lib from the app root, the auth lib from a feature
  root, the database contracts from the infrastructure of a common module;
- a script, a migration or a seed script that imports its own support files.

Removing one of them turns its spec red.

### `module-areas.mjs` — processors share the layer model of features

Features and processors are built by one function, `areaPolicies`, over the same list of layers
(`categories/module-layers.mjs`). A processor uses fewer of them: `idempotency` has a domain helper
and a repository, `ledger` neither. The entries stay, so a processor that grows a layer follows the
same rules a feature does.

`infrastructure/queue` of a processor may inject a queue to manage its jobs. It takes `InjectQueue`
and the `Queue` type and nothing else of Bull, under the same rule as a feature queue adapter in
`queue.mjs`.

The module root of a feature or a processor may reach a shared barrel, as the module root of a
common module may (a positive case of the common modules spec).

### `module-areas.mjs` and `common-modules.mjs` — the two adapter kinds

A core-adapter and a common-adapter have the same shape: they implement an outbound port of their
module and call a contract outside it. Both may reach the domain and the outbound layer of their
module, though only feature core-adapters reach the domain.

### `acme-core.mjs` — a core module that writes to a queue or a cache

A core module announces what it wrote after the commit (see `026-transaction-port.md`), so three
edges exist for it:

- **`infrastructure/queue`**, a category of its own, holds the queue adapters. It takes
  `InjectQueue` and the `Queue` type and nothing else of Bull (`queue.mjs`) and its own contracts.
- **The module root registers the queues it writes to** with `BullSetupModule.registerQueue` of
  `libs/queue` and takes nothing of Bull itself. A core module is mounted by features of several
  apps, so the queue comes with it rather than with the `common/shared` of each app.
- **Core infrastructure may take `@acme-libs/contracts/cache`**, to drop the keys a write makes
  stale; the application still may not, so caching stays an adapter behind a port.

### `acme-core.mjs` — a core module that calls another core module

A core module reaches another one the way a feature does: through its contracts. Its
`infrastructure/core-adapters`, a category of its own, implements an outbound port of the module on
top of the port in `@acme-core/contracts/<other>` and takes nothing else of the other module. The
module root mounts the other module through its barrel `@acme-core/modules/<other>`, and only the
barrel. The application, the domain and the facade still see only their own contracts, so a core
module depends on another one only through an adapter its infrastructure binds. Lint does not see a
cycle between two core modules; Nest refuses to start on one.

**Core outbound takes the contracts of its own module.** A port of the ledger hands its queue
adapter the record that `@acme-core/contracts/ledger` defines for the queue, so the outbound of a
core module may import its own contracts, as the outbound of a lib does. The contracts of another
module stay with its core-adapters.

### Where the credentials and the persistence packages are allowed

Code lives with its only caller (see `024-code-placement.md`), so the edges follow the code:

- **A feature or a core module signs users in.** Its `infrastructure/lib-adapters` may take
  `@acme-libs/contracts/credentials`, and its module root may mount `@acme-libs/credentials`: the
  `auth` feature of customer-app, the `user` feature of staff-app for the hash of a new password,
  and the core module `staff-auth` for the staff login of two apps. No common module signs anyone
  in, so none may.
- **A lib port is reached through a lib adapter.** A feature declares a port of its own in
  `outbound` and implements it in `infrastructure/lib-adapters` on top of the port of the lib, as
  `core-adapters` and `common-adapters` do for core and common modules. Only `lib-adapters` may take
  `@acme-libs/contracts/credentials` and `@acme-libs/contracts/health`; the application and the
  presentation may not. The types of `@acme-libs/contracts/auth` stay direct.
- **A feature and a core module write to the ledger** as to any core module: the module root mounts
  `LedgerCoreModule` of `@acme-core/modules/ledger`, and `infrastructure/core-adapters` takes
  `LEDGER_CORE_PORT` from `@acme-core/contracts/ledger`. The ledger reads the correlation id of the
  context itself, so no adapter needs the observability lib. What reads the queue takes the same
  contracts, as it takes those of any core module: the presentation of a processor, the queue
  registry of processor-app in `infrastructure/queue`, `common/shared` and the e2e code.
- **A processor and a global module read tables.** Their infrastructure may import `typeorm`,
  `@acme-libs/contracts/database` and `@nestjs/common`, as feature infrastructure does.
- **No module touches `@nestjs-cls`.** A repository injects `ORM_PORT` of
  `@acme-libs/contracts/database` and reads through `getRepository(<Entity>)`, so infrastructure may
  not import `@nestjs-cls/transactional` or its TypeORM adapter; only `libs/database` and
  `libs/local-storage` do. Only infrastructure takes `TRANSACTION_PORT` from
  `@acme-libs/contracts/local-storage`, in the transaction adapter of its module; the application
  reaches it through the port of the module (see `026-transaction-port.md`).
- **Infrastructure does not see `libs/database`.** A repository takes `ORM_PORT` from
  `@acme-libs/contracts/database` and `MysqlErrorHelper` from the toolkit. `OrmModule` of
  `libs/database` binds `OrmFacade` under the port, so infrastructure cannot inject the facade past
  it. The http lib reads `MysqlErrorHelper` from the toolkit too.
- **`toolkit/src/database` may import `typeorm`.** `MysqlErrorHelper` checks for a TypeORM
  `QueryFailedError`. The edge is scoped to that folder by the `file` capture of the lib category,
  so the rest of the toolkit sees only `crypto` and the kernel sees no package.
- **The database contracts name TypeORM.** The ORM port returns a TypeORM `Repository`, so the
  contracts of `database` may import `typeorm`; the other contracts see only the base libs.
- **No module registers entities.** The entities of an app are listed once in `app/entities` and
  handed to `OrmModule.forRoot` of `libs/database`, so only that lib may import `@nestjs/typeorm`;
  `TypeOrmModule.forFeature` would add repository tokens that nothing injects.
- **A module root binds no token.** An adapter carries its binding in a static `provider` (see
  `031-static-provider.md`), and a config value is bound in `infrastructure/config` (see
  `030-config-values.md`), so the module root of a feature, a processor, a core, common or global
  module may reach neither its own `outbound` nor `@acme-libs/config`. Only `infrastructure/config`,
  `app/setup/config` and the observability lib import the config lib.
- **A global module has the layers of a feature.** `application/` sees its own outbound, the base
  libs and `@nestjs/common`; `outbound/` sees itself and the base libs; the module root sees the
  application.
- **A global common-adapter reaches any contract of its app and its own outbound.** It implements a
  port of its module's outbound with the port of a common module, which is named after that module,
  not after the global module, so the namesake rule of `appContracts` would refuse it.

### Policies that name exports

A policy that refuses or allows a name of a lib or a package, such as `customer-claims.mjs` with
`AuthJwtModule` and `CurrentUser` or `http-surface.mjs` with the DI names of `@nestjs/common`,
matches the specifier of the import, not the file behind it. A renamed export would leave the policy
guarding a name nobody imports, and its negative case would stay green as long as its fixture used
the old name too. `spec/architecture/policy-specifiers.spec.ts` reads the resolved policies of the
boundaries rule and checks with the TypeScript checker that every specifier named for a lib or a
package is an export of it. The checker reads the declarations, so a type such as `ClassProvider`
counts as an export, as it does for the import it guards.

A policy that names exports is an allowlist of names: `customer-claims.mjs` lists what customer-app
takes from `@acme-libs/auth` and `@acme-libs/kernel`, so a new name is a decision. A namespace,
default, side-effect, star or dynamic import has no specifier for a policy to read, so
`lint/syntax/named-imports.selectors.mjs` refuses those forms for every module a policy lists by
name.

### The layers of a lib

A lib with a port has the layers of a core module: `shell`, `application`, `outbound` and
`infrastructure`, in `src/` (`libs/cache`, `libs/credentials`, `libs/health`) or in a part of the
lib (`libs/database/src/orm`, `libs/local-storage/src/transaction`). Every file of a lib is one
category, `acme-libs`, so its edges to other libs and packages stay per lib.
`policies/lib-layers.mjs` gives every layer file an allowlist within its lib from the `file`
capture; the files outside the layers may reach the whole lib:

| Layer            | May reach                                |
| ---------------- | ---------------------------------------- |
| `shell`          | `shell`, `application`, `infrastructure` |
| `application`    | `application`, `outbound`                |
| `infrastructure` | `infrastructure`, `outbound`             |
| `outbound`       | `outbound`                               |

A shell spec may also read the tokens of `outbound` it overrides. In `libs/database`, `orm/shell`
may reach `naming` and `orm/application` may reach `repository`.
`spec/architecture/lib-layers.spec.ts` holds a case per edge.

### The testing lib is for tests only

`libs/testing` holds the test helpers behind one barrel, `@acme-libs/testing`: `E2EContext` of
`e2e/e2e.context.ts`, the Redis token of `cache/` and the logger mock of
`observability/pino-logger.mock.ts`. Any `*.spec.ts` may import it, through a policy that matches
the path, and so may the e2e code and `test/system`; no layer of production code lists it, so lint
refuses it there. The lib reaches the `outbound` of the cache lib for the Redis token and nothing
else of another lib.
