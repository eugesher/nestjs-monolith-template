# 022 — Enqueue after commit

A module announces a committed write on a queue, from a hook that runs after the commit, with a
deadline and retries.

| Part               | Example                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| hook in a use case | `core/modules/src/product-stock/application/use-cases/product-stock-core-move.use-case.ts`              |
| queue adapter      | `core/modules/src/product-stock/infrastructure/queue/product-stock-core-post-subtract-queue.adapter.ts` |
| queue contract     | `core/contracts/src/product-stock/queues/product-stock-post-subtract.queue.ts`                          |
| queue registration | `core/modules/src/product-stock/module/product-stock-core.module.ts`                                    |
| the consumer       | `apps/processor-app/src/processors/product-stock/presentation/product-stock-post-subtract.consumer.ts`  |
| from a feature     | `apps/staff-app/src/features/catalog/modules/product/application/services/product-ledger.service.ts`    |

## After the commit

**A module inside someone else's transaction uses `afterCommit`.** `ProductStockCoreMoveUseCase`
runs in the caller's `TRANSACTION_PORT.run` and registers a hook with `TRANSACTION_PORT.afterCommit`
(see `026-transaction-port.md`). A rollback drops the hook, so no job names a write that did not
happen, and a call outside `run` throws.

**A use case that owns the transaction enqueues on the next line.** The line after
`await transaction.run(...)` already runs after the commit, so the features call their ledger
services there (`ProductRestockUseCase`, `OrderPlaceUseCase`).

## Deadline and retries

**An enqueue has a deadline.** While Redis is down, Bull keeps the command in the offline queue of
its client and `add` never settles. The adapter races `add` against `REDIS_COMMAND_TIMEOUT_MS` and
throws when it runs out.

**The write stays committed.** The caller retries the enqueue through `ReplayRetryHelper`
(`libs/toolkit/src/resilience/replay-retry.helper.ts`), `QUEUE_RETRY_ATTEMPTS` or
`LEDGER_RETRY_ATTEMPTS` times, and then logs the job at `error` for a replay. A timed-out `add` may
still reach Redis once it is back, so a consumer must tolerate a duplicate job.

## Where the queue is declared

**A queue written by several apps keeps its contract in core**: the name, the job options and the
payload type. A core module that writes to a queue registers it itself with
`BullModule.registerQueue`, so every feature that mounts the module brings the queue with it. A
feature registers its queues in the `common/shared` of its app
(`apps/staff-app/src/common/shared/ledger-record`). Bull applies the job options of the producer, so
every registration reads the one constant of the contract.

The lint edges for a core queue adapter are in `lint/boundaries/policies/acme-core.mjs` and
`queue.mjs` (see `016-lint-allowlists.md`).

## The consumer

`ProductStockPostSubtractConsumer` opens the correlation context of the job and runs one use case
in one transaction: it locks and sums through the core module, reads the rows it needs under the
same lock, and calls another core module (see `023-processor-app.md`). A replay of the job writes
nothing, because the rows it changed are no longer picked.
