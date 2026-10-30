# 08 — Product feature

`apps/staff-app/src/features/product` is the back office catalog behind `/products`. This note covers the
`ProductModel` aggregate, optimistic concurrency, idempotent creation, the ledger record of an archive,
the adapters behind the ports and the HTTP surface.

## The aggregate

`ProductModel` walks `draft → active → archived`. Every change that reaches the database bumps
`version`, and an archived product refuses every further change with `PRODUCT_ALREADY_ARCHIVED`.

| Rule                                         | Code                      |
| -------------------------------------------- | ------------------------- |
| `sku` matches `^[A-Z0-9][A-Z0-9-]{2,63}$`    | `PRODUCT_SKU_INVALID`     |
| `name` is 1 to 255 characters after trimming | `PRODUCT_NAME_INVALID`    |
| `version` is a positive integer              | `PRODUCT_VERSION_INVALID` |

**The id is a string.** The column is `bigint unsigned`, which may exceed the safe integer range of
a JavaScript number, so the id stays a string from the row to the response.

**A rename to the current name changes nothing.** It records no event and keeps the version, so
the write service does not touch the database either. A client that repeats a rename does not
invalidate the `If-Match` version of everyone else.

**Events are recorded, not published.** `create`, `rename` and `archive` add `ProductCreatedEvent`,
`ProductRenamedEvent` and `ProductArchivedEvent`. A use case pulls them after the write and hands them to
`ProductLedgerService` together with the stored id, because a created product has no id until the
insert. The service turns them into ledger records (see below).

## Access

A product belongs to the catalog, not to a person. `ProductAccessService` loads a product by its id
or refuses it with `PRODUCT_NOT_FOUND` (404), and `GET /products` lists the whole catalog. Who may
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

## The ledger record of an archive

`ProductArchiveUseCase` writes the product, enqueues its ledger records and then asks
`ProductLedgerService` to append the archive itself under the operation key `product-archived:<id>`.
The `ledger-record` processor appends the same record from the queue (see
`09-ledger-record-processor.md`), and the ledger keeps one row.

**Both paths write the same record**: `ProductLedgerService` builds it once, with the payload
`{ sku, previousStatus }`. Whichever append comes first wins the key, so a payload that differed
between them would make the row depend on that order. `ProductArchivedEvent` carries the `sku` for
this reason.

The archive is already committed, so a failing append must not undo it. `ProductLedgerService` tries
three times through `ReplayRetryHelper` and then logs the record at `error` for a replay instead of
throwing.

## The ledger records of the queue

After the commit, `ProductCreateUseCase` and `ProductArchiveUseCase` hand their domain events to
`ProductLedgerService.enqueue`, which turns each into a ready record and puts it on the
`ledger-record` queue through `PRODUCT_LEDGER_RECORD_PORT`:

| Domain event           | Operation key           | Action            | Payload                 |
| ---------------------- | ----------------------- | ----------------- | ----------------------- |
| `ProductCreatedEvent`  | `product-created:<id>`  | `ProductCreated`  | `sku`, `name`           |
| `ProductArchivedEvent` | `product-archived:<id>` | `ProductArchived` | `sku`, `previousStatus` |

The subject type is `product` and the subject id is the product id, which comes from the command,
because a created product has no id in its event. A rename is not a ledger fact, so
`ProductRenameUseCase` enqueues nothing. The record carries the correlation id of the request, read
from the context in the application: the job runs in another async chain.

The product is already committed, so a failing enqueue must not undo it either. The service tries
three times through `ReplayRetryHelper` and then logs the record at `error` for a replay.

**An enqueue has a deadline.** While Redis is down, Bull keeps the command in the offline queue of
its client and `add` never settles, so the request would hang after the commit. The adapter races
`add` against `REDIS_COMMAND_TIMEOUT_MS` (`PRODUCT_LEDGER_RECORD_TIMEOUT_MS`) and throws when it runs
out. A timed-out `add` may still reach Redis once it is back, and so may its retries: the ledger
keeps the first row of the key, so the copies append nothing.

## Logs

A write logs its outcome at `info` after the work: `Product created`, `Product renamed`,
`Product archived`, or a replay of a creation. A lost race logs at `info` and a spent budget at `warn`.
Reads log nothing. The correlation id comes from the context.

## Persistence

Each port has its own repository: `ProductAccessRepository`, `ProductCreateRepository`,
`ProductCrudRepository` and `ProductWriteRepository`. The access and write repositories share `findById`
through `ProductFindByIdBaseRepository`. Every repository reads the `product` table through
`TransactionHost`, so a query inside `TRANSACTION_PORT.run` joins that transaction.

