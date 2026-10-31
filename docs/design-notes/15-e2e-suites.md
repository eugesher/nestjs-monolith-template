# 15 — E2E suites

Each app has one e2e suite that boots its `AppModule` against the infrastructure of
`14-e2e-infrastructure.md`. The suites keep only what unit specs cannot show: SQL, transactions,
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

**A group of features has a class of its own** (see `27-feature-groups.md`). `IdentityE2E.of(ctx)`
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

| App           | Feature               | Cases                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| staff-app     | app                   | the schema of every entity matches the migrated database; the customer-app sign-up is not mounted                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| staff-app     | auth                  | login answers one access token of the subject alone for the app lifetime, `me` with roles; claims in a token are ignored; a disabled user is refused; customer tokens are refused                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| staff-app     | iam                   | roles from the database; a new user logs in at once; of two simultaneous registrations with one email one is 409; a revoked permission refuses a token that passed a moment before                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| staff-app     | ledger                | a page of one subject; validation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| staff-app     | note                  | filters and validation; an edit records a revision under the correlation id; a failed revision insert rolls the note back; the note of another staff user is a 404 and no route needs a permission                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| staff-app     | order                 | every order of every customer, newest first, and the page window; one order with its lines; an unknown order is 404; validation; a role without `order:read` is 403 and a caller without a token 401                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| staff-app     | product               | the catalog and an unknown product; create with the idempotency key, a ledger record job under the correlation id; replay and reuse of a key; `If-Match`; an update with an empty body changes nothing, a viewer may not update; concurrent updates; archive through the core module with one ledger record job under a versioned key; restock writes a +N movement, the key and a ledger record per stock row, a draft too, replay and reuse of a key, an archived product is restocked and stays archived, unknown and deleted products are 404, a viewer may not restock; publish a draft with one ledger record job, a published product stays as is, an archived product is published again under a new version, an unknown one 404, a viewer may not publish; update, archive and publish drop the cached customer catalog, a restock keeps it |
| staff-app     | reminder              | the summary is cached and every write drops it; dates under `TZ`; another staff user's reminder is a 404; soft delete                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| customer-app  | app                   | staff-app routes are not mounted                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| customer-app  | auth                  | sign-up creates an active customer who logs in and a ledger record job with the email, a taken email is 409 even for two simultaneous sign-ups, invalid input is 400; login answers one access token of the subject alone for the app lifetime, `me`; staff credentials, a disabled customer and staff tokens are refused                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| customer-app  | catalog               | every active product in `id` order, without quantities, sold-out ones too; the page window and the total; a page is cached under the key of its window and a cached page is answered as is; invalid input is 400; a caller without a token is refused                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| customer-app  | order                 | placement writes a line and a -1 movement per unit, the key and a ledger record job, and a `product-stock-post-subtract` job for its products under the correlation id; replay, reuse and the key of another customer; too little stock is 409 and writes nothing; draft, archived, deleted and unknown products are 404; of two simultaneous orders for the last units one is 409; only own orders are listed and read                                                                                                                                                                                                                                                                                                                                                                                                                              |
| processor-app | app                   | only the health routes are mounted                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| processor-app | ledger-record         | a job becomes a ledger entry under its correlation id; a job replayed with one operation key appends once; a job that fails its last attempt stays among the failed jobs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| processor-app | ledger-record (retry) | the daily retry returns a failed job to the queue, and it is appended once its cause is gone                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| processor-app | idempotency-purge     | the keys older than the TTL are deleted and the fresh ones stay                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| processor-app | product-stock         | a job archives a published product without stock and its ledger record is appended under the job's correlation id; a published product with stock and a draft without stock stay as they are                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

**The schema check needs decorators.** It builds a `DataSource` of every entity in
`@acme-core/entities` with `SnakeNamingStrategy`, and expects
`driver.createSchemaBuilder().log()` to return no `upQueries`. The TypeORM CLI cannot do it under
plain `node`, which has no decorators.

**A token of the other app is signed in the case.** Each suite boots one app, and the lint keeps
the `AppModule` of the other app out of its tests. The auth cases of each app build a
`JwtService` over the `JWT_SECRET` of the other app's e2e setup and expect 401, and they also sign
a subject of the other app with the secret of this one: one case for the secret, one for the
table.

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
