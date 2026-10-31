# 17 — Lint allowlists

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
an application layer, `baseLibs('database')` for infrastructure.

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
- a global module that reaches app contracts, common modules, the entities and the config and
  database libs;
- shared code that reaches the contracts of its namesake, the http lib, the cache contracts and
  `nestjs-pino`;
- the e2e code that reaches app contracts, the queue contracts of core (`ledger`, `product-stock`)
  and the test helpers of the observability lib;
- a feature queue adapter and a processor consumer that reach app contracts: a queue between the
  modules of one app keeps its contract in the app, while a queue written by more than one app
  keeps it in core, `ledger-record` in `@acme-core/contracts/ledger` and
  `product-stock-post-subtract` in `@acme-core/contracts/product-stock`;
- the core-adapters and common-adapters of a common module, and a common module root that mounts
  a core module, another common module or a shared barrel;
- a processor whose application reaches its domain, and the libs of the processor layers: the
  database contracts, the entities, the database and config libs;
- the libs a layer is meant to reach: the cache lib from the app root, the auth
  lib from a feature root, the database contracts from the application of a common module;
- a script, a migration or a seed script that imports its own support files.

Removing one of them turns its spec red.

### `module-areas.mjs` — processors share the layer model of features

Features and processors are built by one function, `areaPolicies`, over the same list of layers
(`categories/module-layers.mjs`). A processor uses fewer of them: `idempotency-purge` has a domain
helper and a repository, `ledger-record` neither. The entries stay, so a processor that grows a layer
follows the same rules
a feature does.

`infrastructure/queue` of a processor injects a queue to manage its jobs, as `ledger-record`
returns the failed jobs to the queue. It takes `InjectQueue` and the `Queue` type and nothing else of
Bull, under the same rule as a feature queue adapter in `queue.mjs`.

The module root of a feature or a processor may reach a shared barrel, as the module root of a
common module may (a positive case of the common modules spec).

### `module-areas.mjs` and `common-modules.mjs` — the two adapter kinds

A core-adapter and a common-adapter have the same shape: they implement an outbound port of their
module and call a contract outside it. Both may reach the domain and the outbound layer of their
module, though today only feature core-adapters reach the domain.

### `acme-core.mjs` — a core module that writes to a queue or a cache

A core module announces what it wrote after the commit (see `28-transaction-port.md`), so three
edges exist for it:

- **`infrastructure/queue`**, a category of its own, holds the queue adapters. It takes
  `InjectQueue` and the `Queue` type and nothing else of Bull (`queue.mjs`), its own contracts and
  the contracts of `ledger`, whose queue every module that writes ledger records shares.
- **The module root registers the queues it writes to** with `BullModule` and nothing else of Bull.
  A core module is mounted by features of several apps, so the queue comes with it rather than with
  the `common/shared` of each app.
- **Core infrastructure may take `@acme-libs/contracts/cache`**, to drop the keys a write makes
  stale; the application still may not, so caching stays an adapter behind a port.

### Where the credentials and the persistence packages are allowed

Code lives with its only caller (see `26-code-placement.md`), so the edges follow the code:

- **A feature signs its users in.** The application of a feature may take
  `@acme-libs/contracts/credentials`, and its module root may mount `@acme-libs/credentials`. No
  core module and no common module signs anyone in today, so neither may.
- **A processor and a global module read tables.** Their infrastructure may import the persistence
  packages (`@nestjs-cls/transactional`, its TypeORM adapter, `@nestjs/typeorm`, `typeorm`) and
  `@nestjs/common`, as feature infrastructure does.
- **A global module has the layers of a feature.** `application/` sees its own outbound, the base
  libs and `@nestjs/common`; `outbound/` sees itself and the base libs; the module root sees both.
- **A global common-adapter reaches any contract of its app and its own outbound.** It implements
  a port of its module's outbound with the port of a common module, which is named after that
  module, not after the global module, so the namesake rule of `appContracts` would refuse it.
