# 020 — Cross-app cache invalidation

One app caches a read, other apps drop it after their writes. They meet in one Redis and one key
definition.

| Part                       | Example                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| keys                       | `CACHE_KEYS.catalogPage`, `CACHE_KEYS.catalogPrefix` in `libs/contracts/src/cache/keys/cache-keys.ts`       |
| the cached read            | `apps/customer-app/src/features/catalog/infrastructure/cache/catalog-cache.adapter.ts`                      |
| a dropper in a feature     | `apps/staff-app/src/features/catalog/modules/product/infrastructure/cache/product-catalog-cache.adapter.ts` |
| a dropper in a core module | `core/modules/src/product/infrastructure/cache/product-core-catalog-cache.adapter.ts`                       |

**The key lives in a lib contract.** `@acme-libs/contracts/cache` is read by every app, so a key
that several apps use is defined once. It works because every app points `REDIS_URL` at one Redis,
as the queues already require.

**The read is cache-aside** (see `010-cache-aside.md`): `CatalogGetManyUseCase` passes `compute` to
`CATALOG_CACHE_PORT.read`, and the adapter calls `CACHE_PORT.wrap` under a key of the clamped page
window, so windows that clamp to the same value share one entry.

**A drop deletes every page by prefix.** One write may move rows across many pages and change the
total of all of them, so the adapters call `delByPrefix(CACHE_KEYS.catalogPrefix())` rather than
working out which pages changed.

**Each dropper has a port of its own module**, `PRODUCT_CATALOG_CACHE_PORT` or
`PRODUCT_CORE_CATALOG_CACHE_PORT`, so the application never sees `CACHE_PORT`. A feature drops after
its write has returned; a core module drops in `afterCommit` (see `026-transaction-port.md`).

**A stale page lives until its TTL at most.** A page read just before a write may be cached again
just after the drop.
