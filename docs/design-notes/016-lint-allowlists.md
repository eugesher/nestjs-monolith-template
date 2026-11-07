# 016 — Lint allowlists

Every `allow` entry of a policy in `lint/boundaries/policies/` is a dependency the code has. An
entry no file uses is removed, unless it is kept on purpose for one of the reasons below.

**A removed edge is pinned by a spec.** `spec/architecture/unused-edges.spec.ts` holds one
negative case per edge that was allowed and had no use, with the reason in its name: for example,
the app module may NOT import `typeorm`, because a setup module in `app/setup` configures it. The
cases fail against the policies that still allowed those edges.

**An edge used only by specs counts as used.** A lib module spec imports `@nestjs/core`, and a
common-module spec imports the kernel; both are code the lint checks.

## Why an edge without a use stays

### `policies/selectors.mjs` — the base libs

`baseLibs(...names)` is `libs('kernel', 'toolkit', ...names)`. The kernel is the vocabulary and the
toolkit is the technique of every layer, so each layer gets both whether or not one of its files
imports them today. The names after them are what the layer adds: `baseLibs('observability')` for
an application layer, `baseLibs('ledger', 'observability')` for the application of a core module.

`main.ts` and the core entities are the exceptions: they list their libs one by one.

### A layer may import itself

A layer split over several files imports its own files. The entry stays even where every layer of
that kind is one file today: the module root of a common or core module, the application and
outbound of a global module.

### Positive cases of the architecture specs

Some edges are part of the documented shape of the template and have a `MAY` case in
`spec/architecture/`, even though no file uses them yet:

- the index of nested features and processors, and the module roots that mount through it;
- a bootstrap file that mounts the features, processors and global modules through their indexes;
- a global module that reaches app contracts, common modules, the entities and the database
  contracts;
- shared code that reaches the contracts of its namesake, the http lib, the cache contracts and
  `nestjs-pino`;
- the e2e code that reaches app contracts, the queue contracts of core (`ledger`, `product-stock`)
  and the test helpers of the observability lib;
- a feature queue adapter and a processor that reach app contracts: a queue between the
  modules of one app keeps its contract in the app, while a queue written by more than one app
  keeps it in core, `ledger-record` in `@acme-core/contracts/ledger` and
  `product-stock-post-subtract` in `@acme-core/contracts/product-stock`;
- the core-adapters and common-adapters of a common module, and a common module root that mounts
  a core module, another common module or a shared barrel;
- a processor whose application reaches its domain, and the libs of the processor layers: the
  database contracts and the entities;
- the libs a layer is meant to reach: the cache lib from the app root, the auth
  lib from a feature root, the database contracts from the application of a common module;
- a script, a migration or a seed script that imports its own support files.

Removing one of them turns its spec red.

### `module-areas.mjs` — processors share the layer model of features

Features and processors are built by one function, `areaPolicies`, over the same list of layers
(`categories/module-layers.mjs`). A processor uses fewer of them: `idempotency` has a domain
helper and a repository, `ledger` neither. The entries stay, so a processor that grows a layer
follows the same rules
a feature does.

`infrastructure/queue` of a processor may inject a queue to manage its jobs. It takes `InjectQueue` and the `Queue` type and nothing else of
Bull, under the same rule as a feature queue adapter in `queue.mjs`.

The module root of a feature or a processor may reach a shared barrel, as the module root of a
common module may (a positive case of the common modules spec).

### `module-areas.mjs` and `common-modules.mjs` — the two adapter kinds

A core-adapter and a common-adapter have the same shape: they implement an outbound port of their
module and call a contract outside it. Both may reach the domain and the outbound layer of their
module, though today only feature core-adapters reach the domain.

### `acme-core.mjs` — a core module that writes to a queue or a cache

A core module announces what it wrote after the commit (see `026-transaction-port.md`), so three
edges exist for it:

- **`infrastructure/queue`**, a category of its own, holds the queue adapters. It takes
  `InjectQueue` and the `Queue` type and nothing else of Bull (`queue.mjs`), its own contracts and
  the contracts of `ledger`, whose queue every module that writes ledger records shares.
