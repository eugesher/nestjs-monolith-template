# 05 — Core ledger

`core/modules/src/ledger` is an append-only journal of business facts: what happened to which
subject, and under which correlation id. Its contract `core/contracts/src/ledger` has two ports:

| Port                      | Facade                   | Consumer                               |
| ------------------------- | ------------------------ | -------------------------------------- |
| `LEDGER_CORE_APPEND_PORT` | `LedgerCoreAppendFacade` | whoever records a fact                 |
| `LEDGER_CORE_QUERY_PORT`  | `LedgerCoreQueryFacade`  | the back office that reads the journal |

Two ports instead of one let each app bind only what it uses. The ledger is the core module both
apps share:

| App          | Writer                                | Facts                               |
| ------------ | ------------------------------------- | ----------------------------------- |
| customer-app | the `auth` feature                    | `CustomerRegistered`                |
| staff-app    | the `product` feature                 | `ProductArchived`                   |
| staff-app    | the `ledger-catalog-events` processor | `ProductCreated`, `ProductArchived` |

customer-app binds the append port alone. staff-app binds both and serves the journal through its
`ledger` feature (see `06-ledger-feature.md`).

## Append is the only verb

**An entry never changes.** `LedgerCoreEntryModel` is a frozen value object, not an aggregate. It
has no behavior beyond its invariants, and a broken invariant throws a plain `Error`. Such an error
is a programming mistake in the caller, not a business refusal that a client should see by code.

**The operation key makes append idempotent.** Every fact carries an `operationKey`, such as
`product-archived:12`, and the column has a UNIQUE index. A second append with the same key hits a
duplicate key. `LedgerCoreAppendEntryRepository` catches exactly that error, reads the id of the
existing row and answers `{ id, appended: false }`. A caller that delivers the same fact twice gets
one row and no exception. Any other database error passes through.

The rejected insert still consumes an auto-increment value, so ids may have gaps. Nothing reads
meaning into them.

## Time and correlation

**An instant must carry its zone.** `LedgerCoreHelper.parseInstant` refuses `2026-01-01T00:00:00`,
because `Date` would read it in the server's zone. With `Z` or an offset, every server stores the
same instant. `occurredAt` is when the fact happened; `recordedAt` is set by the database and
shows how long delivery took.

**The correlation id comes from the context.** The append command has no `correlationId` field.
`LedgerCoreAppendEntryUseCase` takes it from `CorrelationContextHelper.current()`, so a fact
recorded while serving a request carries that request's id, including facts recorded by in-process
event consumers.

## Reading

`LedgerCoreListEntriesUseCase` clamps the page window (default 20, maximum 100) and filters by any
of `subjectType`, `subjectId` and `correlationId`. The newest entries come first. Ids are strings,
because the column is `bigint unsigned` and may exceed the safe integer range of a JavaScript
number.
