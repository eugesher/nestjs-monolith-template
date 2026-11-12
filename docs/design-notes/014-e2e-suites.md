# 014 — E2E suites

Each app has one e2e suite that boots its `AppModule` against the infrastructure of
`013-e2e-infrastructure.md`. The suites keep only what unit specs cannot show: SQL, transactions,
the wiring of guards, pipes, filters and middleware, the cache, idempotency and the ledger record
queue. Logic stays in the unit specs. staff-app and customer-app also have a system suite that boots
processor-app next to them (see System suites below).

## Running

```bash
yarn test:e2e
```

`test:e2e` rebuilds the infrastructure with `test:e2e:infra:reload` and runs `test:e2e:run`: the
five suites one after another, each after a reseed, as CI does, then one report with the tests,
failures, snapshots and seconds of each suite (`scripts/node/e2e-run.ts`). It runs every suite even
after a failure and exits with 1 if one failed.

```bash
yarn test:e2e:staff
```

`test:e2e:<suite>` is `test:e2e:infra:reseed` and then `test:e2e:<suite>:run`, the Jest run alone.
The suites are `staff`, `customer`, `processor`, `system:staff` and `system:customer`.

Each suite starts from a reseed: the cases write the fixtures, and a second run on the same data
fails. Every script passes `--ci`, so a run never writes a snapshot; a new or changed snapshot is
written by running Jest without it, then read before it is kept.

## Layout

```text
apps/<app>/test/
  jest-e2e.config.js
  app/app.e2e-spec.ts
  app/__snapshots__/app.e2e-spec.ts.snap
  context/app-e2e.context.ts
  features/index.ts
  features/<feature>/<feature>.e2e.ts
  features/<group>/<group>.e2e.ts
  features/<group>/modules/<feature>.e2e.ts
  processors/index.ts
  processors/<processor>/<processor>.e2e.ts
```

`processors/` exists in processor-app only: a processor class has one public method per entry,
`handleRecord()` for a queue and `handleTick()` for a schedule.

**`app.e2e-spec.ts` is the only Jest entry.** The app boots once, in `beforeAll`. The entry holds
one `describe` per feature and calls the methods of the feature class inside it:

```ts
describe('Note', () => {
  noteE2E.handleGetMany();
  noteE2E.handleEdit();
});
```

**A group of features has a class of its own** (see `025-feature-groups.md`). `AccessE2E.of(ctx)`
builds the classes of its modules from `modules/`, and `execute()` holds one `describe` per module
with the calls of that module. The entry calls only `execute()` inside the `describe` of the group,
and `features/index.ts` exports the group, not its modules:

```ts
describe('Access', () => {
  accessE2E.execute();
});
```

The name of a case starts with the group and the module: `Access › Role › GET /api/access/roles`.

The order of the calls is the order of the database states: the cases that read a whole list come
before the cases that write into it.

**A feature class has one public method per endpoint**, named after the controller method, and the
method wraps the `describe` of that endpoint. `ProductE2E.of(ctx)` builds it over the context. A
feature that needs a hook before each case has `hooks()`, as `ReminderE2E` deletes the `acme:` keys
from Redis.

**`AppE2EContext` mirrors `main.ts`.** Each context extends `E2EContext` of
`libs/testing/src/e2e/e2e.context.ts`, which holds only what all five contexts use: `init()`
compiles the `AppModule` it is given with `@nestjs/testing`, sets the logger and the global prefix,
builds a `JwtService` with `JWT_SECRET` from the config and spies on the root logger; `close()` and
`takeRootWarnings()` round it off. The class is not abstract: a context passes its `AppModule` to
the constructor, calls `super.init()` and adds its own. It signs one access token for each seeded
account the cases use: admin, editor and viewer in staff-app, ann, bob and carol in customer-app,
admin and viewer in processor-app. Everything the cases read is a getter that throws before
`init()`. The contexts of staff-app and customer-app also hold the Redis client, through
`@acme-libs/testing`.

**A reminder case clears the keys of the app, not the database.** The Bull queue of the ledger
records lives in the same Redis, so `FLUSHDB` would drop its jobs and counters. `hooks()` deletes
the `acme:*` keys before each case, and the cases list the `acme:*` keys only: a timer of Bull
writes its own keys at any moment.

**staff-app and customer-app read the job, not the ledger.** Neither processes the queue, so their
contexts have `takeLedgerRecords()`: it returns the data of the waiting jobs of the `ledger-record`
queue and empties the queue, as `takeRootWarnings()` takes the warnings. A case that enqueues takes
the jobs, so the next case starts from an empty queue.

**processor-app waits for the queue and the schedules.** Its cases add jobs to the queue themselves
and read the ledger. `waitForLedgerRecordQueue()` polls `getJobCounts()` every 100 ms until no job
is waiting, active or delayed, and throws after 100 polls; the jobs run in the e2e process, so a
drained queue means the rows are written. `fireSchedule(name)` fires a schedule through
`SchedulerRegistry` without waiting for it, and `waitFor(description, settled)` polls until the
outcome shows. A failing job is a record whose `subjectType` is longer than its column, enqueued
with `attempts: 1`; the `/queues` cases retry and delete such jobs over HTTP with the tokens of the
seeded staff users.

