# 008 — Queue processor

`apps/processor-app/src/processors/ledger` processes the `ledger-record` queue and appends each job
to `ledger_entry` (see `004-append-only-journal.md`). It is a processor, not a feature: a job of the
Bull queue `ledger-record` enters it, not an HTTP request, and it has no controller.

| Layer                        | What it holds                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `presentation/processors`    | `LedgerAppendProcessor`: `@Process` for a job, `@OnQueueFailed` for a failed one |
| `application`                | `LedgerAppendUseCase`, `LedgerAppendReportFailureUseCase`                        |
| `domain`                     | `LedgerAppendEntryModel`, `LedgerAppendHelper`                                   |
| `outbound`                   | `LEDGER_APPEND_REPOSITORY_PORT`                                                  |
| `infrastructure/persistence` | `LedgerAppendRepository` over `ledger_entry`                                     |

## A job is a ready record

The job type `ILedgerRecordProcessorPayload` carries the whole record, and the processor appends it
as it is, so a new producer needs no change here. The producers do not process the queue:
processor-app does (see `023-processor-app.md`), and the apps reach the queue through one Redis.

The queue name and the job type live in `@acme-core/contracts/ledger`, because an app may not import
another. `LedgerCoreModule` registers the queue for the producers and processor-app registers it in
its `common/shared/ledger`, both with `BullSetupModule.registerQueue(LEDGER_RECORD_QUEUE)`. Bull
applies the job options of the producer, so every producer enqueues with the same `attempts` and
`backoff` because `registerQueue` takes the name alone and every queue gets the fixed job options of
`BullSetupModule.forRoot()`.

## Job options

| Option             | Value            | Why                                                 |
| ------------------ | ---------------- | --------------------------------------------------- |
| `attempts`         | 3                | a failed append is retried by Bull, not by the code |
| `backoff`          | exponential, 1 s | the retries wait 1 s and 3 s                        |
| `removeOnComplete` | true             | a recorded job leaves Redis                         |

**Every queue of every app shares these options.** They are a constant of `BullSetupModule` in
`libs/queue`, not variables of the environment: an app that read them from its own `.env` could
enqueue the jobs of a shared queue with other retries than the next producer. `registerQueue` takes
no options: `@nestjs/bull` merges the root options and the queue options shallowly, so a queue with
`defaultJobOptions` of its own would replace these as a whole and could drift from the other
producers of the same queue.

## Correlation

A job runs outside any request, so the producer puts the correlation id into the job, and the
processor opens the context with `CorrelationContextHelper.run(correlationId, ...)`. The append and
the ledger row then carry the id of the request that produced the record. The failure handler opens
the same context, so its log lines carry the id too.

## Failures

`LedgerAppendUseCase` parses the instant, builds the entry under the correlation id of the job and
appends it through `LEDGER_APPEND_REPOSITORY_PORT`. It lets a failed append throw, so Bull retries
the job. Every failed attempt reaches `@OnQueueFailed`, and `LedgerAppendReportFailureUseCase` logs
it: at `warn` while attempts are left, at `error` after the last one. A job that ran out of attempts
stays in the failed set of the queue until someone returns it to the queue or deletes it through
`/queues` (see `023-processor-app.md`).

**The job is trusted.** The producers are the apps of the template, and they build the job from the
type of the contract, so the processor does not validate it. A job of another shape, such as one an
older release left in Redis, throws inside the use case, uses up its attempts and stays in the
failed set with the `error` line of the failure handler. A change to the shape of a job keeps the
processor reading the old shape until the queue holds none. The same holds for the
`product-stock-post-subtract` queue (see `023-processor-app.md`).

A retry of a job that did append is harmless: the ledger answers `appended: false` for a known key.
A producer adds the job under its operation key, so a retried enqueue leaves one job while the first
one is in the queue (see `022-enqueue-after-commit.md`), and the ledger catches the rest.

## Logs

Every job logs `Ledger record received` with its operation key and action at `info`, then
`Ledger record appended` or `Ledger record already appended`. Presentation logs nothing: the
outcomes belong to the application.
