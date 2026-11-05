# 008 — Queue consumer

`apps/processor-app/src/processors/ledger` consumes the `ledger-record` queue and appends
each job to `ledger_entry` (see `004-append-only-journal.md`). It is a processor, not a feature: a job of the
Bull queue `ledger-record` enters it, not an HTTP request, and it has no
controller.

| Layer                        | What it holds                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `presentation`               | `LedgerAppendConsumer`: `@Process` for a job, `@OnQueueFailed` for a failed one |
| `application`                | `LedgerAppendUseCase`, `LedgerAppendReportFailureUseCase`                       |
| `domain`                     | `LedgerAppendEntryModel`, `LedgerAppendHelper`                                  |
| `outbound`                   | `LEDGER_APPEND_REPOSITORY_PORT`                                                 |
| `infrastructure/persistence` | `LedgerAppendRepository` over `ledger_entry`                                    |

## A job is a ready record

The job type `ILedgerRecordProcessorPayload` carries the whole record, and the processor appends it
as it is, so a new producer needs no change here. The producers do not consume the queue:
processor-app does (see `023-processor-app.md`), and the apps reach the queue through one Redis.

The queue name, the job type and the job options live in `@acme-core/contracts/ledger`, because an
app may not import another. Each app registers the queue in its `common/shared/ledger-record`, and
the core product module registers it once more for the archives it records, every time with
`LEDGER_RECORD_JOB_OPTIONS`. Bull applies the job options of the producer, so every producer
enqueues with the same `attempts` and `backoff` only because every registration reads the one
constant.

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

`LedgerAppendUseCase` parses the instant, builds the entry under the correlation id of the
job and appends it through `LEDGER_APPEND_REPOSITORY_PORT`. It lets a failed append throw,
so Bull retries the job. Every failed attempt
reaches `@OnQueueFailed`, and `LedgerAppendReportFailureUseCase` logs it: at `warn` while attempts are
left, at `error` after the last one. A job that ran out of attempts stays in the failed set of the
queue until someone returns it to the queue or deletes it through `/queues` (see
`023-processor-app.md`).

A retry of a job that did append is harmless: the ledger answers `appended: false` for a known key.

## Logs

Every job logs `Ledger record received` with its operation key and action at `info`, then
`Ledger record appended` or `Ledger record already appended`. Presentation logs nothing: the
outcomes belong to the application.
