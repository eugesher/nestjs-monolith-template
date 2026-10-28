# 08 — Item feature

`apps/client-api/src/features/item` is the per-owner catalog behind `/items`. This note covers the
`ItemModel` aggregate, optimistic concurrency, idempotent creation, the ledger record of an archive,
the adapters behind the ports and the HTTP surface.

## The aggregate

`ItemModel` walks `draft → active → archived`. Every change that reaches the database bumps
`version`, and an archived item refuses every further change with `ITEM_ALREADY_ARCHIVED`.

| Rule | Code |
| --- | --- |
| `sku` matches `^[A-Z0-9][A-Z0-9-]{2,63}$` | `ITEM_SKU_INVALID` |
| `name` is 1 to 255 characters after trimming | `ITEM_NAME_INVALID` |
| `version` is a positive integer | `ITEM_VERSION_INVALID` |

**The id is a string.** The column is `bigint unsigned`, which may exceed the safe integer range of
a JavaScript number, so the id stays a string from the row to the response.

**A rename to the current name changes nothing.** It records no event and keeps the version, so
the write service does not touch the database either. A client that repeats a rename does not
invalidate the `If-Match` version of everyone else.

**Events are recorded, not published.** `create`, `rename` and `archive` add `ItemCreatedEvent`,
`ItemRenamedEvent` and `ItemArchivedEvent`. A use case pulls them after the write and hands them to
`ITEM_EVENTS_PORT` together with the stored id, because a created item has no id until the insert.

## Ownership

`ItemAccessService` loads an item or refuses it: a missing item is `ITEM_NOT_FOUND` (404), and an
item of another owner is `ITEM_ACCESS_FORBIDDEN` (403), never an empty answer. Reads take an
optional `ownerId`: `undefined` means a caller that is not owner-scoped and skips the comparison.
Writes take a required one, so no write can skip it.

## Optimistic concurrency

`ItemWriteService.write(command, mutate)` is the only way to change a stored item. Every attempt:

1. loads the item fresh through `ItemAccessService`;
2. checks the `If-Match` version with `ItemHelper.assertExpectedVersion`;
3. applies `mutate` in memory;
4. saves with `UPDATE … WHERE version = <as read>`.

**The repository answers a lost race with `false`, not an error.** The service reads the current
version and throws `ItemWriteConflictError`, which only `OccRetryHelper` sees. Because the class
is local to the feature, the retry loop cannot swallow another module's conflict.

**The budget is `ITEM_OCC_RETRY_ATTEMPTS`** (`OCC_RETRY_ATTEMPTS`, 5 by default). A pinned
`If-Match` collapses it to one attempt: retrying against a newer version would apply a change the
client never saw. A spent budget is `VERSION_MISMATCH` (409) with `details.currentVersion`. A
domain refusal is never retried.

After a successful save the service reads the row again, so the answer carries the new
`updatedAt`.

## Idempotent creation

`ItemCreateUseCase` claims the `Idempotency-Key` on the logical body `{ sku, name, ownerId }`
before any work:

| Claim | Answer |
| --- | --- |
| `claimed` | create the item |
| `replay` | the stored response, nothing else happens |
| `in-flight` | `ITEM_IDEMPOTENT_REQUEST_IN_FLIGHT` (409) |
| `mismatch` | `ITEM_IDEMPOTENCY_KEY_REUSED` (422) |

**The insert and the completion of the key share one transaction.** If completing the key fails,
the item is rolled back with it. Otherwise a stored item with a released key would answer the
client's retry with `ITEM_SKU_TAKEN` instead of a replay.

Any failure after the claim releases the key, so an honest retry can take it again. A failure
after the commit, such as publishing the event, leaves a completed key that `release` does not
delete, so the retry is a replay.

## The ledger record of an archive

`ItemArchiveUseCase` writes the item, publishes the events and then asks `ItemLedgerService` to
record the archive under the operation key `item-archived:<id>`. The event path records the same
fact under the same key, and the ledger keeps one row.

The archive is already committed, so a failing append must not undo it. `ItemLedgerService` tries
three times through `ReplayRetryHelper` and then logs the record at `error` for a replay instead of
throwing.

## Logs

A write logs its outcome at `info` after the work: `Item created`, `Item renamed`,
`Item archived`, or a replay of a creation. A lost race logs at `info` and a spent budget at `warn`.
Reads log nothing. The correlation id comes from the context.

## Persistence

Each port has its own repository: `ItemAccessRepository`, `ItemCreateRepository`,
`ItemCrudRepository` and `ItemWriteRepository`. The access and write repositories share `findById`
through `ItemFindByIdBaseRepository`. Every repository reads the `item` table through
`TransactionHost`, so a query inside `TRANSACTION_PORT.run` joins that transaction.

**The version check is in the `WHERE`.** `update` runs
`UPDATE item SET name, status, version = <new> WHERE id = ? AND version = <as read>` and answers
whether exactly one row changed. The repository does not read the row again and throws nothing.

**`insert` reads the row back by its sku**, so the answer carries the id and the times the database
set. A duplicate sku that slips past `existsBySku` in a race becomes `ITEM_SKU_TAKEN`, the same code
the use case answers when it sees the sku first.

`list` filters by owner only when `ownerId` is set and returns the newest items first.

