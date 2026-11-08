# 010 — Cache-aside

A read is cached through a port of the module; every write that makes it stale drops it after the
write.

| Part      | Example                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| port      | `apps/staff-app/src/features/tools/modules/reminder/outbound/ports/reminder-summary.port.ts`                |
| use case  | `apps/staff-app/src/features/tools/modules/reminder/application/use-cases/reminder-get-summary.use-case.ts` |
| adapter   | `apps/staff-app/src/features/tools/modules/reminder/infrastructure/cache/reminder-summary-cache.adapter.ts` |
| keys      | `libs/contracts/src/cache/keys/cache-keys.ts`                                                               |
| cache lib | `libs/cache`, `CACHE_LIB_PORT` in `libs/contracts/src/cache/ports/cache-lib.port.ts`                        |

## The use case computes, the port caches

```ts
summary.read({ ownerId, compute: () => repository.summarize(ownerId) });
```

The use case has no key, no TTL and no branch on a hit or a miss. The adapter has no repository: it
calls `compute` on a miss through `CACHE_LIB_PORT.handleWrap`. The repository port belongs to the
use case, so the rule of one repository per consumer holds.

**`handleWrap` already shares one computation among concurrent misses of a key**, and computes
without caching when Redis fails, so an adapter has no single-flight and no fallback of its own. It
logs nothing either: the cache lib logs its failures.

**The TTL is a token of the module**, bound to `CACHE_TTL_MS_DEFAULT` in `infrastructure/config`
(see `030-config-values.md`).

## The cache lib

`libs/cache` has the shape of `libs/health` (see `017-credentials-lib.md`): `CacheLibFacade`
implements `CACHE_LIB_PORT` and hands each method to a use case, and the use cases reach Redis and
OpenTelemetry through two ports of the lib's own `outbound`:

| Facade method       | Use case                     | Span                |
| ------------------- | ---------------------------- | ------------------- |
| `handleGet`         | `CacheLibGetUseCase`         | `cache.get`         |
| `handleSet`         | `CacheLibSetUseCase`         | `cache.set`         |
| `handleDel`         | `CacheLibDelUseCase`         | `cache.del`         |
| `handleDelByPrefix` | `CacheLibDelByPrefixUseCase` | `cache.delByPrefix` |
| `handleWrap`        | `CacheLibWrapUseCase`        | `cache.wrap`        |

**`CacheLibStoreAdapter` is the ioredis adapter.** It holds the JSON encoding, `PX` TTLs, the `SCAN`
and `UNLINK` loop under the client's `keyPrefix`, and quits the client on shutdown.
`CacheLibRedisClientProvider` builds the client from `REDIS_URL` and `REDIS_COMMAND_TIMEOUT_MS`.

**`CacheLibTracerAdapter` is the OpenTelemetry adapter.** A use case names the span and its
attributes, adds `cache.hit` or `cache.keys_unlinked` as it learns them, and the adapter records
them when the work settles. Single-flight, the fallbacks on a failed read or write, and their logs
stay in the use cases, so neither adapter decides what a failure means.

**The Redis commands are child spans.** `cache.wrap` reads and writes through the store, not through
`cache.get` and `cache.set`, so it opens no nested span of the lib. The auto-instrumentation of
ioredis, on in `TracerHelper`, records each command (`get`, `set`) as a child of the span the
adapter opened, because `startActiveSpan` makes it the active one while the work runs. The tracer
must start before ioredis is loaded, so `main.ts` imports `@acme-libs/observability/tracer` first.

## Invalidation after the write

Every use case that writes calls `invalidate` once its write has returned. A write that fails or is
refused invalidates nothing. `handleDelByPrefix` logs a failure and answers 0 instead of throwing,
so the use cases call it without a guard; a stale entry then expires on its TTL.

**Keys are versioned and prefixed** (`acme:<area>:v1:<scope>:`), so one `handleDelByPrefix` drops
every facet of a scope and a change of the cached shape bumps the version instead of reading old
values.

**A paged list is a poor fit** when every write touches it: a key per page, limit and filter gives
each write as many keys to drop as there are queries. `020-cross-app-cache-invalidation.md` shows
the case where dropping every page is cheap.

## `date` columns stay strings

With `timezone: 'Z'`, mysql2 reads a `date` as midnight UTC, and TypeORM turns it back into a string
with the local getters of the process, which shifts the day west of UTC. `OrmModule` of
`libs/database` sets `dateStrings: ['DATE']` for every app, so the driver hands over `YYYY-MM-DD` as
it is. Example column: `apps/staff-app/src/common/entities/reminder/reminder.entity.ts`.

## Soft delete

`softDelete` sets `deleted_at`, and TypeORM adds `deleted_at IS NULL` to every find and query
builder on the entity, so a deleted row is gone for every read. Example:
`apps/staff-app/src/features/tools/modules/reminder/infrastructure/persistence/repositories/reminder-delete.repository.ts`.
