# 14 — E2E infrastructure

The e2e suites run against a real MySQL and a real Redis, started by `docker-compose/test`. The
development stack in the root `docker-compose.yml` uses other host ports, so a dev server never
attaches to the test infrastructure.

|              | Development                           | Tests                                           |
| ------------ | ------------------------------------- | ----------------------------------------------- |
| Compose file | `docker-compose.yml`                  | `docker-compose/test/docker-compose.yml`        |
| Project      | `acme`                                | `acme-e2e`                                      |
| MySQL        | `localhost:3306`, `acme` / `acmepass` | `localhost:3307`, `root` / `root`               |
| Redis        | `localhost:6379`, no password         | `localhost:6380`, password `e2e-redis-password` |
| Data         | a named volume, kept                  | an anonymous volume, rebuilt on every `up`      |

## Scripts

| Script                                | What it does                                                         |
| ------------------------------------- | -------------------------------------------------------------------- |
| `test:e2e:infra:up`                   | builds and starts MySQL, Redis and the `node` container, attached    |
| `test:e2e:infra:down`                 | removes the containers and their volumes                             |
| `test:e2e:infra:reload`               | `down`, then `up`                                                    |
| `test:e2e:infra:reseed`               | resets the data of running infrastructure, see below                 |
| `test:e2e:seed`                       | loads the seed files into `DATABASE_URL`                             |
| `test:e2e:staff`, `test:e2e:customer` | the e2e suite of one app, `--runInBand --ci`, see `15-e2e-suites.md` |

**`up` is attached.** The containers live as long as the command. The `node` container waits for
healthy MySQL and Redis, runs `migration:run` and `test:e2e:seed`, and stops with `Exited (0)`:
that exit is the signal that the infrastructure is ready.

**`reseed` resets running infrastructure in seconds.** It drops and creates `acme_db`, flushes
Redis with its password, runs the migrations and the seed from the host. It talks to the containers
with `docker exec` by container name, so it needs `up` to be running. Each e2e run starts from a
reseed; the final run of a change starts from a reload.

## Seeds

`docker-compose/test/seed/data/<table>.sql` holds the rows of one table:

- one `INSERT`, the rows sorted by primary key;
- every row states its primary key, nothing relies on `AUTO_INCREMENT`;
- `DEFAULT` for a column some rows leave out;
- no comments.

`seed/index.ts` runs the files in name order on one `QueryRunner` between
`SET FOREIGN_KEY_CHECKS = 0` and `= 1`, so the files need no order among themselves. Then it
reads every foreign key of the seeded tables from `information_schema.KEY_COLUMN_USAGE` and counts
the rows whose parent is missing. An orphan stops the seed with exit code 1:

```text
Seed failed: Seeded rows break foreign keys:
fk_note_revision_note: 1 note_revision row(s) with (note_id) missing in note
```

**The seed runs under plain `node`**, like the migrations: `docker-compose/` has its own
`package.json` with `"type": "module"` and a `tsconfig.json` with `verbatimModuleSyntax`.
It imports no project code, only `fs`, `path`, `joi` and `typeorm`. It reads `DATABASE_URL` from
the environment of the process and never from an env file, so it cannot seed the development
database by accident. To seed it on purpose:

```bash
DATABASE_URL=mysql://acme:acmepass@localhost:3306/acme_db yarn test:e2e:seed
```

### Seeded accounts

Staff, in `staff_user.sql`:

| Id                                     | Email                  | Password                          | Role             |
| -------------------------------------- | ---------------------- | --------------------------------- | ---------------- |
| `00000000-0000-4000-8000-000000000001` | `admin@example.com`    | `admin-password-please-change`    | admin            |
| `00000000-0000-4000-8000-000000000002` | `editor@example.com`   | `editor-password-please-change`   | editor           |
| `00000000-0000-4000-8000-000000000003` | `viewer@example.com`   | `viewer-password-please-change`   | viewer           |
| `00000000-0000-4000-8000-000000000004` | `disabled@example.com` | `disabled-password-please-change` | viewer, disabled |

Customers, in `customer.sql`:

| Id                                     | Email               | Password                       | Status   |
| -------------------------------------- | ------------------- | ------------------------------ | -------- |
| `00000000-0000-4000-8000-000000000101` | `ann@example.com`   | `ann-password-please-change`   | active   |
| `00000000-0000-4000-8000-000000000102` | `bob@example.com`   | `bob-password-please-change`   | active   |
| `00000000-0000-4000-8000-000000000103` | `carol@example.com` | `carol-password-please-change` | active   |
| `00000000-0000-4000-8000-000000000104` | `dora@example.com`  | `dora-password-please-change`  | disabled |

The hashes are argon2id with the cost parameters of the app env examples. Roles get the ids of their
order in `RoleEnum`. Permission ids are stable: a code dropped from `PermissionCodeEnum` leaves its
id unused, so the product codes keep 7 to 9. The products belong to the catalog and have no owner.
Product 100 has 8 units on hand and product 106 is sold out: ann ordered its last unit. Ann and bob
own one order each, so every order case has an order of another customer to be refused.
The reminders belong to staff users: editor owns one reminder and admin most of them, so every case
has a record of another staff user to be refused. Every note belongs to admin, so viewer, who owns
none, is the other staff user of the note cases.

### Id ranges

Each feature takes its fixture ids from its own range, so a fixture added for one feature never
shifts the rows another feature's tests read. A row created by a test gets the next
`AUTO_INCREMENT` value after the highest seeded id, and tests find it through `MAX(id)` read before
the call, never by a literal.

| Feature     | Tables                           | Range                                                     |
| ----------- | -------------------------------- | --------------------------------------------------------- |
| identity    | `staff_role`, `staff_permission` | 1–99                                                      |
| identity    | `staff_user`                     | `00000000-0000-4000-8000-000000000001` to `…000000000099` |
| identity    | `customer`                       | `00000000-0000-4000-8000-000000000101` to `…000000000199` |
| product     | `product`                        | 100–199                                                   |
| note        | `note`, `note_revision`          | 200–299                                                   |
| reminder    | `reminder`                       | 300–399                                                   |
| ledger      | `ledger_entry`                   | 400–499                                                   |
| idempotency | `idempotency_key`                | 500–599                                                   |
| order       | `order`, `order_product`         | 600–699                                                   |
| stock       | `product_stock`                  | 700–799                                                   |

## Images

The app image is built from the root `Dockerfile` with the build argument `APP_NAME`: the same
image recipe serves both deployables. The builder installs every dependency, builds the app and
then keeps only the production dependencies with `yarn workspaces focus --all --production`. The
runtime stage copies `node_modules` and `dist/apps/<app>/` and runs as the `node` user with
`NODE_ENV=production`.

Because the image has no dev dependencies, it has no `pino-pretty`: the root compose runs both apps
with `NODE_ENV=production`, JSON logs, and `API_USE_API_REFERENCE=true` for the reference page.

`docker-compose.observability.yml` adds Jaeger and an OpenTelemetry collector:

```bash
docker compose -f docker-compose.yml -f docker-compose.observability.yml up
```

The collector reads `docker-compose/observability/otel-collector-config.yaml` and forwards the
traces to Jaeger, whose UI is at `localhost:16686`. Tracing stays off until an app runs with
`OTEL_SDK_DISABLED=false`.
