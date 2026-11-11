# 022 — Enqueue after commit

A module announces a committed write on a queue, from a hook that runs after the commit, with a
deadline and retries.

| Part               | Example                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| hook in a use case | `core/modules/src/product-stock/application/use-cases/product-stock-core-move.use-case.ts`                         |
| queue adapter      | `core/modules/src/product-stock/infrastructure/queue/product-stock-core-post-subtract-queue.adapter.ts`            |
| queue contract     | `core/contracts/src/product-stock/queues/product-stock-post-subtract.queue.ts`                                     |
| queue registration | `core/modules/src/product-stock/shell/product-stock-core.module.ts`                                                |
| the processor      | `apps/processor-app/src/processors/product-stock/presentation/processors/product-stock-post-subtract.processor.ts` |
| from a feature     | `apps/staff-app/src/features/catalog/modules/product/infrastructure/lib-adapters/product-ledger-lib.adapter.ts`    |

## After the commit

**A module inside someone else's transaction uses `afterCommit`.** `ProductStockCoreMoveUseCase`
runs in the caller's transaction and registers a hook with `afterCommit` of
`PRODUCT_STOCK_CORE_TRANSACTION_PORT` (see `026-transaction-port.md`). A rollback drops the hook, so
no job names a write that did not happen, and a call outside `run` throws.

**A use case that owns the transaction enqueues on the next line.** The line after
`await transaction.run(...)` already runs after the commit, so the features call their ledger ports
there (`ProductStockAddUseCase`, `OrderPlaceUseCase`).

## Deadline and retries

**An enqueue has a deadline.** While Redis is down, Bull keeps the command in the offline queue of
its client and `add` never settles. The adapter races `add` against the `timeoutMs` of the command
and throws when it runs out; the caller reads it from `REDIS_COMMAND_TIMEOUT_MS`.

**The write stays committed.** The caller retries the enqueue through `ReplayRetryHelper`
(`libs/toolkit/src/resilience/replay-retry.helper.ts`), `QUEUE_RETRY_ATTEMPTS` or
`LEDGER_RETRY_ATTEMPTS` times, and then logs the job at `error` for a replay. A timed-out `add` may
still reach Redis once it is back, so a processor must tolerate a duplicate job.

**The ledger is a lib with a facade.** `LedgerLibModule` (`libs/ledger`) exposes `LEDGER_LIB_PORT`
with one method, `handleEnqueue`. `LedgerLibEnqueueUseCase` reads the retry attempts and the timeout
from the configuration, retries and logs under the subject and the operation key;
`LedgerLibQueueAdapter` holds the race and the fields of the job.

**A module records through its lib adapter.** A module declares `<MODULE>_LEDGER_PORT` with the
facts it records, such as `recordPlaced`, and implements it in
`infrastructure/lib-adapters/<module>-ledger-lib.adapter.ts`. The adapter builds the record, takes
the correlation id of the context and calls the facade. Nothing is inherited, and the application
has no ledger service. An event builds its record itself, but infrastructure may not import the
domain, so the use case picks the events that go to the ledger and passes them through the command
of the port.

## Where the queue is declared

**A queue written by several apps keeps its contract outside the apps**: the name and the payload
type, in core or in the lib that writes it. A core module or a lib that writes to a queue registers
it itself with `BullSetupModule.registerQueue` of `libs/queue`, so every module that mounts it
brings the queue with it. A processor registers the queues it reads in the `common/shared` of its
app (`apps/processor-app/src/common/shared/ledger`). Bull applies the job options of the producer,
so `registerQueue` takes the name alone and every registration gets the job options of
`BullSetupModule.forRoot()`.

The lint edges for a core queue adapter are in `lint/boundaries/policies/acme-core.mjs` and
`queue.mjs` (see `016-lint-allowlists.md`).

## The processor

`ProductStockPostSubtractProcessor` opens the correlation context of the job and runs one use case
in one transaction: it locks and sums through the core module, reads the rows it needs under the
same lock, and calls another core module (see `023-processor-app.md`). A replay of the job writes
nothing, because the rows it changed are no longer picked.
