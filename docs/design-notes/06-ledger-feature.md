# 06 — Ledger feature

`apps/staff-app/src/features/ledger` serves `GET /ledger`, the back office view of the journal in
`ledger_entry` (see `05-ledger.md`). Only this feature reads the journal, so it
reads `ledger_entry` itself (see `26-code-placement.md`): `LedgerListEntriesUseCase`,
`LEDGER_LIST_ENTRIES_REPOSITORY_PORT`, `LedgerListEntriesRepository` and `LedgerEntryMapper`, which
turns a row into a view with ISO instants.

## Read-only, and only staff-app

The feature only reads. Recording facts is the job of whoever caused
them, never of an HTTP client, so no endpoint can write to the journal. customer-app records the
sign-up of a customer through the append port but does not mount this feature at all.

Access needs `ledger:read`. A principal without it gets a 403, and one without a token gets a 401.

## Paging and filters

| Query parameter            | Meaning                                                |
| -------------------------- | ------------------------------------------------------ |
| `page`, `size`             | page window; `size` above 100 is capped, not rejected  |
| `subjectType`, `subjectId` | the history of one subject, such as `product` and `12` |
| `correlationId`            | everything one request caused                          |

**The use case owns the window.** The DTO checks that `page` and `size` are positive integers and
leaves the limits to `LedgerListEntriesUseCase`, which applies the defaults (page 1, size 20) and
the cap with `PaginationHelper.clampPageWindow`. The response echoes the window it used, so a client that asked for 500 sees `size: 100`.

**No feature filter.** The query refuses nothing by code, so the feature has no domain exception or
exception filter.

## Shape

Entries come newest first. `id` is a string, because the column is `bigint unsigned`. `occurredAt`
is when the fact happened and `recordedAt` is when the journal stored it, both as ISO instants in
UTC.

`LedgerTypeOrmModule` registers `LedgerEntry` for the feature, and the app's TypeORM entity list
includes it, because a module that is mounted needs its entity registered on the app's connection.
