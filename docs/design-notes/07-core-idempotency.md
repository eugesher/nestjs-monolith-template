# 07 — Core idempotency

`core/modules/src/idempotency` keeps the `idempotency_key` table: which `Idempotency-Key` a client
has used, for which request body, and what the first request answered. It is a core module because
both apps write through it: the staff `product` feature and the customer `order` feature claim keys
while serving writes, and the `idempotency-purge` processor of processor-app deletes expired ones on a
schedule. Its contract `core/contracts/src/idempotency` has two ports:

| Port                          | Facade                       | Consumer                                    |
| ----------------------------- | ---------------------------- | ------------------------------------------- |
| `IDEMPOTENCY_CORE_KEY_PORT`   | `IdempotencyCoreKeyFacade`   | a feature that serves an idempotent write   |
| `IDEMPOTENCY_CORE_PURGE_PORT` | `IdempotencyCorePurgeFacade` | the processor that deletes the expired keys |

A feature or a processor root mounts `IdempotencyCoreModule` from `@acme-core/modules/idempotency`
and reaches a port only from a core-adapter, like any core module. The `IdempotencyKey` decorator
that reads the header lives in `@acme-libs/http`, so both apps parse the key the same way.

Keys share one table and one UNIQUE index across the apps. A key that one app or one client already
used is a `mismatch` for any other body, so a caller that wants keys scoped per user puts the user
into the body it claims, as the `order` feature does with `customerId`.

## Claim before the work

**The insert is the lock.** `claim` inserts an in-flight row against the UNIQUE index on the key
before the caller does any work. Of two simultaneous requests with the same key, exactly one insert
succeeds. A "have I seen this key?" read before the write would let both through.

**The module fingerprints the body.** The caller passes the logical body, never a hash.
`BodyFingerprintHelper` hashes it canonically: object keys are sorted at every depth and array order
is kept. The caller must leave out anything that changes on a retry, such as the correlation id.

| Outcome     | When                               | What the caller does                                         |
| ----------- | ---------------------------------- | ------------------------------------------------------------ |
| `claimed`   | the insert succeeded               | the work, then `complete`, or `release` if it throws         |
| `replay`    | same key, same body, completed     | answers `storedResponse` without doing the work again        |
| `in-flight` | same key, same body, not completed | asks the client to retry shortly (409)                       |
| `mismatch`  | same key, different body           | refuses (422): the stored answer belongs to another question |

The outcome enum lives in the contract, not in `libs/kernel`, because only the core-adapters read it.

**A key that vanished is in flight.** If the insert hits a duplicate but the row is gone when the
module reads it, the holder has just released it. The answer is `in-flight`: the client retries and
claims it properly. Answering `claimed` would let the caller work without holding a row, so a
concurrent duplicate could work too.

## Complete, release, purge

- **`complete` stores the response as JSON**, and `claim` parses it back for a replay. The caller
  hands over the object it is about to return and never sees the serialized form.
- **`release` deletes only an in-flight row.** A completed key survives a late release, so a replay
  stays possible.
- **`purgeExpired` deletes rows older than the TTL its command carries**, whatever their status,
  and logs the cutoff, the count and the TTL. The module reads no configuration: the
  `idempotency-purge` processor of processor-app owns `IDEMPOTENCY_KEY_TTL_HOURS` (24 by default)
  and calls it every hour (see `10-idempotency-purge-processor.md`). So staff-app and customer-app
  mount the module without that variable. Until the purge runs, an expired key still replays.

The key model refuses an empty key and a key longer than the 128-character column with a plain
`Error`. A client should meet that limit as a 400 at the HTTP edge, not here.
