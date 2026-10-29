# 07 — Idempotency common module

`apps/staff-app/src/common/modules/idempotency` keeps the `idempotency_key` table: which
`Idempotency-Key` a client has used, for which request body, and what the first request answered.
It is a common module because two different entry points need it: the `product` feature claims keys
while serving writes, and the `idempotency-purge` processor deletes expired ones on a schedule.

| Alias                                    | What it is                                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------------------- |
| `@acme-staff-contracts/idempotency`      | `IDEMPOTENCY_COMMON_PORT`, its commands and views, `IdempotencyCommonClaimOutcomeEnum` |
| `@acme-staff-common/modules/idempotency` | `IdempotencyCommonModule`, the only export of the module root                          |

A feature root mounts the module. The feature reaches the port only from a common-adapter. Lint
keeps customer-app out of both aliases.

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

The outcome enum lives in the contract, not in `libs/kernel`, because only staff-app reads it.

**A key that vanished is in flight.** If the insert hits a duplicate but the row is gone when the
module reads it, the holder has just released it. The answer is `in-flight`: the client retries and
claims it properly. Answering `claimed` would let the caller work without holding a row, so a
concurrent duplicate could work too.

## Complete, release, purge

- **`complete` stores the response as JSON**, and `claim` parses it back for a replay. The caller
  hands over the object it is about to return and never sees the serialized form.
- **`release` deletes only an in-flight row.** A completed key survives a late release, so a replay
  stays possible.
- **`purgeExpired` deletes rows older than `IDEMPOTENCY_KEY_TTL_HOURS`** (24 by default), whatever
  their status, and logs the cutoff and the count. The `idempotency-purge` processor calls it
  every hour (see `10-idempotency-purge-processor.md`). Until the purge runs, an expired key still
  replays.

The key model refuses an empty key and a key longer than the 128-character column with a plain
`Error`. A client should meet that limit as a 400 at the HTTP edge, not here.
