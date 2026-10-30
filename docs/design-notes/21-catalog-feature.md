# 21 — Catalog feature

`apps/customer-app/src/features/catalog` serves `GET /products`, what a customer may buy: the active
products that have stock on hand. It has the same layers as `ledger` (see `06-ledger-feature.md`),
with persistence in place of a core adapter: `CatalogGetManyUseCase`,
`CATALOG_CRUD_REPOSITORY_PORT`, and `CatalogCrudRepository`.

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

**No cache.** Every order changes the quantity on hand, so a cached page would offer units that are
gone.

## Paging and shape

`page` and `size` work as in `GET /products` of staff-app: the DTO checks that both are positive
integers, and the use case applies the defaults (page 1, size 20) and caps `size` at 100 with
`PaginationHelper.clampPageWindow`. The response echoes the window it used.

Products come in `id` order, so a product keeps its place while its stock changes. Each item has
`id` as a string, because the column is `bigint unsigned`, `sku`, `name`, and `quantity` as a
number. MySQL answers a `SUM` as a decimal string, so the repository turns it into a number.
