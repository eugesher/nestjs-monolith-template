# 021 — Pessimistic locking

Writes that read a sum and then write against it lock the parent rows first, in one order.

| Part                  | Example                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| the lock order        | `core/modules/src/product-stock/infrastructure/persistence/repositories/base/product-stock-core-base.repository.ts` |
| a use case that locks | `apps/customer-app/src/features/order/application/use-cases/order-place.use-case.ts`                                |
| another one           | `apps/staff-app/src/features/catalog/modules/product/application/use-cases/product-restock.use-case.ts`             |
| a lock of one row     | `core/modules/src/product/infrastructure/persistence/repositories/product-core-archive.repository.ts`               |

## One transaction

`OrderPlaceUseCase` runs:

1. `lock` takes `SELECT … FOR UPDATE` on the parent rows in `id` order and sums the child rows with
   `FOR SHARE`;
2. the use case reads the parent rows through its own repository, now that nobody else can change
   them;
3. the model checks the request against the locked state;
4. the inserts;
5. the idempotency key is completed with the answer (see `006-idempotency-keys.md`).

**The parent row is the lock.** Every write that touches the sums of a row takes that row first, so
the writes queue behind each other and each sum counts every movement committed before it.

**One order prevents deadlocks.** The rows are locked in `id` order, so two transactions that share
several rows wait for each other instead of deadlocking. The order is written once, in the base
repository, and every repository of the module extends it.

**The sum is a locking read**, so it sees the latest committed rows whatever the transaction read
before. Locking an empty list answers `[]` without a query.

**The caller locks before it reads.** A read after the lock sees the row as the last committed
writer left it. A later lock of the same row in the same transaction costs a query and nothing
else, so a callee that locks again stays safe.

**A lock instead of an optimistic retry.** When the row is locked before it is read, no other write
can change it between the read and the update, so there is no lost race to retry. The core
`archive` works this way (see `027-core-module-outcomes.md`).