## Adapters

| Port | Adapter | Target |
| --- | --- | --- |
| `ITEM_LEDGER_PORT` | `ItemLedgerCoreAdapter` | `LEDGER_CORE_APPEND_PORT` |
| `ITEM_IDEMPOTENCY_PORT` | `ItemIdempotencyCommonAdapter` | `IDEMPOTENCY_COMMON_PORT` |
| `ITEM_EVENTS_PORT` | `ItemEventsAdapter` | `EVENT_PUBLISHER_PORT` |

The idempotency adapter turns the claim outcome enum of the common module into the plain outcomes of
the port and hands a replay's stored response back as the type the use case expects.

**The events adapter speaks the contract of its consumer.** Event names and payloads live in
`@acme-client-contracts/ledger-catalog-events`, next to the processor that reads them:

| Domain event | Event name | Payload |
| --- | --- | --- |
| `ItemCreatedEvent` | `catalog.item.created` | `itemId`, `sku`, `name`, `ownerId`, `occurredAt` |
| `ItemRenamedEvent` | `catalog.item.renamed` | `itemId`, `name`, `previousName`, `occurredAt` |
| `ItemArchivedEvent` | `catalog.item.archived` | `itemId`, `previousStatus`, `occurredAt` |

`itemId` comes from the publish command, because a created item has no id in its event. The payload
has no correlation id: an in-process listener runs in the context of the publishing request and
reads the id from there. An event without a catalog name is a programming mistake and throws.

The adapter lives in `infrastructure/events`, a layer of its own. It is the only place in the
feature that reaches both the contracts of the app and the messaging contract, so persistence
cannot import the idempotency contract around its common-adapter.

## HTTP

| Method and path | Permission | Headers | Answer |
| --- | --- | --- | --- |
| `POST /items` | `item:write` | `Idempotency-Key`, required | 201, the item |
| `GET /items` | `item:read` | | 200, a page of items |
| `GET /items/:itemId` | `item:read` | | 200, the item |
| `PATCH /items/:itemId/name` | `item:write` | `If-Match`, optional | 200, the item |
| `PATCH /items/:itemId/archive` | `item:archive` | `If-Match`, optional | 200, the item |

A replay of a creation answers 201 with the stored body, exactly like the first request.

**Reads are owner-scoped unless the caller is an admin.** The controller passes no `ownerId` for an
admin, so `ItemAccessService` skips the ownership check. Writes always pass the caller's own id, so
even an admin changes only their own items.

**`itemId` is a string of digits**, from 1 to 20 of them without a leading zero, checked by
`ItemIdRequestDto`. Anything else is a 400 at the edge instead of a lookup that cannot match.

### Headers

The two header decorators live in `common/shared`, because only features use them:

| Alias | Decorator | Refusal |
| --- | --- | --- |
| `@acme-client-common/shared/concurrency` | `IfMatch` | `IF_MATCH_INVALID` (400) |
| `@acme-client-common/shared/idempotency` | `IdempotencyKey` | `IDEMPOTENCY_KEY_REQUIRED`, `IDEMPOTENCY_KEY_INVALID` (400) |

- **`If-Match` is a version, not an entity tag.** `3` and `"3"` both mean version 3; a missing or
  empty header means "no expectation". Anything that is not a non-negative integer, including a weak
  tag `W/"3"`, is refused rather than ignored, so a typo cannot turn into an unconditional write.
- **`Idempotency-Key` is trimmed and at most 128 characters**, the width of the
  `idempotency_key` column. The common module refuses a longer key with a plain `Error`, which
  would be a 500, so the decorator answers 400 first.

### Errors

`ItemHttpExceptionFilter` maps the domain codes to statuses and hands the response to the
`HttpExceptionFilter` of `libs/http`. The body is `{ statusCode, message, code }`, plus `details`
when the exception has them, such as `details.currentVersion` of `VERSION_MISMATCH`.

| Code | Status |
| --- | --- |
| `ITEM_SKU_INVALID`, `ITEM_NAME_INVALID`, `ITEM_VERSION_INVALID` | 400 |
| `ITEM_ACCESS_FORBIDDEN` | 403 |
| `ITEM_NOT_FOUND` | 404 |
| `ITEM_ALREADY_ARCHIVED`, `ITEM_SKU_TAKEN`, `ITEM_IDEMPOTENT_REQUEST_IN_FLIGHT`, `VERSION_MISMATCH` | 409 |
| `ITEM_IDEMPOTENCY_KEY_REUSED` | 422 |

There is no global filter for TypeORM's `OptimisticLockVersionMismatchError`. TypeORM throws it only
for a read with an optimistic lock, and nothing reads that way: the version check is the `WHERE` of
the update, and its conflict arrives as `VERSION_MISMATCH` above.

## Wiring

`ItemModule` imports `ItemTypeOrmModule.forFeature()`, `IdempotencyCommonModule` and
`LedgerCoreModule`, binds every port with `{ provide, useClass }` and reads
`ITEM_OCC_RETRY_ATTEMPTS` from `OCC_RETRY_ATTEMPTS`. The app's entity list includes `Item`,
`IdempotencyKey` and `LedgerEntry`, because the modules the feature mounts need them on the app's
connection. The events adapter relies on the global `EventsModule` of `libs/messaging`.
