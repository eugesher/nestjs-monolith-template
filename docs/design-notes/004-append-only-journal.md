# 004 — Append-only journal

The `ledger_entry` table is an append-only journal. Every app writes to it through one queue, and
one processor appends.

| Part           | Example                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| queue contract | `core/contracts/src/ledger/queues/ledger-record.queue.ts`                                            |
| a producer     | `apps/staff-app/src/features/catalog/modules/product/application/services/product-ledger.service.ts` |
| the appender   | `apps/processor-app/src/processors/ledger-record` (see `008-queue-consumer.md`)                      |
| a reader       | `apps/staff-app/src/features/ledger` (see `005-page-window.md`)                                      |

**Producers enqueue, one processor appends.** No HTTP app writes the table, so the append has one
caller and lives in the processor (see `024-code-placement.md`). The queue contract lives in
`@acme-core/contracts/ledger`, because every app writes to the queue and an app may not import
another.

## Append is the only verb

**An entry is a frozen value object.** `LedgerRecordEntryModel`
(`apps/processor-app/src/processors/ledger-record/domain/models/ledger-record-entry.model.ts`)
calls `Object.freeze`, has no behavior beyond its invariants, and a broken invariant throws a plain
`Error`: it is a programming mistake of a producer, not a refusal a client sees.

**The operation key makes the append idempotent.** Every record carries an `operationKey` with a
UNIQUE index. `LedgerRecordAppendRepository` catches exactly the duplicate-key error, reads the id
of the existing row and answers `{ id, appended: false }`, so a job delivered twice gets one row and
no exception. Any other database error passes through, and Bull retries the job.

**A key names one occurrence.** A producer that can record the same kind of record twice for one
subject puts what tells the occurrences apart into the key, such as a version or a row id (see
`ProductLedgerService`).

The rejected insert still consumes an auto-increment value, so ids may have gaps.

## Time and correlation

**An instant must carry its zone.** `LedgerRecordHelper.parseInstant` refuses
`2026-01-01T00:00:00`, because `Date` would read it in the server's zone. With `Z` or an offset,
every server stores the same instant.

**The correlation id comes from the context.** The job carries the id of the request that produced
it, the consumer opens the context with that id, and `LedgerRecordAppendUseCase` reads it with
`CorrelationContextHelper.current()`.
