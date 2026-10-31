# 08 — Product feature

`apps/staff-app/src/features/catalog/modules/product` is the back office catalog behind
`/catalog/products`. This note covers the
`ProductModel` aggregate, optimistic concurrency, idempotent creation, restocking, the ledger record
of an archive, the cached customer catalog, the adapters behind the ports and the HTTP surface.

## The aggregate

A product is `draft`, `active` or `archived`. Every change that reaches the database bumps
`version`. No status freezes a product: a draft, an active and an archived product are updated and
restocked alike, and an archived product can be published again. Archiving itself lives in the core
product module (see `29-core-product.md`), because the staff app and the processor app both
archive.

| Rule                                         | Code                       |
| -------------------------------------------- | -------------------------- |
| `sku` matches `^[A-Z0-9][A-Z0-9-]{2,63}$`    | `PRODUCT_SKU_INVALID`      |
| `name` is 1 to 255 characters after trimming | `PRODUCT_NAME_INVALID`     |
| `version` is a positive integer              | `PRODUCT_VERSION_INVALID`  |
| a restock adds 1 to 100 000 units            | `PRODUCT_QUANTITY_INVALID` |

**The id is a string.** The column is `bigint unsigned`, which may exceed the safe integer range of
a JavaScript number, so the id stays a string from the row to the response.

**An update changes only the fields it names.** `update(changes)` takes the fields a client may
edit, today the name. A field left out stays as it is, and an update to the current values changes
nothing: it records no event and keeps the version, so the write service does not touch the
database either. A client that repeats an update does not invalidate the `If-Match` version of
everyone else.

**Publishing puts a product in front of customers.** `publish()` moves a `draft` or an `archived`
product to `active`, bumps the version and records `ProductPublishedEvent` with the version it
produced and the status it left. Publishing an active product changes nothing. There is no way back
to `draft`: a published product leaves the catalog only through an archive, and an archived one
returns through a new publication.

**A restock does not change the product.** `restock(quantity)` checks the quantity, keeps the
version and records `ProductRestockedEvent`, whatever the status. The units live in
`product_stock` (see Restock below), so `If-Match` has nothing to guard.

**Events are recorded, not published.** `create`, `update`, `publish` and `restock` add
`ProductCreatedEvent`, `ProductUpdatedEvent`, `ProductPublishedEvent` and
`ProductRestockedEvent`. A use case pulls them after the write and hands them to
`ProductLedgerService` together with the stored id, because a created product has no id until the
insert. The service turns them into ledger records (see below).

## Access

A product belongs to the catalog, not to a person. `ProductAccessService` loads a product by its id
or refuses it with `PRODUCT_NOT_FOUND` (404), and `GET /catalog/products` lists the whole catalog. Who may
read and who may change the catalog is a question of permissions, answered before the use case runs
(see HTTP below).

Ownership, a 404 for the record of another user, is shown by the reminders and the notes of
staff-app (see `11-reminder-feature.md` and `12-note-feature.md`).

## Optimistic concurrency

`ProductWriteService.write(command, mutate)` is the only way to change a stored product. Every attempt:

1. loads the product fresh through `ProductAccessService`;
2. checks the `If-Match` version with `ProductHelper.assertExpectedVersion`;
3. applies `mutate` in memory;
4. saves with `UPDATE … WHERE version = <as read>`.

**The repository answers a lost race with `false`, not an error.** The service reads the current
version and throws `ProductWriteConflictError`, which only `OccRetryHelper` sees. Because the class
is local to the feature, the retry loop cannot swallow another module's conflict.

**The budget is `PRODUCT_OCC_RETRY_ATTEMPTS`** (`OCC_RETRY_ATTEMPTS`, 5 by default). A pinned
`If-Match` collapses it to one attempt: retrying against a newer version would apply a change the
client never saw. A spent budget is `VERSION_MISMATCH` (409) with `details.currentVersion`. A
domain refusal is never retried.

After a successful save the service reads the row again, so the answer carries the new
`updatedAt`.

## Idempotent creation

`ProductCreateUseCase` claims the `Idempotency-Key` on the logical body `{ sku, name }`
before any work:

| Claim       | Answer                                       |
| ----------- | -------------------------------------------- |
| `claimed`   | create the product                           |
| `replay`    | the stored response, nothing else happens    |
| `in-flight` | `PRODUCT_IDEMPOTENT_REQUEST_IN_FLIGHT` (409) |
| `mismatch`  | `PRODUCT_IDEMPOTENCY_KEY_REUSED` (422)       |

