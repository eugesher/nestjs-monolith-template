# 027 — Core module outcomes

A core module that refuses answers an outcome, not an exception, and each caller turns it into its
own words.

| Part                    | Example                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| outcome enum            | `core/contracts/src/product/enums/product-core-archive-outcome.enum.ts`                                              |
| use case                | `core/modules/src/product/application/use-cases/product-core-archive.use-case.ts`                                    |
| caller in a feature     | `apps/staff-app/src/features/catalog/modules/product/infrastructure/core-adapters/product-status-core.adapter.ts`    |
| caller in a processor   | `apps/processor-app/src/processors/product-stock/infrastructure/core-adapters/product-stock-archive-core.adapter.ts` |
| the same in idempotency | `IdempotencyCoreClaimOutcomeEnum` in `core/contracts/src/idempotency`                                                |

**A core exception would leak into the callers.** A feature must not import a core domain
exception, and each caller maps a refusal differently: one into an HTTP status, another into a log
line. The enum lives in the contract, and a core-adapter maps it into the plain outcome of the
feature port with a `Record` over every value, so a new value fails the typecheck of every caller.

**The use case opens or joins a transaction.** `ProductCoreArchiveUseCase` runs in
`TRANSACTION_PORT.run`, so it joins the transaction of a caller that has one and opens its own
otherwise. It locks the row before it reads it (see `021-pessimistic-locking.md`), compares
`expectedVersion` for the `If-Match` of a caller, writes, and announces the write in `afterCommit`:
it drops a cache (see `020-cross-app-cache-invalidation.md`) and enqueues a ledger record (see
`022-enqueue-after-commit.md`).

**The module has its own model**, `ProductCoreModel`, narrowed to the columns it writes.

## Wiring

`core/modules/src/product/module/product-core.module.ts` binds the repository, the queue adapter and
the cache adapter, registers `Product` and the `ledger-record` queue, and reads
`REDIS_COMMAND_TIMEOUT_MS` and `LEDGER_RETRY_ATTEMPTS`. `CACHE_PORT` comes from the global
`CacheModule` of each app.
