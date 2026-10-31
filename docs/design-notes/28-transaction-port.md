# 28 — Transaction port

The application layer opens a transaction through `TRANSACTION_PORT` of
`@acme-libs/contracts/database`, never through TypeORM or `@nestjs-cls/transactional`:

```ts
interface ITransactionPort {
  run<T>(work: () => Promise<T>): Promise<T>;
  afterCommit(hook: () => Promise<void>): void;
}
```

`TransactionAdapter` of `libs/database` implements it, and `TypeOrmSetupModule` of each app binds
it next to `ClsPluginTransactional` (see `13-app-bootstrap.md`).

## `run`

`run` wraps `TransactionHost.withTransaction`. A repository reads its connection from
`TransactionHost`, so every query inside `work` joins the transaction without being handed
anything. A `run` inside a `run` joins the open transaction: there is one commit, at the end of the
outermost `run`.

## `afterCommit`

`afterCommit(hook)` queues a hook that runs once the transaction has committed:

```ts
await transaction.run(async () => {
  await repository.insert(order);

  transaction.afterCommit(() => catalogCache.invalidate());
});
```

**Hooks run after the outermost commit.** The outermost `run` keeps the list of hooks in the CLS
context of the transaction, and a nested `run` adds to the same list. The hooks run in the order they
were added, after `withTransaction` has returned, so a hook of a nested `run` never sees data that a
later statement of the outer transaction could still roll back.

**A rollback drops the hooks.** When `work` throws, `run` rethrows and no hook runs.

**A failed hook does not fail the write.** The transaction has already committed, so `run` cannot
undo it. The adapter logs the error at `error` as `After-commit hook failed`, runs the remaining
hooks and answers the result of `work`. A hook is for an effect that may be lost, such as dropping
a cache whose entries expire anyway; a fact that must not be lost goes into the transaction itself
or onto a queue with retries.

**A hook needs a transaction.** `afterCommit` outside `run`, or inside a transaction that
`TRANSACTION_PORT` did not open, throws: a hook that ran at once instead would change the order of
effects without a trace.

**A crash between the commit and a hook loses the hook.** The list lives in memory. The template
uses no outbox, so effects that must survive a crash are retried by their own mechanism, as the
ledger records are (see `08-product-feature.md`).

## When to use it

A use case that opens the transaction itself already knows when it has committed: the line after
`await transaction.run(...)` runs after the commit, and the feature use cases call `invalidate()`
and their ledger services there. `afterCommit` is for an effect declared deeper, in a module that
runs inside a transaction someone else opened and cannot tell when it commits. The core modules are
those:

| Module               | Write                | After the commit                                                 |
| -------------------- | -------------------- | ---------------------------------------------------------------- |
| core `product-stock` | `move` with SUBTRACT | the job of the `product-stock-post-subtract` queue               |
| core `product`       | `archive`            | the cached catalog dropped, the `product-archived` record queued |
