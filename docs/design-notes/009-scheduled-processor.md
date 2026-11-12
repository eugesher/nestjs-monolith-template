# 009 — Scheduled processor

`apps/processor-app/src/processors/idempotency` deletes expired and stuck rows of `idempotency_key`
on a schedule. The keys are written by the core idempotency module (see `006-idempotency-keys.md`),
but nothing else deletes them, so the delete lives here with a repository of its own (see
`024-code-placement.md`). It is a processor: a schedule enters it, not an HTTP request.

| Layer                        | What it holds                                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `presentation/processors`    | `IdempotencyPurgeProcessor`, `@Cron(CronExpression.EVERY_5_MINUTES)`                                              |
| `application`                | `IdempotencyPurgeUseCase`                                                                                         |
| `domain`                     | `IdempotencyPurgeHelper.expiryCutoff`, `IdempotencyPurgeHelper.inFlightCutoff`                                    |
| `outbound`                   | `IDEMPOTENCY_PURGE_REPOSITORY_PORT`, `IDEMPOTENCY_KEY_TTL_HOURS_TOKEN`, `IDEMPOTENCY_IN_FLIGHT_TTL_MINUTES_TOKEN` |
| `infrastructure/persistence` | `IdempotencyPurgeRepository`                                                                                      |
| `infrastructure/config`      | `IdempotencyConfigKeyTtlHoursProvider`, `IdempotencyConfigInFlightTtlMinutesProvider`                             |

The processor owns both TTLs: its `infrastructure/config` binds `IDEMPOTENCY_KEY_TTL_HOURS` and
`IDEMPOTENCY_IN_FLIGHT_TTL_MINUTES` to their tokens (see `030-config-values.md`). The core module
reads no configuration, so staff-app and customer-app need no TTL. On every tick the use case
computes two cutoffs, each the instant its TTL before now, and the repository deletes:

| Rows                       | Cutoff                                                 | Why                                             |
| -------------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| every key, whatever status | `IDEMPOTENCY_KEY_TTL_HOURS`, 24 in the examples        | a client no longer retries a request that old   |
| the keys still `in_flight` | `IDEMPOTENCY_IN_FLIGHT_TTL_MINUTES`, 5 in the examples | the holder died before it could release the key |

**A stuck key frees itself within minutes.** A caller releases its key when its work throws (see
`006-idempotency-keys.md`), but a process that dies between `claim` and its transaction releases
nothing, and every retry with that key would get `in-flight` until the 24-hour purge. The short TTL
must outlast the longest write that holds a key, lock waits included: a key deleted under a live
holder lets a retry claim it and do the work twice. The five-minute tick bounds the wait for a
client to the in-flight TTL plus one tick.

## The schedule decides only when

**The processor opens a correlation context and nothing else.** A tick is not a request, so no
middleware has opened a context for it. `handleTick` runs the use case inside
`CorrelationContextHelper.run` with no inbound id, which mints a new id for every tick. Everything
the tick logs carries it, and nothing logs the root warning about a missing context.

**The cadence is a constant.** A decorator argument is evaluated when the class is defined, before
DI can resolve a configured value. A configured cadence would need `SchedulerRegistry` and an
interval that `onModuleDestroy` removes, or the timer would keep the process alive.

## The use case owns the outcome

The use case, not the processor, holds the guard and the logs, because a processor does not log:
outcomes are logged by the application.

- **An overlapping tick is skipped, not raced.** `@Cron` fires on its cadence whatever the previous
  callback is doing. While a purge runs, the next tick logs
  `Idempotency purge still running, this tick is skipped` at `info` and returns. Nest makes the use
  case a singleton, so the flag is shared by every tick.
- **The flag is cleared in `finally`.** A throw must not leave it set and silence every later tick.
- **A failed purge is logged, not thrown.** It logs
  `Idempotency purge failed, the next tick retries` at `warn` with the error. Expired keys only cost
  space until the next tick.

- **A successful purge logs one line**, `Expired idempotency keys purged`, with each cutoff, the
  count of keys it deleted and its TTL.

## Wiring

processor-app mounts `IdempotencyModule` through `@acme-processor/processors`. `@Cron` only marks
the method: the tick fires because processor-app imports `ScheduleSetupModule`, which imports
`ScheduleModule.forRoot()`. The schedule is named `idempotency-purge`, so the e2e suite fires it
through `SchedulerRegistry`.

Lint lets a processor take only `Cron` and `CronExpression` from `@nestjs/schedule`, the app only
`ScheduleModule`, and the e2e code only `SchedulerRegistry`. No other layer imports the package.
