# 21 — Catalog feature

`apps/customer-app/src/features/catalog` serves `GET /products`, what a customer may buy: the active
products, whatever their stock. It has the same layers as `ledger` (see `06-ledger-feature.md`),
with persistence in place of a core adapter: `CatalogGetManyUseCase`,
`CATALOG_CRUD_REPOSITORY_PORT`, and `CatalogCrudRepository`. The pages are cached, and the writes
that change them drop the cache.

## A feature of its own

customer-app has no `product` feature, and an app never imports code of another app, so the catalog
does not reuse the product feature of staff-app. The two read the same `product` table for different
people: staff see every product with its status and version, customers see only the published products, without
their status or their stock. The catalog only reads, so it has no domain, no domain exception,
and no exception filter.

Every route of customer-app needs a customer token, so a caller without one gets a 401. Customers
have no permissions, so any customer may read the catalog.

## What is listed

| Product                         | Listed |
| ------------------------------- | ------ |
| `active`, with or without stock | yes    |
| `draft` or `archived`           | no     |
| soft-deleted (`deleted_at` set) | no     |

**Stock is not a filter.** A published product that sells out stays listed until the processor app
archives it (see `25-processor-app.md`), and the catalog answers no quantity, so no page goes stale
when stock moves. Whether the units are there is decided by the order, which locks the stock and
refuses a short one with `ORDER_STOCK_INSUFFICIENT` (see `22-order-feature.md`).

One query reads the active products in `id` order with `findAndCount`, which adds
`deleted_at IS NULL` for the soft-deleted ones and counts the same rows for the total.

## The cache

`CatalogGetManyUseCase` reads a page through `CATALOG_CACHE_PORT`:

```ts
cache.read({ ...window, compute: () => repository.list({ ...window }) });
```

As for the reminder summary (see `11-reminder-feature.md`), the use case knows how to compute a
page and the port knows how to cache it. `CatalogCacheAdapter` calls `CACHE_PORT.wrap` under
`CACHE_KEYS.catalogPage(page, size)`, `acme:catalog:v1:page:<page>:size:<size>`, for
`CATALOG_CACHE_TTL_MS`, which comes from `CACHE_TTL_MS_DEFAULT` (60 seconds by default). The key
holds the clamped window, so `?size=500` and `?size=100` share one entry.

**Every write that changes a page drops them all.** A page shows which products are listed and
their names, so three writes change it:

| Write             | Where                                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| publish a product | staff-app `ProductPublishUseCase`                                      |
| update a product  | staff-app `ProductUpdateUseCase`                                       |
| archive a product | the core product module, for staff-app and for the processor app alike |

Each drops the pages after its commit through a cache port of its own, and the adapter deletes
every key under `CACHE_KEYS.catalogPrefix()`. Stock movements drop nothing: a restock or an order
changes no page. One write changes the products of many pages and the
totals of all of them, so the cache drops every page rather than working out which ones changed.

**The key is shared by every app.** `CACHE_KEYS` lives in `@acme-libs/contracts/cache`, so staff-app
and the processor app delete the keys customer-app writes. It works because every app points `REDIS_URL` at one Redis,
as the `ledger-record` queue already requires.

**A stale page lives until its TTL at most.** A page read just before a write may be cached again
just after the delete. It then lists a product that was archived a moment ago, and the order of it
is refused as `ORDER_PRODUCT_NOT_FOUND`, the answer a fresh page would have avoided.

## Paging and shape

`page` and `size` work as in `GET /catalog/products` of staff-app: the DTO checks that both are positive
integers, and the use case applies the defaults (page 1, size 20) and caps `size` at 100 with
`PaginationHelper.clampPageWindow`. The response echoes the window it used.

Products come in `id` order, so a product keeps its place while its stock changes. Each item has
`id` as a string, because the column is `bigint unsigned`, `sku`, `name`, and `quantity` as a
number. MySQL answers a `SUM` as a decimal string, so the repository turns it into a number.
