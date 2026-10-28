# 08 — Item feature

`apps/client-api/src/features/item` is the per-owner catalog behind `/items`. This note covers its
`domain` and `application`: the `ItemModel` aggregate, optimistic concurrency, idempotent creation
and the ledger record of an archive.

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
