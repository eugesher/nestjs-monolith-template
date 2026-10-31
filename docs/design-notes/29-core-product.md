# 29 — Core product

`core/modules/src/product` archives a product. It is a core module because two apps archive: the
staff `product` feature on request, and the processor `product-stock` when a published product has
no stock left (see `25-processor-app.md`). Its contract `core/contracts/src/product` has one port:

| Port                | Facade              | Method                                    |
| ------------------- | ------------------- | ----------------------------------------- |
| `PRODUCT_CORE_PORT` | `ProductCoreFacade` | `archive({ productId, expectedVersion })` |

The rest of the product lifecycle has one caller, staff `product`, and stays there (see
`08-product-feature.md` and `26-code-placement.md`). The module has a model of its own,
`ProductCoreModel`, which knows the id, the sku, the status and the version and nothing else.

## Archiving

`ProductCoreArchiveUseCase` runs in `TRANSACTION_PORT.run`, so it joins the transaction of a caller
that has one, as the processor does, and opens its own otherwise:

1. `lockById` reads the product with `SELECT … FOR UPDATE`;
2. a missing product, a stale `expectedVersion` or an archived product ends the call with an
   outcome and writes nothing;
3. the model archives a `draft` or an `active` product and bumps the version;
4. `update` writes the status and the version;
5. `afterCommit` queues the announcement of the archive.

**A lock instead of an optimistic retry.** The row is locked before it is read, so no other write
can change it between the read and the update, and there is no lost race to retry. The lock is the
row the core product stock module locks first too (see `24-core-product-stock.md`), so an archive,
a restock and an order on one product queue behind each other. `expectedVersion` still guards the
`If-Match` of staff-app.

**The answer is an outcome, not an exception.** Each caller has its own words for a refusal:

| Outcome            | `currentVersion` | staff `product`                  | processor `product-stock`  |
| ------------------ | ---------------- | -------------------------------- | -------------------------- |
| `archived`         | the new version  | 200, the product                 | logs the archive           |
| `already-archived` | the version      | `PRODUCT_ALREADY_ARCHIVED` (409) | nothing                    |
| `not-found`        | none             | `PRODUCT_NOT_FOUND` (404)        | nothing                    |
| `version-mismatch` | the version      | `VERSION_MISMATCH` (409)         | never, it sends no version |

## After the commit

The hook does two things, in this order:

1. **It drops the cached customer catalog** through `PRODUCT_CORE_CATALOG_CACHE_PORT`, so the
   archived product leaves `GET /products` at once (see `21-catalog-feature.md`). A failed delete is
   logged by the cache lib, and the pages expire on their TTL.
2. **It queues the ledger record** through `PRODUCT_CORE_LEDGER_RECORD_PORT` on the `ledger-record`
   queue, which the processor app appends (see `09-ledger-record-processor.md`):

| Operation key                     | Action            | Payload                 |
| --------------------------------- | ----------------- | ----------------------- |
| `product-archived:<id>:<version>` | `ProductArchived` | `sku`, `previousStatus` |

**The version is part of the key**, because an archived product can be published and archived
again: a key of the id alone would let the ledger drop the second archive as a replay. The record
carries the correlation id of the request or the job that archived. The enqueue races
`REDIS_COMMAND_TIMEOUT_MS` and is retried `LEDGER_RETRY_ATTEMPTS` times before it is logged at
`error` for a replay; the archive stays committed either way.

## Wiring

| Port                                   | Implementation                        |
| -------------------------------------- | ------------------------------------- |
| `PRODUCT_CORE_ARCHIVE_REPOSITORY_PORT` | `ProductCoreArchiveRepository`        |
| `PRODUCT_CORE_LEDGER_RECORD_PORT`      | `ProductCoreLedgerRecordQueueAdapter` |
| `PRODUCT_CORE_CATALOG_CACHE_PORT`      | `ProductCoreCatalogCacheAdapter`      |

`ProductCoreModule` registers `Product` through `ProductCoreTypeOrmModule` and the `ledger-record`
queue with the job options of `@acme-core/contracts/ledger`. `CACHE_PORT` comes from the global
`CacheModule` of each app.

| Caller                        | Feature port                 | Core-adapter                     |
| ----------------------------- | ---------------------------- | -------------------------------- |
| staff-app `product`           | `PRODUCT_STATUS_PORT`        | `ProductStatusCoreAdapter`       |
| processor-app `product-stock` | `PRODUCT_STOCK_ARCHIVE_PORT` | `ProductStockArchiveCoreAdapter` |