The Jest files outside the apps live in `jest/`:

| File                        | What it does                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `jest-common.e2e.config.js` | the Jest config of a suite: its app, its root (`apps/<app>` unless given), aliases from `tsconfig.json`, `TZ=America/New_York` |

**The environment comes from `env/apps/<app>/.env.test`.** The scripts set `NODE_ENV=test`, and
`EnvHelper.appEnvFilePaths` picks that file, which is in the repository. `jest-common.e2e.config.js`
loads the file over the variables of the process, so a variable left in the shell, such as a
production database host, cannot point a suite at another database.

**The suites run west of UTC.** `TZ=America/New_York` makes a date that drifts through a JavaScript
`Date` come back a day early, so the reminder cases catch it.

## Root warnings

The root `afterEach` fails a case when the root logger logged a warning during it:

```ts
afterEach(() => {
  expect(ctx.takeRootWarnings()).toEqual([]);
});
```

A warning on the root logger means a correlation context was lost: `CorrelationContextHelper` logs
one when it has to mint an id outside a request.

**A spy on `PinoLogger.root.warn` also sees the request loggers.** pino builds a child logger with
`Object.create(parent)`, so the request logger inherits the spied method of the root. The context
keeps a call only when the logger it was called on is the root itself, by `mock.contexts`.

## What a case checks

- **The status stays on the request**, `.expect(HttpStatus.X)`, and is not in the snapshot.
- **One object per case goes into `toMatchSnapshot()`**, its keys in the order they are read:
  `response: { body }`, then `db: { <table>: rows }`, then `cache: { keys, values }`.
- **The body is whole, and a row is read back whole**, with `SELECT *` and `ORDER BY`.
- **A value that changes per run gets a matcher in the snapshot and an exact check after it.** A row
  a case creates is found by `MAX(id)` read before the call: the snapshot has
  `id: expect.any(String)`, and a check after it compares the id with the response and with
  `MAX(id)`. A literal auto-increment id never enters a snapshot.
- **A case that needs a state the seeds lack makes it and undoes it in `finally`**, as the rollback
  of a note edit inserts the revision that breaks the edit and deletes it afterwards.
- **A case that writes sends a fixed `x-correlation-id`** when the correlation id lands in a row, so
  the row is literal in the snapshot. The id is a UUID, `e2e00000-0000-4000-8000-…` with a number
  per case, and the seeds use `5eed0000-0000-4000-8000-000000000001`: any other value is replaced.

## What the suites cover

The cases are the methods of the section classes: `apps/<app>/test/features/**/*.e2e.ts` and
`apps/processor-app/test/processors/**/*.e2e.ts`, mounted by `apps/<app>/test/app/app.e2e-spec.ts`.
The snapshots in `apps/<app>/test/app/__snapshots__` hold what each case asserts.

## System suites

`test/system/apps/<app>` starts an API app and processor-app in one process on the same MySQL and
Redis. It has the layout of `apps/<app>/test`: the entry `app/app-system.e2e-spec.ts`,
`context/app-e2e.context.ts` and the classes of `features/`. An app suite reads the waiting job and
stops there, a processor suite adds the job by hand, so neither proves that what a producer writes
is what the processor reads. A system suite covers that seam and nothing else: one case per producer
of a queue, checked like an app case, with the result of the job in place of the job.

**A job is awaited by its result.** `pollUntil(read, isDone)` waits first and reads after, 30
attempts 500 ms apart, and answers the last read, so a job that never lands fails on the snapshot. A
chain of jobs is awaited by its last row: the order case waits for the two ledger entries under one
correlation id, `OrderPlaced` and `ProductArchived` of the sold-out product.

**The apps share one environment.** Jest loads the `.env.test` of the API app, and processor-app
adds the variables only it has from its own file. The two differ in `PORT` and `JWT_SECRET`, and no
system case calls processor-app over HTTP.

**`test/system` is not plain node.** It compiles project code, so it has its own `tsconfig.json`
over the root one and the lint category `repo:system`: it sees its own files, the `AppModule` of
every app, the libs `kernel`, `toolkit` and `testing`, and the packages `@nestjs/common`, `ioredis`
and `supertest`. `test/infra` keeps running under plain node.

## Lint

`apps/*/test/**` is the category `acme-app:test`. It sees its own app's tests, its `AppModule`, its
contracts, the contracts of core, `@acme-libs/contracts/ledger`, `@acme-core/entities`, the libs
`kernel`, `toolkit`, `database` and `testing`, and the packages `@nestjs/bull`, `@nestjs/common`,
`@nestjs/config`, `@nestjs/schedule`, `bull`, `ioredis`, `supertest` and `typeorm`.
`@nestjs/testing` and `nestjs-pino` stay in the testing lib.
`spec/architecture/e2e-sections.spec.ts` checks these edges.

The e2e code turns off `no-unsafe-argument`, `no-unsafe-assignment` and `no-unsafe-member-access`
(`lint/configs/e2e.mjs`): a response body and a query result are untyped by nature, and the snapshot
is what checks their shape.

## HTTP collection

`.http/` holds a [Posting](https://posting.sh) collection per app with one request per e2e case. See
`.http/README.md`.
