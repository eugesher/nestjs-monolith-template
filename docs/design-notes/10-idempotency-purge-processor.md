# 10 — Idempotency purge processor

`apps/processor-app/src/processors/idempotency-purge` deletes expired `Idempotency-Key` rows once an
hour through the core idempotency module (see `07-core-idempotency.md`). It is a
processor: a schedule enters it, not an HTTP request.

| Layer                          | What it holds                                                               |
| ------------------------------ | --------------------------------------------------------------------------- |
| `presentation`                 | `IdempotencyPurgeConsumer`, `@Cron(CronExpression.EVERY_HOUR)`              |
| `application`                  | `IdempotencyPurgeRunUseCase`                                                |
| `outbound`                     | `IDEMPOTENCY_PURGE_IDEMPOTENCY_PORT`, `IDEMPOTENCY_PURGE_KEY_TTL_HOURS`     |
| `infrastructure/core-adapters` | `IdempotencyPurgeIdempotencyCoreAdapter` over `IDEMPOTENCY_CORE_PURGE_PORT` |

The processor owns the TTL: its module reads `IDEMPOTENCY_KEY_TTL_HOURS` into
`IDEMPOTENCY_PURGE_KEY_TTL_HOURS`, and the use case passes it to the port on every tick. The core
module computes the cutoff and reads no configuration, so staff-app and customer-app, which mount the
module but never purge, need no TTL. The port answers nothing: the processor does not use the count.

## The schedule decides only when

**The consumer opens a correlation context and nothing else.** A tick is not a request, so no
middleware has opened a context for it. `handleTick` runs the use case inside
`CorrelationContextHelper.run` with no inbound id, which mints a new id for every tick. Everything
the tick logs carries it, and nothing logs the root warning about a missing context.

**The cadence is a constant.** A decorator argument is evaluated when the class is defined, before
DI can resolve a configured value. A configured cadence would need `SchedulerRegistry` and an
interval that `onModuleDestroy` removes, or the timer would keep the process alive.

## The use case owns the outcome

The use case, not the consumer, holds the guard and the logs, because a processor consumer does not
log: outcomes are logged by the application.

- **An overlapping tick is skipped, not raced.** `@Cron` fires on its cadence whatever the previous
  callback is doing. While a purge runs, the next tick logs
  `Idempotency purge still running, this tick is skipped` at `info` and returns. Nest makes the use
  case a singleton, so the flag is shared by every tick.
- **The flag is cleared in `finally`.** A throw must not leave it set and silence every later tick.
- **A failed purge is logged, not thrown.** It logs `Idempotency purge failed, the next tick
retries` at `warn` with the error. Expired keys only cost space until the next tick.

A successful purge logs nothing here. The core module already logs
`Expired idempotency keys purged` with the cutoff, the count and the TTL.

## Wiring

`IdempotencyPurgeModule` imports `IdempotencyCoreModule`, and processor-app mounts it through
`@acme-processor-processors`. `@Cron` only marks the method: the tick fires because processor-app
imports `ScheduleSetupModule`, which imports `ScheduleModule.forRoot()`. The schedule is named
`idempotency-purge`, so the e2e suite fires it through `SchedulerRegistry`.

Lint lets a processor consumer take only `Cron` and `CronExpression` from `@nestjs/schedule`, the
app only `ScheduleModule`, and the e2e code only `SchedulerRegistry`. No other layer imports the
package.