**The insert and the completion of the key share one transaction.** If completing the key fails,
the product is rolled back with it. Otherwise a stored product with a released key would answer the
client's retry with `PRODUCT_SKU_TAKEN` instead of a replay.

Any failure after the claim releases the key, so an honest retry can take it again. A failure
after the commit, such as enqueueing the ledger record, leaves a completed key that `release` does
not delete, so the retry is a replay.

## Restock

`POST /catalog/products/:productId/stock` with `{ quantity }` writes a `+quantity` row to `product_stock`
without an order line (see `20-order-and-stock-schema.md`) and answers 201 with
`{ productId, quantity }`, where `quantity` is the stock on hand after the restock. A draft can be
restocked, so its stock is ready when it becomes active, and so can an archived one, so its stock
is ready when it is published again. An unknown or soft-deleted product is `PRODUCT_NOT_FOUND`
(404).

`ProductRestockUseCase` claims the `Idempotency-Key` on `{ productId, quantity }`, with the outcomes of
a creation, and then runs one transaction:

1. `PRODUCT_STOCK_PORT.lock` locks the product row with `SELECT … FOR UPDATE`;
2. `findById` reads the product, now that nobody else can change it;
3. the aggregate checks the quantity;
4. `PRODUCT_STOCK_PORT.restock` writes the movement and sums the stock on hand with `FOR SHARE`;
5. the key is completed with the answer.

Both stock calls go through `ProductStockCoreAdapter` to the core product stock module (see
`24-core-product-stock.md`), which owns `product_stock`.

**The product row is the lock, as for an order** (see `22-order-feature.md`). The lock on it is taken
before anything else, so a restock and an order never wait for each other in opposite orders.
An archive locks the same row, so it waits for the restock to commit or the restock waits for the
archive. Two restocks of one product queue on the row too, so the
sum in each answer counts every movement committed before it.

After the commit, `ProductLedgerService.enqueueRestocked` puts the record on the `ledger-record`
queue. Every restock is a fact of its own, so the operation key is the id of the stock row,
`product-restocked:<productStockId>`, not the product id.

## Archiving

`ProductArchiveUseCase` hands the archive to the core product module through `PRODUCT_STATUS_PORT`
and `ProductStatusCoreAdapter` (see `29-core-product.md`). The core module locks the row, archives,
and after the commit drops the cached customer catalog and enqueues the ledger record
`product-archived:<id>:<version>` itself. The feature turns the outcome into its own answer:

| Core outcome       | Answer                                                     |
| ------------------ | ---------------------------------------------------------- |
| `archived`         | 200, the product read again through `ProductAccessService` |
| `not-found`        | `PRODUCT_NOT_FOUND` (404)                                  |
| `version-mismatch` | `VERSION_MISMATCH` (409), with `details.currentVersion`    |
| `already-archived` | `PRODUCT_ALREADY_ARCHIVED` (409)                           |

## The ledger records of the queue

After the commit, `ProductCreateUseCase` and `ProductPublishUseCase` hand their domain events to
`ProductLedgerService.enqueue`, and `ProductRestockUseCase` hands its events and the id of the new
stock row to `ProductLedgerService.enqueueRestocked`. The service turns each event into a ready
record and puts it on the `ledger-record` queue through `PRODUCT_LEDGER_RECORD_PORT`:

| Domain event            | Operation key                        | Action             | Payload                 |
| ----------------------- | ------------------------------------ | ------------------ | ----------------------- |
| `ProductCreatedEvent`   | `product-created:<id>`               | `ProductCreated`   | `sku`, `name`           |
| `ProductPublishedEvent` | `product-published:<id>:<version>`   | `ProductPublished` | `sku`, `previousStatus` |
| `ProductRestockedEvent` | `product-restocked:<productStockId>` | `ProductRestocked` | `sku`, `quantity`       |

The subject type is `product` and the subject id is the product id, which comes from the command,
because a created product has no id in its event. An update is not a ledger fact, so
`ProductUpdateUseCase` enqueues nothing. A product may be published again after an archive, so the
version the publication produced is part of its key: a key of the id alone would let the ledger
drop the second publication as a replay of the first. The record carries the correlation id of the request, read
from the context in the application: the job runs in another async chain.

The product is already committed, so a failing enqueue must not undo it either. The service tries
`LEDGER_RETRY_ATTEMPTS` times through `ReplayRetryHelper` and then logs the record at `error` for a
replay.

