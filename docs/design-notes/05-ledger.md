# 05 — Ledger

The ledger is an append-only journal of business facts in the `ledger_entry` table: what happened
to which subject, and under which correlation id. No module owns it as a whole. Each part sits with
its only caller (see `26-code-placement.md`):

| Part                | Lives in                                                             |
| ------------------- | -------------------------------------------------------------------- |
| writing a record    | the queue `ledger-record`, contract in `@acme-core/contracts/ledger` |
| appending a record  | the processor `ledger-record` (see `09-ledger-record-processor.md`)  |
| reading the journal | the staff `ledger` feature (see `06-ledger-feature.md`)              |

**Every writer enqueues, one processor appends.** A writer turns its fact into a ready record and
puts it on the `ledger-record` queue after its commit:

| Writer                    | Facts                                                        |
| ------------------------- | ------------------------------------------------------------ |
| staff `product`           | `ProductCreated`, `ProductPublished`, `ProductRestocked`     |
| the core module `product` | `ProductArchived`, from staff-app and from the processor app |
| customer `auth`           | `CustomerRegistered`                                         |
| customer `order`          | `OrderPlaced`                                                |

No app writes `ledger_entry` directly, so the append has one caller, the processor of
processor-app, and lives there.

**The queue contract lives in core.** `LEDGER_RECORD_QUEUE`, the job type
`ILedgerRecordProcessorPayload` and `LEDGER_RECORD_JOB_OPTIONS` are in `@acme-core/contracts/ledger`,
because every app writes to the queue and an app may not import another. A job is a ledger entry
with a correlation id. The contract holds nothing else: the append is not a port any more.

## Append is the only verb

**An entry never changes.** `LedgerRecordEntryModel` is a frozen value object, not an aggregate. It
has no behavior beyond its invariants, and a broken invariant throws a plain `Error`. Such an error
is a programming mistake in the writer, not a business refusal that a client should see by code.

**The operation key makes append idempotent.** Every fact carries an `operationKey`, such as
`product-archived:12:2`, and the column has a UNIQUE index. A second append with the same key hits a
duplicate key. `LedgerRecordAppendRepository` catches exactly that error, reads the id of the
existing row and answers `{ id, appended: false }`. A job delivered twice gets one row and no
exception. Any other database error passes through, and Bull retries the job.

**A fact that can happen twice to one subject carries what tells them apart.** A product is
published and archived again after a republication, so those keys carry the version they produced;
a restock carries the id of its stock row.

The rejected insert still consumes an auto-increment value, so ids may have gaps. Nothing reads
meaning into them.

## Time and correlation

**An instant must carry its zone.** `LedgerRecordHelper.parseInstant` refuses `2026-01-01T00:00:00`,
because `Date` would read it in the server's zone. With `Z` or an offset, every server stores the
same instant. `occurredAt` is when the fact happened; `recordedAt` is set by the database and
shows how long delivery took.

**The correlation id comes from the context.** The record of a job carries the id of the request
that produced it, and the consumer opens the context with that id. `LedgerRecordAppendUseCase` reads
it from `CorrelationContextHelper.current()`, so the row carries the id of the original request.