**The version check is in the `WHERE`.** `update` runs
`UPDATE product SET name, status, version = <new> WHERE id = ? AND version = <as read>` and answers
whether exactly one row changed. The repository does not read the row again and throws nothing.

**`insert` reads the row back by its sku**, so the answer carries the id and the times the database
set. A duplicate sku that slips past `existsBySku` in a race becomes `PRODUCT_SKU_TAKEN`, the same code
the use case answers when it sees the sku first.

`list` returns a page of the catalog, the newest products first.

## Adapters

| Port                         | Adapter                           | Target                    |
| ---------------------------- | --------------------------------- | ------------------------- |
| `PRODUCT_LEDGER_PORT`        | `ProductLedgerCoreAdapter`        | `LEDGER_CORE_APPEND_PORT` |
| `PRODUCT_IDEMPOTENCY_PORT`   | `ProductIdempotencyCommonAdapter` | `IDEMPOTENCY_COMMON_PORT` |
| `PRODUCT_LEDGER_RECORD_PORT` | `ProductLedgerRecordQueueAdapter` | the `ledger-record` queue |

The idempotency adapter turns the claim outcome enum of the common module into the plain outcomes of
the port and hands a replay's stored response back as the type the use case expects.

**The queue adapter speaks the contract of its consumer.** The queue name and the job type live in
`@acme-staff-contracts/ledger-record`, next to the processor that reads them. The adapter adds the
record as one job and nothing else: the job options come with the queue registration of
`@acme-staff-common/shared/ledger-record`.

The adapter lives in `infrastructure/queue`, a layer of its own. It is the only place in the feature
that reaches both the contracts of the app and Bull, so persistence cannot import the idempotency
contract around its common-adapter.

## HTTP

| Method and path                      | Permission        | Headers                     | Answer                  |
| ------------------------------------ | ----------------- | --------------------------- | ----------------------- |
| `POST /products`                     | `product:write`   | `Idempotency-Key`, required | 201, the product        |
| `GET /products`                      | `product:read`    |                             | 200, a page of products |
| `GET /products/:productId`           | `product:read`    |                             | 200, the product        |
| `PATCH /products/:productId/name`    | `product:write`   | `If-Match`, optional        | 200, the product        |
| `PATCH /products/:productId/archive` | `product:archive` | `If-Match`, optional        | 200, the product        |

A replay of a creation answers 201 with the stored body, exactly like the first request.

**Every route names its permission.** `@RequiresPermission` refuses a caller without the code with
403 before the use case runs (see `02-global-auth-guards.md`). Archiving has a code of its own,
because it is the one change that cannot be undone: the seeded admin and editor hold all three codes, the
viewer only `product:read`.

**`productId` is a string of digits**, from 1 to 20 of them without a leading zero, checked by
`ProductIdRequestDto`. Anything else is a 400 at the edge instead of a lookup that cannot match.

### Headers

The two header decorators live in `common/shared`, because only features use them:

| Alias                                   | Decorator        | Refusal                                                     |
| --------------------------------------- | ---------------- | ----------------------------------------------------------- |
| `@acme-staff-common/shared/concurrency` | `IfMatch`        | `IF_MATCH_INVALID` (400)                                    |
| `@acme-staff-common/shared/idempotency` | `IdempotencyKey` | `IDEMPOTENCY_KEY_REQUIRED`, `IDEMPOTENCY_KEY_INVALID` (400) |

- **`If-Match` is a version, not an entity tag.** `3` and `"3"` both mean version 3; a missing or
  empty header means "no expectation". Anything that is not a non-negative integer, including a weak
  tag `W/"3"`, is refused rather than ignored, so a typo cannot turn into an unconditional write.
- **`Idempotency-Key` is trimmed and at most 128 characters**, the width of the
  `idempotency_key` column. The common module refuses a longer key with a plain `Error`, which
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

`ProductModule` imports `ProductTypeOrmModule.forFeature()`, `IdempotencyCommonModule`,
`LedgerRecordQueueModule` and `LedgerCoreModule`, binds every port with `{ provide, useClass }` and reads
`PRODUCT_OCC_RETRY_ATTEMPTS` from `OCC_RETRY_ATTEMPTS`. The app's entity list includes `Product`,
`IdempotencyKey` and `LedgerEntry`, because the modules the feature mounts need them on the app's
connection. The queue adapter relies on the Bull connection of `QueueSetupModule`.
