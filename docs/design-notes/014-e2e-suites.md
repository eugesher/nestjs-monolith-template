# 014 — E2E suites

Each app has one e2e suite that boots its `AppModule` against the infrastructure of
`013-e2e-infrastructure.md`. The suites keep only what unit specs cannot show: SQL, transactions,
the wiring of guards, pipes, filters and middleware, the cache, idempotency and the ledger record queue.
Logic stays in the unit specs.

## Running

```bash
yarn test:e2e:infra:reseed && yarn test:e2e:staff
```

```bash
yarn test:e2e:infra:reseed && yarn test:e2e:customer
```

```bash
yarn test:e2e:infra:reseed && yarn test:e2e:processor
```

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
`handleRecord()` for a queue and `handleTick()` or `handleRetryTick()` for a schedule.

**`app.e2e-spec.ts` is the only Jest entry.** The app boots once, in `beforeAll`. The entry holds
one `describe` per feature and calls the methods of the feature class inside it:

```ts
describe('Note', () => {
  noteE2E.handleGetMany();
  noteE2E.handleEdit();
});
```

**A group of features has a class of its own** (see `025-feature-groups.md`). `IdentityE2E.of(ctx)`
builds the classes of its modules from `modules/`, and `execute()` holds one `describe` per module
with the calls of that module. The entry calls only `execute()` inside the `describe` of the group,
and `features/index.ts` exports the group, not its modules:

```ts
describe('Identity', () => {
  identityE2E.execute();
});
```

The name of a case starts with the group and the module: `Identity › Role › GET /api/identity/roles`.

The order of the calls is the order of the database states: the cases that read a whole list come
before the cases that write into it.

**A feature class has one public method per endpoint**, named after the controller method, and the
method wraps the `describe` of that endpoint. `ProductE2E.of(ctx)` builds it over the context. A
feature that needs a hook before each case has `hooks()`, as `ReminderE2E` deletes the `acme:` keys from Redis.

**`AppE2EContext` mirrors `main.ts`.** `init()` compiles `AppModule` with `@nestjs/testing`, sets
the logger and the global prefix, and signs one access token for each seeded account the cases use
with `JWT_SECRET` from the config: admin, editor and viewer in staff-app, bob in customer-app.
processor-app has no auth and signs nothing. Everything the cases read is a getter that throws before
`init()`. The staff-app context also holds the Redis client, through `@acme-libs/cache/testing`.

**A reminder case clears the keys of the app, not the database.** The Bull queue of the ledger
records lives in the same Redis, so `FLUSHDB` would drop its jobs and counters. `hooks()` deletes the
`acme:*` keys before each case, and the cases list the `acme:*` keys only: a timer of Bull writes its
own keys at any moment.

**staff-app and customer-app read the job, not the ledger.** Neither consumes the queue, so their
contexts have `takeLedgerRecords()`: it returns the data of the waiting jobs of the `ledger-record`
queue and empties the queue, as `takeRootWarnings()` takes the warnings. A case that enqueues takes
the jobs, so the next case starts from an empty queue.

**processor-app waits for the queue and the schedules.** Its cases add jobs to the queue themselves
and read the ledger. `waitForLedgerRecordQueue()` polls `getJobCounts()` every 100 ms until no job is
waiting, active or delayed, and throws after 100 polls; the jobs run in the e2e process, so a drained
queue means the rows are written. `fireSchedule(name)` fires a schedule through `SchedulerRegistry`
without waiting for it, and `waitFor(description, settled)` polls until the outcome shows. A failing
job is a record whose `subjectType` is longer than its column, enqueued with `attempts: 1`; the retry
case fixes it with `job.update` before it fires `ledger-record-retry`.

The Jest files outside the apps live in `jest/`:

| File                        | What it does                                                                    |
| --------------------------- | ------------------------------------------------------------------------------- |
| `jest-common.e2e.config.js` | the Jest config of one app: aliases from `tsconfig.json`, `TZ=America/New_York` |
| `<app>.e2e-setup.js`        | the environment of one app under test, set before any module loads              |

**The environment comes from `jest/<app>.e2e-setup.js` only.** It runs before any module
loads and sets every variable the config schema of its app reads, and nothing else. A developer's
`.env.local` never leaks into a run: the variables of the process take precedence over the env
files.

**The suites run west of UTC.** `TZ=America/New_York` makes a date that drifts through a
JavaScript `Date` come back a day early, so the reminder cases catch it.

## Root warnings

The root `afterEach` fails a case when the root logger logged a warning during it:

```ts
afterEach(() => {
  expect(ctx.takeRootWarnings()).toEqual([]);
});
```

A warning on the root logger means a correlation context was lost: `CorrelationContextHelper`
logs one when it has to mint an id outside a request.

**A spy on `PinoLogger.root.warn` also sees the request loggers.** pino builds a child logger with
`Object.create(parent)`, so the request logger inherits the spied method of the root. The context
keeps a call only when the logger it was called on is the root itself, by `mock.contexts`.

## What a case checks

- **The status stays on the request**, `.expect(HttpStatus.X)`, and is not in the snapshot.
- **One object per case goes into `toMatchSnapshot()`**, its keys in the order they are read:
  `response: { body }`, then `db: { <table>: rows }`, then `cache: { keys, values }`.
- **The body is whole, and a row is read back whole**, with `SELECT *` and `ORDER BY`.
- **A value that changes per run gets a matcher in the snapshot and an exact check after it.** A
  row a case creates is found by `MAX(id)` read before the call: the snapshot has
  `id: expect.any(String)`, and a check after it compares the id with the response and with
  `MAX(id)`. A literal auto-increment id never enters a snapshot.
- **A case that needs a state the seeds lack makes it and undoes it in `finally`**, as the
  rollback of a note edit inserts the revision that breaks the edit and deletes it afterwards.
- **A case that writes sends a fixed `x-correlation-id`** when the correlation id lands in a row,
  so the row is literal in the snapshot.

## What the suites cover

The cases are the methods of the section classes: `apps/<app>/test/features/**/*.e2e.ts` and
`apps/processor-app/test/processors/**/*.e2e.ts`, mounted by `apps/<app>/test/app/app.e2e-spec.ts`.
The snapshots in `apps/<app>/test/app/__snapshots__` hold what each case asserts.

## Lint

`apps/*/test/**` is the category `acme-app:test`. It sees its own app's tests, its `AppModule`, its
contracts, `@acme-core/entities`, the libs `kernel`, `toolkit`, `database`, `cache` and
`observability`, and the packages `@nestjs/common`, `@nestjs/config`, `@nestjs/jwt`,
`@nestjs/testing`, `ioredis`, `nestjs-pino`, `supertest` and `typeorm`. `spec/architecture/e2e-sections.spec.ts` checks these edges.

The e2e code turns off `no-unsafe-argument`, `no-unsafe-assignment` and `no-unsafe-member-access`
(`lint/configs/e2e.mjs`): a response body and a query result are untyped by nature, and the snapshot is
what checks their shape.

## HTTP collection

`.http/` holds a [Posting](https://posting.sh) collection per app with one request per e2e case. See
`.http/README.md`.
