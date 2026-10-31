# 21 — Catalog feature

`apps/customer-app/src/features/catalog` serves `GET /products`, what a customer may buy: the active
products that have stock on hand. It has the same layers as `ledger` (see `06-ledger-feature.md`),
with persistence in place of a core adapter: `CatalogGetManyUseCase`,
`CATALOG_CRUD_REPOSITORY_PORT`, and `CatalogCrudRepository`. The pages are cached, and the writes
that change them drop the cache.

## A feature of its own

customer-app has no `product` feature, and an app never imports code of another app, so the catalog
does not reuse the product feature of staff-app. The two read the same `product` table for different
people: staff see every product with its status and version, customers see only what they can
order, with the quantity on hand. The catalog only reads, so it has no domain, no domain exception,
and no exception filter.

Every route of customer-app needs a customer token, so a caller without one gets a 401. Customers
have no permissions, so any customer may read the catalog.

## What is listed

| Product                                | Listed |
| -------------------------------------- | ------ |
| `active` with stock on hand above zero | yes    |
| `active` and sold out                  | no     |
| `draft` or `archived`, even with stock | no     |
| soft-deleted (`deleted_at` set)        | no     |

The quantity on hand is `SUM(product_stock.quantity)` of the product (see
`20-order-and-stock-schema.md`). One query joins the stock rows, groups them by product, and keeps
the groups with `HAVING SUM(quantity) > 0`. TypeORM adds `deleted_at IS NULL` for the soft-deleted
products on its own. The total counts the same grouped query as a subquery, because a `COUNT` over
the joined rows would count stock movements, not products.

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

**Every write that changes a page drops them all.** A page shows which products are listed, their
names and their quantities, so five writes change it:

| Write             | App          | Use case                |
| ----------------- | ------------ | ----------------------- |
| publish a product | staff-app    | `ProductPublishUseCase` |
| archive a product | staff-app    | `ProductArchiveUseCase` |
| update a product  | staff-app    | `ProductUpdateUseCase`  |
| restock a product | staff-app    | `ProductRestockUseCase` |
| place an order    | customer-app | `OrderPlaceUseCase`     |

Each calls a cache port of its own feature once its write has returned, and the adapter deletes
every key under `CACHE_KEYS.catalogPrefix()`. One write changes the products of many pages and the
totals of all of them, so the cache drops every page rather than working out which ones changed.

**The key is shared by two apps.** `CACHE_KEYS` lives in `@acme-libs/contracts/cache`, so staff-app
deletes the keys customer-app writes. It works because every app points `REDIS_URL` at one Redis,
as the `ledger-record` queue already requires.

**A stale page cannot sell what is gone.** A page read just before a write may be cached again just
after the delete and live until its TTL. It may then offer units that are sold, but an order locks
the stock rows and checks the quantity itself (see `22-order-feature.md`), so the worst outcome is
an `ORDER_STOCK_INSUFFICIENT` that a fresh page would have avoided.

## Paging and shape

`page` and `size` work as in `GET /catalog/products` of staff-app: the DTO checks that both are positive
integers, and the use case applies the defaults (page 1, size 20) and caps `size` at 100 with
`PaginationHelper.clampPageWindow`. The response echoes the window it used.

Products come in `id` order, so a product keeps its place while its stock changes. Each item has
`id` as a string, because the column is `bigint unsigned`, `sku`, `name`, and `quantity` as a
number. MySQL answers a `SUM` as a decimal string, so the repository turns it into a number.
