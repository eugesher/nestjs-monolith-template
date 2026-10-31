# 010 — Cache-aside

A read is cached through a port of the module; every write that makes it stale drops it after the
write.

| Part      | Example                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| port      | `apps/staff-app/src/features/tools/modules/reminder/outbound/ports/reminder-summary.port.ts`                |
| use case  | `apps/staff-app/src/features/tools/modules/reminder/application/use-cases/reminder-get-summary.use-case.ts` |
| adapter   | `apps/staff-app/src/features/tools/modules/reminder/infrastructure/cache/reminder-summary-cache.adapter.ts` |
| keys      | `libs/contracts/src/cache/keys/cache-keys.ts`                                                               |
| cache lib | `libs/cache`, `CACHE_PORT` in `libs/contracts/src/cache/ports/cache.port.ts`                                |

## The use case computes, the port caches

```ts
summary.read({ ownerId, compute: () => repository.summarize(ownerId) });
```

The use case has no key, no TTL and no branch on a hit or a miss. The adapter has no repository:
it calls `compute` on a miss through `CACHE_PORT.wrap`. The repository port belongs to the use
case, so the rule of one repository per consumer holds.

**`wrap` already shares one computation among concurrent misses of a key**, and computes without
caching when Redis fails, so an adapter has no single-flight and no fallback of its own. It logs
nothing either: the cache lib logs its failures.

**The TTL is a token of the module**, read from `CACHE_TTL_MS_DEFAULT` with
`ConfigProviderHelper.value`.

## Invalidation after the write

Every use case that writes calls `invalidate` once its write has returned. A write that fails or is
refused invalidates nothing. `delByPrefix` logs a failure and answers 0 instead of throwing, so the
use cases call it without a guard; a stale entry then expires on its TTL.

**Keys are versioned and prefixed** (`acme:<area>:v1:<scope>:`), so one `delByPrefix` drops every
facet of a scope and a change of the cached shape bumps the version instead of reading old values.

**A paged list is a poor fit** when every write touches it: a key per page, size and filter gives
each write as many keys to drop as there are queries. `020-cross-app-cache-invalidation.md` shows
the case where dropping every page is cheap.

## `date` columns stay strings

With `timezone: 'Z'`, mysql2 reads a `date` as midnight UTC, and TypeORM turns it back into a string
with the local getters of the process, which shifts the day west of UTC. Every app sets
`dateStrings: ['DATE']` in `app/setup/orm/type-orm-setup.module.ts`, so the driver hands over
`YYYY-MM-DD` as it is. Example column: `core/entities/src/reminder/reminder.entity.ts`.

## Soft delete

`softDelete` sets `deleted_at`, and TypeORM adds `deleted_at IS NULL` to every find and query
builder on the entity, so a deleted row is gone for every read. Example:
`apps/staff-app/src/features/tools/modules/reminder/infrastructure/persistence/repositories/reminder-delete.repository.ts`.
