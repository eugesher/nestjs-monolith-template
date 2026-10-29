# 06 — Ledger feature

`apps/staff-app/src/features/ledger` serves `GET /ledger`, the back office view of the journal that
`core/modules/src/ledger` keeps (see `05-core-ledger.md`). It has the same layers as `auth` (see
`03-auth-feature.md`): `LedgerListEntriesUseCase`, `LEDGER_QUERY_PORT`, and
`LedgerQueryCoreAdapter` over `LEDGER_CORE_QUERY_PORT`.

## Read-only, and only staff-app

The feature binds the query port and nothing else. Recording facts is the job of whoever caused
them, never of an HTTP client, so no endpoint can write to the journal. customer-app does not mount
the feature at all.

Access needs `ledger:read`. A principal without it gets a 403, and one without a token gets a 401.

## Paging and filters

| Query parameter            | Meaning                                               |
| -------------------------- | ----------------------------------------------------- |
| `page`, `size`             | page window; `size` above 100 is capped, not rejected |
| `subjectType`, `subjectId` | the history of one subject, such as `item` and `12`   |
| `correlationId`            | everything one request caused                         |

**The core owns the window.** The DTO checks that `page` and `size` are positive integers and leaves
the limits to `LedgerCoreListEntriesUseCase`, which applies the defaults (page 1, size 20) and the
cap. The response echoes the window it used, so a client that asked for 500 sees `size: 100`.

**No feature filter.** The core query refuses nothing by code, so the core adapter passes errors
through, and the feature has no domain exception or exception filter.

## Shape

Entries come newest first. `id` is a string, because the column is `bigint unsigned`. `occurredAt`
is when the fact happened and `recordedAt` is when the journal stored it, both as ISO instants in
UTC.

The app's TypeORM entity list includes `LedgerEntry`, because a module that is mounted needs its
entity registered on the app's connection.
