# 09 — Ledger record processor

`apps/staff-app/src/processors/ledger-record` appends records to the ledger of
`core/modules/src/ledger` (see `05-core-ledger.md`). It is a processor, not a feature: a job of the
Bull queue `ledger-record` enters it, not an HTTP request, and it has no controller.

| Layer                          | What it holds                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `presentation`                 | `LedgerRecordConsumer`: `@Process` for a job, `@OnQueueFailed` for a failed one |
| `application`                  | `LedgerRecordAppendUseCase` and `LedgerRecordReportFailureUseCase`              |
| `outbound`                     | `LEDGER_RECORD_LEDGER_PORT`                                                     |
| `infrastructure/core-adapters` | `LedgerRecordLedgerCoreAdapter` over `LEDGER_CORE_APPEND_PORT`                  |

## A job is a ready record

**The processor knows no subject.** A job carries the whole record, and the processor appends it as
it is:

| Field           | Meaning                                                   |
| --------------- | --------------------------------------------------------- |
| `operationKey`  | the key the ledger deduplicates on, `<fact>:<subject id>` |
| `subjectType`   | what the record is about, `product` today                 |
| `subjectId`     | the id of that subject                                    |
| `action`        | the fact, such as `ProductCreated`                        |
| `payload`       | the details of the fact                                   |
| `occurredAt`    | when the fact happened, an ISO string                     |
| `correlationId` | the id of the request that produced the record            |

The producer turns its domain events into records, so a new writer needs no change here. The
product feature is the only producer today (see `08-product-feature.md`).

The queue name and the job type live in `@acme-staff-contracts/ledger-record`. The queue is
registered once, in `@acme-staff-common/shared/ledger-record`, and both the producer and this
processor import that module, so every producer enqueues with the same job options.

## Job options

| Option             | Value            | Why                                                 |
| ------------------ | ---------------- | --------------------------------------------------- |
| `attempts`         | 3                | a failed append is retried by Bull, not by the code |
| `backoff`          | exponential, 1 s | the retries wait 1 s and 2 s                        |
| `removeOnComplete` | true             | a recorded job leaves Redis                         |

**The queue repeats `removeOnComplete`.** `QueueSetupModule` sets `removeOnComplete: true` for every
queue, but `@nestjs/bull` merges the root options and the queue options shallowly: the
`defaultJobOptions` of a queue replace those of the root as a whole, so a queue with options of its
own states it again.

## Correlation

A job runs outside any request, so the producer puts the correlation id into the job, and the
consumer opens the context with `CorrelationContextHelper.run(correlationId, ...)`. The append and
the ledger row then carry the id of the request that produced the record. The failure handler opens
the same context, so its log lines carry the id too.

## Failures

`LedgerRecordAppendUseCase` lets a failed append throw, so Bull retries the job. Every failed attempt
reaches `@OnQueueFailed`, and `LedgerRecordReportFailureUseCase` logs it: at `warn` while attempts are
left, at `error` after the last one. A job that ran out of attempts stays in the failed set of the
queue, and replaying it means retrying that job.

A retry of a job that did append is harmless: the ledger answers `appended: false` for a known key.

## Logs

Every job logs `Ledger record received` with its operation key and action at `info`, then
`Ledger record appended` or `Ledger record already appended`. Presentation logs nothing: the
outcomes belong to the application.
