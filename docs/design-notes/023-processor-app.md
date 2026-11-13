# 023 — Processor app

`apps/processor-app` runs the background work of the template: the queue processors and the
schedules, and serves the staff the failed jobs of its queues. staff-app and customer-app only
enqueue. All three apps share one database and one Redis.

| Processor       | Entered by                                       | What it does                                                                      |
| --------------- | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| `ledger`        | a job of the `ledger-record` queue               | appends the record (see `008-queue-processor.md`)                                 |
| `idempotency`   | `@Cron(EVERY_5_MINUTES)`                         | deletes the expired and stuck idempotency keys (see `009-scheduled-processor.md`) |
| `product-stock` | a job of the `product-stock-post-subtract` queue | a transaction over two core modules (see below)                                   |

## Why a third app

**Background work scales and fails apart from HTTP.** A processor inside an HTTP app shares the CPU
of the requests, and a schedule inside it runs once per replica: three replicas of staff-app would
purge three times on every tick. processor-app is its own deployable, so the HTTP apps scale with
traffic and processor-app with the queue.

**No HTTP app owns this work.** The queues are written by several apps, and a processor of one HTTP
app would serve the others through a shared Redis anyway; a third app says so.

## Shape

The app has the folders of an HTTP app and uses fewer of them:

| Folder                | What it holds                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/main.ts`         | the same bootstrap as the other apps; it listens for the health probes, the login and the queue routes |
| `src/app/setup`       | config and schedule; processor-app is the only app with `ScheduleSetupModule`                          |
| `src/app/global/auth` | `AuthGlobalModule` over the core module `staff-auth`, as in staff-app                                  |
| `src/features/auth`   | `POST /auth/login` for the staff, over the same core module                                            |
| `src/common/shared`   | the registrations of the `ledger-record` and `product-stock-post-subtract` queues                      |
| `src/features/health` | `GET /health` and `GET /health/ready` for the orchestrator                                             |
| `src/features/queue`  | the failed jobs of the queues for the staff                                                            |
| `src/processors`      | the three processors                                                                                   |

**HTTP serves the probes, the login and the queues.** `AuthGlobalModule` and the login reach the
staff through the core module `staff-auth` (see `017-credentials-lib.md`). processor-app shares
`JWT_SECRET` and the `staff` audience with staff-app, so a token of either app works in both, and
lists the staff identity entities on its connection for the core module. The health routes carry
`@Public()`. `APP_PIPE` and `APP_FILTER` are the ones of staff-app.

| Route                                          | Permission     | What it does                                              |
| ---------------------------------------------- | -------------- | --------------------------------------------------------- |
| `GET /queues`                                  | `queue:read`   | every queue with its `getJobCounts()`                     |
| `GET /queues/:queueName/jobs/failed`           | `queue:read`   | a page of the failed jobs as `job.toJSON()`, newest first |
| `PUT /queues/:queueName/jobs/failed/:jobId`    | `queue:retry`  | returns the job to the queue                              |
| `DELETE /queues/:queueName/jobs/failed/:jobId` | `queue:delete` | removes the job                                           |

An unknown queue or job answers 404, a job that is not failed 409. A retried job keeps its
`attemptsMade`, so its next failure sends it straight back to the failed set: a retry is one more
attempt, not a new round. The ledger deduplicates on the operation key, so retrying a ledger record
that did append writes nothing.

**Both actions log the staff user.** A retry logs `Failed job returned to the queue` at `info` with
the queue, the job id and `staffUserId`. A delete logs `Failed job deleted` at `warn` with the same
fields and the `data` of the job: a deleted ledger record never reaches the ledger, and the log is
the only place it can be restored from.

**The config holds what the processors read**: the database, Redis, `IDEMPOTENCY_KEY_TTL_HOURS`,
`IDEMPOTENCY_IN_FLIGHT_TTL_MINUTES`, `LEDGER_ENQUEUE_RETRY_ATTEMPTS` of the core ledger and
`ENQUEUE_RETRY_ATTEMPTS` of the core modules it mounts, the logger and tracing, and `JWT_SECRET`,
`JWT_EXPIRES_IN` and the argon2 costs for the staff login. No cache TTL.

**The entity list holds `IdempotencyKey`, `LedgerEntry`, `Product` and `ProductStock`**, the tables
of the purge, the ledger append and the stock check, with `Order`, `OrderProduct` and `Customer`,
which the relations of `ProductStock` need on the connection, and the staff identity entities the
guards read.

## The product-stock processor

`apps/processor-app/src/processors/product-stock` processes a queue that a core module fills after
its commits (see `022-enqueue-after-commit.md`). `ProductStockPostSubtractProcessor` opens the
correlation context of the job and runs one use case in one transaction:

1. `PRODUCT_STOCK_ON_HAND_PORT.lock` locks the rows and sums through
   `core/modules/src/product-stock`;
2. the processor's own repository reads what it needs of the same rows under that lock;
3. `PRODUCT_STOCK_ARCHIVE_PORT` writes through `core/modules/src/product` (see
   `027-core-module-outcomes.md`), which announces its write after the commit.

**The lock makes the check exact.** A write that commits before the lock is counted, a write that
comes after it waits (see `021-pessimistic-locking.md`).

**A replay writes nothing**, because the rows the first run changed are no longer picked.

**A failed check is logged as a failed ledger record is.** Every failed attempt reaches
`@OnQueueFailed`, and `ProductStockPostSubtractReportFailureUseCase` logs it with the product ids:
at `warn` while attempts are left, at `error` after the last one. A sold-out product the check did
not archive then shows in the logs, not only among the failed jobs of `/queues`.

## Running

| Script                         | What it does                                    |
| ------------------------------ | ----------------------------------------------- |
| `yarn start:dev:processor-app` | watch mode, reads `env/apps/processor-app/.env` |
| `yarn build:processor-app`     | the bundle in `dist/apps/processor-app`         |
| `yarn test:e2e:processor`      | the e2e suite (see `014-e2e-suites.md`)         |

`yarn start:dev` starts the three apps. The root `docker-compose.yml` runs processor-app on port
3002 from the same `Dockerfile`, with `APP_NAME=processor-app` (see `036-production-stack.md`).

**Every app points `REDIS_HOST` and `REDIS_PORT` at one Redis.** The producers and the processor
meet only in the queue: a producer with another Redis enqueues into a queue nobody reads.