**An enqueue has a deadline.** While Redis is down, Bull keeps the command in the offline queue of
its client and `add` never settles, so the request would hang after the commit. The adapter races
`add` against `REDIS_COMMAND_TIMEOUT_MS` (`PRODUCT_LEDGER_RECORD_TIMEOUT_MS`) and throws when it runs
out. A timed-out `add` may still reach Redis once it is back, and so may its retries: the ledger
keeps the first row of the key, so the copies append nothing.

## Logs

A write logs its outcome at `info` after the work: `Product created`, `Product updated`,
`Product published`, `Product restocked`, or a replay of a creation or a restock. A lost race logs at `info` and a spent budget at `warn`.
Reads log nothing. The correlation id comes from the context.

## The customer catalog

customer-app caches the pages of its catalog (see `21-catalog-feature.md`), and every write here
that changes the list drops them: `ProductUpdateUseCase` and `ProductPublishUseCase` call
`PRODUCT_CATALOG_CACHE_PORT.invalidate()` once their write has returned, and the core product module
drops them after an archive. A creation drops nothing, because a draft is not in the catalog, and
neither does a restock: the catalog shows no quantities. A write that fails or is refused drops
nothing.

`ProductCatalogCacheAdapter` deletes every key under `CACHE_KEYS.catalogPrefix()` through
`CACHE_PORT`. The key lives in `@acme-libs/contracts/cache`, which both apps read, and both apps
point `REDIS_URL` at one Redis, so a delete in staff-app reaches the cache of customer-app. A failed
delete does not fail the write: the cache lib logs it and the pages expire on their TTL.

## Persistence

Each port has its own repository: `ProductAccessRepository`, `ProductCreateRepository`,
`ProductCrudRepository`, `ProductRestockRepository` and `ProductWriteRepository`. The access,
restock and write repositories share `findById` through `ProductFindByIdBaseRepository`. Every
repository reads the `product` table through `TransactionHost`, so a query inside
`TRANSACTION_PORT.run` joins that transaction. No repository of the feature touches
`product_stock`: the core product stock module writes it, and `ProductTypeOrmModule` registers
`Product` only.

**The version check is in the `WHERE`.** `update` runs
`UPDATE product SET name, status, version = <new> WHERE id = ? AND version = <as read>` and answers
whether exactly one row changed. The repository does not read the row again and throws nothing.

**`insert` reads the row back by its sku**, so the answer carries the id and the times the database
set. A duplicate sku that slips past `existsBySku` in a race becomes `PRODUCT_SKU_TAKEN`, the same code
the use case answers when it sees the sku first.

`list` returns a page of the catalog, the newest products first.

## Adapters

| Port                         | Adapter                           | Target                      |
| ---------------------------- | --------------------------------- | --------------------------- |
| `PRODUCT_IDEMPOTENCY_PORT`   | `ProductIdempotencyCoreAdapter`   | `IDEMPOTENCY_CORE_KEY_PORT` |
| `PRODUCT_LEDGER_RECORD_PORT` | `ProductLedgerRecordQueueAdapter` | the `ledger-record` queue   |
| `PRODUCT_CATALOG_CACHE_PORT` | `ProductCatalogCacheAdapter`      | `CACHE_PORT`                |
| `PRODUCT_STATUS_PORT`        | `ProductStatusCoreAdapter`        | `PRODUCT_CORE_PORT`         |

The idempotency adapter turns the claim outcome enum of the core module into the plain outcomes of
the port and hands a replay's stored response back as the type the use case expects.

**The queue adapter speaks the contract of its consumer.** The queue name and the job type live in
`@acme-core/contracts/ledger`, which customer-app writes to as well. The adapter adds the record as
one job and nothing else: the job options come with the queue registration of
`@acme-staff-common/shared/ledger-record`.

The adapter lives in `infrastructure/queue`, a layer of its own. It is the only place in the feature
that reaches both the ledger contract and Bull, so persistence cannot import a core contract
around the core-adapters.

## HTTP

| Method and path                            | Permission        | Headers                     | Answer                  |
| ------------------------------------------ | ----------------- | --------------------------- | ----------------------- |
| `POST /catalog/products`                   | `product:write`   | `Idempotency-Key`, required | 201, the product        |
| `GET /catalog/products`                    | `product:read`    |                             | 200, a page of products |
| `GET /catalog/products/:productId`         | `product:read`    |                             | 200, the product        |
| `PATCH /catalog/products/:productId`       | `product:write`   | `If-Match`, optional        | 200, the product        |
| `PUT /catalog/products/:productId/publish` | `product:write`   | `If-Match`, optional        | 200, the product        |
| `PUT /catalog/products/:productId/archive` | `product:archive` | `If-Match`, optional        | 200, the product        |
| `POST /catalog/products/:productId/stock`  | `product:restock` | `Idempotency-Key`, required | 201, the stock on hand  |

