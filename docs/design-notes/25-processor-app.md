# 25 — Processor app

`apps/processor-app` runs the background work of the template: the queue consumers and the
schedules. staff-app and customer-app only enqueue. All three apps share one database and one Redis.

| Processor           | Entered by                         | What it does                                                                   |
| ------------------- | ---------------------------------- | ------------------------------------------------------------------------------ |
| `ledger-record`     | a job of the `ledger-record` queue | appends the record to the ledger (see `09-ledger-record-processor.md`)         |
| `ledger-record`     | `@Cron(EVERY_DAY_AT_3AM)`          | returns every failed `ledger-record` job to the queue (same note)              |
| `idempotency-purge` | `@Cron(EVERY_HOUR)`                | deletes the expired idempotency keys (see `10-idempotency-purge-processor.md`) |

## Why a third app

**Background work scales and fails apart from HTTP.** A consumer inside an HTTP app shares the CPU
of the requests, and a schedule inside it runs once per replica: three replicas of staff-app would
purge three times an hour. processor-app is its own deployable, so the HTTP apps scale with traffic
and processor-app with the queue.

**No HTTP app owns this work.** Both apps write ledger records, and the idempotency keys of both
expire. A processor of one HTTP app would serve the other through a shared Redis anyway; a third app
says so.

## Shape

The app has the folders of an HTTP app and uses fewer of them:

| Folder                            | What it holds                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/main.ts`                     | the same bootstrap as the other apps; it listens only for the health probes               |
| `src/app/setup`                   | config, ORM, queue and schedule; processor-app is the only app with `ScheduleSetupModule` |
| `src/common/shared/ledger-record` | the registration of the `ledger-record` queue, as in the producers                        |
| `src/features/health`             | `GET /health` and `GET /health/ready` for the orchestrator                                |
| `src/processors`                  | the two processors                                                                        |

**HTTP serves only the probes.** There is no `AuthGlobalModule`: the health routes are public in
every app, and nothing else is mounted. The health controller carries no `@Public()`, because no
guard reads it here. `APP_FILTER` keeps `HttpExceptionFilter`, so a 404 has the body of the other
apps; there is no validation pipe, as no route takes a body.

**The config holds what the processors read**: the database, Redis, `IDEMPOTENCY_KEY_TTL_HOURS`,
the logger and tracing. No JWT, argon2, cache TTL or retry variables.

**The entity list holds `IdempotencyKey` and `LedgerEntry`**, the tables of the purge and of the
ledger append.

## Running

| Script                         | What it does                                          |
| ------------------------------ | ----------------------------------------------------- |
| `yarn start:dev:processor-app` | watch mode, reads `env/apps/processor-app/.env.local` |
| `yarn build:processor-app`     | the bundle in `dist/apps/processor-app`               |
| `yarn test:e2e:processor`      | the e2e suite (see `15-e2e-suites.md`)                |

`yarn start:dev` starts the three apps. The root `docker-compose.yml` runs processor-app on port
3002 from the same `Dockerfile`, with `APP_NAME=processor-app`.

**Every app points `REDIS_URL` at one Redis.** The producers and the consumer meet only in the
queue: a producer with another Redis enqueues into a queue nobody reads.