- **The module root registers the queues it writes to** with `BullSetupModule.registerQueue` of
  `libs/queue` and takes nothing of Bull itself.
  A core module is mounted by features of several apps, so the queue comes with it rather than with
  the `common/shared` of each app.
- **Core infrastructure may take `@acme-libs/contracts/cache`**, to drop the keys a write makes
  stale; the application still may not, so caching stays an adapter behind a port.

### Where the credentials and the persistence packages are allowed

Code lives with its only caller (see `024-code-placement.md`), so the edges follow the code:

- **A feature signs its users in.** Its `infrastructure/lib-adapters` may take
  `@acme-libs/contracts/credentials`, and its module root may mount `@acme-libs/credentials`. No
  core module and no common module signs anyone in today, so neither may.
- **A lib port is reached through a lib adapter.** A feature declares a port of its own in
  `outbound` and implements it in `infrastructure/lib-adapters` on top of the port of the lib, as
  `core-adapters` and `common-adapters` do for core and common modules. Only `lib-adapters` may take
  `@acme-libs/contracts/credentials` and `@acme-libs/contracts/health`; the application and the
  presentation may not. `TRANSACTION_PORT` and the types of `@acme-libs/contracts/auth` stay
  direct.
- **A feature and a core module write to the ledger.** Their outbound, application and
  `infrastructure/queue` may import `@acme-libs/ledger`: the port aliases `ISubjectLedgerPort`, the
  ledger service extends `SubjectLedgerService`, the queue adapter extends
  `SubjectLedgerQueueAdapter`. No processor and no common module writes a ledger record, so neither
  may. The lib itself sees only the base libs.
- **A processor and a global module read tables.** Their infrastructure may import `typeorm`,
  `@acme-libs/contracts/database` and `@nestjs/common`, as feature infrastructure does.
- **No module touches `@nestjs-cls`.** A repository injects `REPOSITORY_HOST_PORT` of
  `@acme-libs/contracts/database` and reads through `getRepository(<Entity>)`, so infrastructure may
  not import `@nestjs-cls/transactional` or its TypeORM adapter; only `libs/database` and
  `app/setup` do.
- **Infrastructure does not see `libs/database`.** A repository takes the repository host port from
  `@acme-libs/contracts/database` and `MysqlErrorHelper` from the toolkit. The adapters of
  `libs/database` are bound in `app/setup`, so infrastructure cannot inject `RepositoryHostAdapter`
  past the port. The http lib reads `MysqlErrorHelper` from the toolkit too.
- **`toolkit/src/database` may import `typeorm`.** `MysqlErrorHelper` checks for a TypeORM
  `QueryFailedError`. The edge is scoped to that folder by the `file` capture of the lib category,
  so the rest of the toolkit sees only `crypto` and the kernel sees no package.
- **The database contracts name TypeORM.** The repository host port returns a TypeORM
  `Repository`, so the contracts of `database` may import `typeorm`; the other contracts see only
  the base libs.
- **No module registers entities.** The entities of an app are listed once in
  `app/setup/orm/entities`, so only the app may import `@nestjs/typeorm`; `TypeOrmModule.forFeature`
  would add repository tokens that nothing injects.
- **A module root binds no token.** An adapter carries its binding in a static `provider` (see
  `031-static-provider.md`), and a config value is bound in `infrastructure/config` (see
  `030-config-values.md`), so the module root of a feature, a processor, a core, common or global
  module may reach neither its own `outbound` nor `@acme-libs/config`. Only `infrastructure/config`,
  `app/setup/config` and the observability lib import the config lib.
- **A global module has the layers of a feature.** `application/` sees its own outbound, the base
  libs and `@nestjs/common`; `outbound/` sees itself and the base libs; the module root sees the
  application.
- **A global common-adapter reaches any contract of its app and its own outbound.** It implements
  a port of its module's outbound with the port of a common module, which is named after that
  module, not after the global module, so the namesake rule of `appContracts` would refuse it.