A replay of a creation or a restock answers 201 with the stored body, exactly like the first request.

**`PATCH` edits fields, `PUT` sets a state.** The body of `PATCH /catalog/products/:productId`
names the fields to change, every one optional, and an empty body answers the product as it is.
Publishing and archiving have no body: `PUT` on the state resource says what the product becomes,
and publishing a published product again changes nothing. Archiving an archived product is the
one refusal.

**Every route names its permission.** `@RequiresPermission` refuses a caller without the code with
403 before the use case runs (see `02-global-auth-guards.md`). Publishing goes with `product:write`, like an update. Archiving has a code of its own,
because it takes a product away from customers, and so has restocking, because it changes what
customers can buy. The seeded admin and editor hold all four codes, the viewer only `product:read`.

**`productId` is a string of digits**, from 1 to 20 of them without a leading zero, checked by
`ProductIdRequestDto`. Anything else is a 400 at the edge instead of a lookup that cannot match.

### Headers

`IfMatch` lives in `common/shared`, because only staff features use it. `IdempotencyKey` lives in
`libs/http`, because the customer `order` feature reads the same header:

| Alias                                   | Decorator        | Refusal                                                     |
| --------------------------------------- | ---------------- | ----------------------------------------------------------- |
| `@acme-staff-common/shared/concurrency` | `IfMatch`        | `IF_MATCH_INVALID` (400)                                    |
| `@acme-libs/http`                       | `IdempotencyKey` | `IDEMPOTENCY_KEY_REQUIRED`, `IDEMPOTENCY_KEY_INVALID` (400) |

- **`If-Match` is a version, not an entity tag.** `3` and `"3"` both mean version 3; a missing or
  empty header means "no expectation". Anything that is not a non-negative integer, including a weak
  tag `W/"3"`, is refused rather than ignored, so a typo cannot turn into an unconditional write.
- **`Idempotency-Key` is trimmed and at most 128 characters**, the width of the
  `idempotency_key` column. The core module refuses a longer key with a plain `Error`, which
  would be a 500, so the decorator answers 400 first.

### Errors

`ProductHttpExceptionFilter` maps the domain codes to statuses and hands the response to the
`HttpExceptionFilter` of `libs/http`. The body is `{ statusCode, message, code }`, plus `details`
when the exception has them, such as `details.currentVersion` of `VERSION_MISMATCH`.

| Code                                                                                                        | Status |
| ----------------------------------------------------------------------------------------------------------- | ------ |
| `PRODUCT_SKU_INVALID`, `PRODUCT_NAME_INVALID`, `PRODUCT_VERSION_INVALID`                                    | 400    |
| `PRODUCT_NOT_FOUND`                                                                                         | 404    |
| `PRODUCT_ALREADY_ARCHIVED`, `PRODUCT_SKU_TAKEN`, `PRODUCT_IDEMPOTENT_REQUEST_IN_FLIGHT`, `VERSION_MISMATCH` | 409    |
| `PRODUCT_IDEMPOTENCY_KEY_REUSED`                                                                            | 422    |

There is no global filter for TypeORM's `OptimisticLockVersionMismatchError`. TypeORM throws it only
for a read with an optimistic lock, and nothing reads that way: the version check is the `WHERE` of
the update, and its conflict arrives as `VERSION_MISMATCH` above.

## Wiring

`ProductModule` imports `ProductTypeOrmModule.forFeature()`, `LedgerRecordQueueModule`,
`IdempotencyCoreModule`, `ProductCoreModule` and `ProductStockCoreModule`, binds every port with `{ provide, useClass }` and reads
`PRODUCT_OCC_RETRY_ATTEMPTS` from `OCC_RETRY_ATTEMPTS` and `PRODUCT_LEDGER_RETRY_ATTEMPTS` from
`LEDGER_RETRY_ATTEMPTS`. The app's entity list includes `Product`,
`IdempotencyKey` and `LedgerEntry`, because the modules the feature mounts need them on the app's
connection. The queue adapter relies on the Bull connection of `QueueSetupModule`.
