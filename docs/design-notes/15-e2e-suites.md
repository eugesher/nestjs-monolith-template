# 15 — E2E suites

Each app has one e2e suite that boots its `AppModule` against the infrastructure of
`14-e2e-infrastructure.md`. The suites keep only what unit specs cannot show: SQL, transactions,
the wiring of guards, pipes, filters and middleware, the cache, idempotency and in-process events.
Logic stays in the unit specs.

## Running

```bash
yarn test:e2e:infra:reseed && yarn test:e2e:staff
```

```bash
yarn test:e2e:infra:reseed && yarn test:e2e:customer
```

Each suite starts from a reseed: the cases write the fixtures, and a second run on the same data
fails. Both scripts pass `--ci`, so a run never writes a snapshot; a new or changed snapshot is
written by running Jest without it, then read before it is kept.

## Layout

```text
apps/<app>/test/
  jest-e2e.config.js
  jest-setup.js
  app/app.e2e-spec.ts
  app/__snapshots__/app.e2e-spec.ts.snap
  context/app-e2e.context.ts
  features/index.ts
  features/<feature>/<feature>.e2e.ts
```

**`app.e2e-spec.ts` is the only Jest entry.** The app boots once, in `beforeAll`. The entry holds
one `describe` per feature and calls the methods of the feature class inside it:

```ts
describe('Note', () => {
  noteE2E.handleGetMany();
  noteE2E.handleEdit();
});
```

The order of the calls is the order of the database states: the cases that read a whole list come
before the cases that write into it.

**A feature class has one public method per endpoint**, named after the controller method, and the
method wraps the `describe` of that endpoint. `ItemE2E.of(ctx)` builds it over the context. A
feature that needs a hook before each case has `hooks()`, as `ReminderE2E` flushes Redis.

**`AppE2EContext` mirrors `main.ts`.** `init()` compiles `AppModule` with `@nestjs/testing`, sets
the logger and the global prefix, and signs one access token for each seeded account with
`JWT_ACCESS_SECRET` from the config. Everything the cases read is a getter that throws before
`init()`. The customer-app context also holds the Redis client, through `@acme-libs/cache/testing`.

The shared Jest config lives in `jest/`:

| File                        | What it does                                                                    |
| --------------------------- | ------------------------------------------------------------------------------- |
| `jest-common.e2e.config.js` | the Jest config of one app: aliases from `tsconfig.json`, `TZ=America/New_York` |

**The environment comes from `apps/<app>/test/jest-setup.js` only.** It runs before any module
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

| App          | Feature  | Cases                                                                                                                                                                           |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| staff-app    | app      | the schema of every entity matches the migrated database; customer-app routes are not mounted                                                                                   |
| staff-app    | session  | login, refresh, `me`; claims in a token are ignored; refresh and access tokens are not interchangeable; a disabled user is refused                                              |
| staff-app    | iam      | roles from the database; a new user logs in at once; a revoked permission refuses the same token at once                                                                        |
| staff-app    | ledger   | a page of one subject; validation                                                                                                                                               |
| staff-app    | note     | filters and validation; an edit records a revision under the correlation id; a failed revision insert rolls the note back                                                       |
| customer-app | app      | staff-app routes are not mounted                                                                                                                                                |
| customer-app | session  | login, refresh, `me` through the filter of this app                                                                                                                             |
| customer-app | item     | owner scope; create with the idempotency key, the ledger entry and the correlation id; replay and reuse of a key; `If-Match`; concurrent renames; archive with one ledger entry |
| customer-app | reminder | the summary is cached and every write drops it; dates under `TZ`; ownership; soft delete                                                                                        |

**The schema check needs decorators.** It builds a `DataSource` of every entity in
`@acme-core/entities` with `SnakeNamingStrategy`, and expects
`driver.createSchemaBuilder().log()` to return no `upQueries`. The TypeORM CLI cannot do it under
plain `node`, which has no decorators.

**A token is shared because the secret is.** Each suite boots one app. Both apps verify a token
with the same `JWT_ACCESS_SECRET`, so a token of one app is valid in the other; the suites check
each app with tokens signed by that secret, not one app against the other.

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
