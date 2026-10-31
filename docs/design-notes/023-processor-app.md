# 023 — Processor app

`apps/processor-app` runs the background work of the template: the queue consumers and the
schedules. staff-app and customer-app only enqueue. All three apps share one database and one Redis.

| Processor           | Entered by                                       | What it does                                                            |
| ------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| `ledger-record`     | a job of the `ledger-record` queue               | appends the record (see `008-queue-consumer.md`)                        |
| `ledger-record`     | `@Cron(EVERY_DAY_AT_3AM)`                        | returns every failed `ledger-record` job to the queue (same note)       |
| `idempotency-purge` | `@Cron(EVERY_HOUR)`                              | deletes the expired idempotency keys (see `009-scheduled-processor.md`) |
| `product-stock`     | a job of the `product-stock-post-subtract` queue | a transaction over two core modules (see below)                         |

## Why a third app

**Background work scales and fails apart from HTTP.** A consumer inside an HTTP app shares the CPU
of the requests, and a schedule inside it runs once per replica: three replicas of staff-app would
purge three times an hour. processor-app is its own deployable, so the HTTP apps scale with traffic
and processor-app with the queue.

**No HTTP app owns this work.** The queues are written by several apps, and a processor of one HTTP
app would serve the others through a shared Redis anyway; a third app says so.

## Shape

The app has the folders of an HTTP app and uses fewer of them:

| Folder                            | What it holds                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/main.ts`                     | the same bootstrap as the other apps; it listens only for the health probes               |
| `src/app/setup`                   | config, ORM, queue and schedule; processor-app is the only app with `ScheduleSetupModule` |
| `src/common/shared/ledger-record` | the registration of the `ledger-record` queue, as in the producers                        |
| `src/features/health`             | `GET /health` and `GET /health/ready` for the orchestrator                                |
| `src/processors`                  | the three processors                                                                      |

**HTTP serves only the probes.** There is no `AuthGlobalModule`: the health routes are public in
every app, and nothing else is mounted. The health controller carries no `@Public()`, because no
guard reads it here. `APP_FILTER` keeps `HttpExceptionFilter`, so a 404 has the body of the other
apps; there is no validation pipe, as no route takes a body.

**The config holds what the processors read**: the database, Redis, `IDEMPOTENCY_KEY_TTL_HOURS`,
`LEDGER_RETRY_ATTEMPTS` and `QUEUE_RETRY_ATTEMPTS` of the core modules it mounts, the logger and
tracing. No JWT, argon2 or cache TTL.

**The entity list holds `IdempotencyKey`, `LedgerEntry`, `Product` and `ProductStock`**, the tables
of the purge, the ledger append and the stock check, with `Order`, `OrderProduct` and `Customer`,
which the relations of `ProductStock` need on the connection.

## The product-stock processor

`apps/processor-app/src/processors/product-stock` consumes a queue that a core module fills after
its commits (see `022-enqueue-after-commit.md`). `ProductStockPostSubtractConsumer` opens the
correlation context of the job and runs one use case in one transaction:

1. `PRODUCT_STOCK_ON_HAND_PORT.lock` locks the rows and sums through `core/modules/src/product-stock`;
2. the processor's own repository reads what it needs of the same rows under that lock;
3. `PRODUCT_STOCK_ARCHIVE_PORT` writes through `core/modules/src/product` (see
   `027-core-module-outcomes.md`), which announces its write after the commit.

**The lock makes the check exact.** A write that commits before the lock is counted, a write that
comes after it waits (see `021-pessimistic-locking.md`).

**A replay writes nothing**, because the rows the first run changed are no longer picked.

## Running

| Script                         | What it does                                          |
| ------------------------------ | ----------------------------------------------------- |
| `yarn start:dev:processor-app` | watch mode, reads `env/apps/processor-app/.env.local` |
| `yarn build:processor-app`     | the bundle in `dist/apps/processor-app`               |
| `yarn test:e2e:processor`      | the e2e suite (see `014-e2e-suites.md`)               |

`yarn start:dev` starts the three apps. The root `docker-compose.yml` runs processor-app on port
3002 from the same `Dockerfile`, with `APP_NAME=processor-app`.

**Every app points `REDIS_URL` at one Redis.** The producers and the consumer meet only in the
queue: a producer with another Redis enqueues into a queue nobody reads.
