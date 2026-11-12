# 006 — Idempotency keys

`core/modules/src/idempotency` keeps the `idempotency_key` table: which `Idempotency-Key` a client
has used, for which request body, and what the first request answered. It is a core module because
features of two apps claim keys while serving writes, for example
`apps/staff-app/src/features/catalog/modules/product/application/use-cases/product-create.use-case.ts`.
Its contract `core/contracts/src/idempotency` has one port:

| Port                    | Facade                  | Consumer                                  |
| ----------------------- | ----------------------- | ----------------------------------------- |
| `IDEMPOTENCY_CORE_PORT` | `IdempotencyCoreFacade` | a feature that serves an idempotent write |

Deleting the expired keys has one caller, the `idempotency` processor of processor-app, so it lives
in the processor with a repository of its own (see `009-scheduled-processor.md` and
`024-code-placement.md`).

A feature root mounts `IdempotencyCoreModule` from `@acme-core/modules/idempotency` and reaches a
port only from a core-adapter, like any core module. The `IdempotencyKey` decorator that reads the
header lives in `@acme-libs/http`, so both apps parse the key the same way.

## A key belongs to its owner

Every command of the port carries a `scope` next to the key, and the UNIQUE index covers
`(scope, idempotency_key)`. The same key under two scopes is two keys: one customer never meets the
key of another, and a staff user never meets the key of a customer.

| Caller                | Scope                    |
| --------------------- | ------------------------ |
| customer `order`      | `customer:<customer id>` |
| staff `product`       | `staff:<staff user id>`  |
| staff `product-stock` | `staff:<staff user id>`  |

**The core-adapter builds the scope.** A feature port takes the id of the owner, `customerId` or
`staffUserId`, and its core-adapter turns it into the scope, so the format lives in one class per
feature and the use case never spells it. The body a caller claims holds only the request: the owner
is already in the scope.

## Claim before the work

**The insert is the lock.** `claim` inserts an in-flight row against the UNIQUE index on the scope
and key before the caller does any work. Of two simultaneous requests with the same scope and key,
exactly one insert succeeds; the repository answers `DUPLICATE` to the other (see
`003-authentication.md`). A "have I seen this key?" read before the write would let both through.

**The module fingerprints the body.** The caller passes the logical body, never a hash.
`BodyFingerprintHelper` hashes it canonically: object keys are sorted at every depth and array order
is kept. The caller must leave out anything that changes on a retry, such as the correlation id.

| Outcome     | When                               | What the caller does                                         |
| ----------- | ---------------------------------- | ------------------------------------------------------------ |
| `claimed`   | the insert succeeded               | the work, then `complete`, or `release` if it throws         |
| `replay`    | same key, same body, completed     | answers `storedResponse` without doing the work again        |
| `in-flight` | same key, same body, not completed | asks the client to retry shortly (409)                       |
| `mismatch`  | same key, different body           | refuses (422): the stored answer belongs to another question |

The outcome enum lives in the contract, not in `libs/kernel`, because only the core-adapters read
it.

**A key that vanished is in flight.** If the insert hits a duplicate but the row is gone when the
module reads it, the holder has just released it. The answer is `in-flight`: the client retries and
claims it properly. Answering `claimed` would let the caller work without holding a row, so a
concurrent duplicate could work too.

## Complete and release

- **`complete` stores the response as JSON**, and `claim` parses it back for a replay. The caller
  hands over the object it is about to return and never sees the serialized form.
- **`release` deletes only an in-flight row.** A completed key survives a late release, so a replay
  stays possible.
- **The module never expires a key.** It reads no configuration, so staff-app and customer-app mount
  it without a TTL. Until the purge of processor-app runs, an expired key still replays, and a key
  that its dead holder never released still answers `in-flight` (see `009-scheduled-processor.md`).

The key model refuses an empty key and a key longer than the 128-character column with a plain
`Error`. A client should meet that limit as a 400 at the HTTP edge, not here.

## In one transaction with the write

The caller completes the key as the last write of its own transaction (see
`product-create.use-case.ts`), so the stored answer and the write commit together. The caller's
`try` holds only the work up to the commit: a failure there releases the key, so an honest retry can
take it again. The ledger record and the log come after the `try`, so a failure after the commit
never calls `release` and leaves the completed key, and the retry is a replay.
