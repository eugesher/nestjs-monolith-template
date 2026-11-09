# 013 — E2E infrastructure

`test/infra` starts one MySQL and one Redis for everything: a local run of the apps, the migrations
and the e2e suites. Only the config files differ: `.env` for a local run, a gitignored copy of
`.env.example`, and `.env.test` for the suites, which is in the repository. The root
`docker-compose.yml` is the production stack: it runs the built images over a MySQL and a Redis of
its own, on the standard ports.

|              | Root compose                                        | `test/infra`                                    |
| ------------ | --------------------------------------------------- | ----------------------------------------------- |
| Compose file | `docker-compose.yml`                                | `test/infra/docker-compose.yml`                 |
| Project      | `acme`                                              | `acme-e2e`                                      |
| MySQL        | `127.0.0.1:3306`, `acme` / `$MYSQL_PASSWORD`        | `localhost:3307`, `root` / `root`               |
| Redis        | `127.0.0.1:6379`, password `$REDIS_SERVER_PASSWORD` | `localhost:6380`, password `e2e-redis-password` |
| Data         | a named volume, kept                                | an anonymous volume, rebuilt on every `up`      |

## Scripts

| Script                                                      | What it does                                                          |
| ----------------------------------------------------------- | --------------------------------------------------------------------- |
| `test:e2e:infra:up`                                         | builds and starts MySQL, Redis and the `node` container, attached     |
| `test:e2e:infra:down`                                       | removes the containers and their volumes                              |
| `test:e2e:infra:reload`                                     | `down`, then `up`                                                     |
| `test:e2e:infra:reseed`                                     | resets the data of running infrastructure, see below                  |
| `test:e2e:seed`                                             | loads the seed files into the database of `env/migrations/.env.test`  |
| `test:e2e:staff`, `test:e2e:customer`, `test:e2e:processor` | the e2e suite of one app, `--runInBand --ci`, see `014-e2e-suites.md` |

**`up` is attached.** The containers live as long as the command. The `node` container waits for
healthy MySQL and Redis, runs `migration:run` and `test:e2e:seed`, and stops with `Exited (0)`: that
exit is the signal that the infrastructure is ready. Compose hands it `env/migrations/.env.test` as
an `env_file`, and it runs on the network of the host, so the address in that file works both there
and on the host.

**`reseed` resets running infrastructure in seconds.** It drops and creates `acme_db`, flushes Redis
with its password, runs the migrations and the seed from the host with `env/migrations/.env.test`.
It talks to the containers with `docker exec` by container name, so it needs `up` to be running.
Each e2e run starts from a reseed; the final run of a change starts from a reload.

## Seeds

`test/infra/seed/data/<table>.sql` holds the rows of one table:

- one `INSERT`, the rows sorted by primary key;
- every row states its primary key, nothing relies on `AUTO_INCREMENT`;
- `DEFAULT` for a column some rows leave out;
- no comments.

`seed/index.ts` runs the files in name order on one `QueryRunner` between
`SET FOREIGN_KEY_CHECKS = 0` and `= 1`, so the files need no order among themselves. Then it reads
every foreign key of the seeded tables from `information_schema.KEY_COLUMN_USAGE` and counts the
rows whose parent is missing. An orphan stops the seed with exit code 1:

```text
Seed failed: Seeded rows break foreign keys:
fk_note_revision_note: 1 note_revision row(s) with (note_id) missing in note
```

**The seed runs under plain `node`**, like the migrations: `test/` has its own `package.json` with
`"type": "module"` and a `tsconfig.json` with `verbatimModuleSyntax`. It imports no project code,
only `dotenv`, `fs`, `joi`, `path` and `typeorm`. It reads the `DATABASE_*` variables from
`env/migrations/.env.test`, over any variable of the process, so it cannot seed another database by
accident. `reseed` runs the migrations the same way, under `NODE_ENV=test`.

### Seeded accounts

The rows of each table are in `test/infra/seed/data/<table>.sql`, and the e2e contexts sign their
tokens for the seeded accounts (`apps/<app>/test/context/app-e2e.context.ts`). The password hashes
are argon2id with the cost parameters of the app env examples.

### Id ranges

Each table takes its fixture ids from its own range, so a fixture added to one table never shifts
the rows another feature's tests read. Unrelated tables may use one range. A row created by a test
gets the next `AUTO_INCREMENT` value after the highest seeded id, and tests find it through
`MAX(id)` read before the call, never by a literal.

| Feature  | Tables                   | Range   |
| -------- | ------------------------ | ------- |
| access   | `staff_role`             | 1–99    |
| access   | `staff_user`             | 1–99    |
| auth     | `customer`               | 101–199 |
| product  | `product`                | 100–199 |
| note     | `note`, `note_revision`  | 200–299 |
| reminder | `reminder`               | 300–399 |
| ledger   | `ledger_entry`           | 400–499 |
| tag      | `tag`                    | 300–399 |
| tag      | `subject_tag`            | 400–499 |
| order    | `order`, `order_product` | 600–699 |
| stock    | `product_stock`          | 700–799 |

## Images

The app image is built from the root `Dockerfile` with the build argument `APP_NAME`: the same image
recipe serves all three deployables. The builder installs every dependency, builds the app and then
keeps only the production dependencies with `yarn workspaces focus --all --production`. The runtime
stage copies `node_modules` and `dist/apps/<app>/` and runs as the `node` user with
`NODE_ENV=production`.

The target `migrations` of the same `Dockerfile` holds `migrations/` and the production dependencies
and runs `migration:run` once and also holds `scripts/node/admin-create.ts`, which creates the first
administrator from `ADMIN_EMAIL` and `ADMIN_PASSWORD` of `env/migrations/.env`; the root compose
starts the apps after it has exited with code 0.

Because the image has no dev dependencies, it has no `pino-pretty`, so the image sets
`NODE_ENV=production` and logs JSON. The root compose takes the passwords of MySQL and Redis from
`env/compose/.env` through `--env-file`, so they stay out of the shell history. It mounts
`env/apps/<app>/.env` into each app and `env/migrations/.env` into the migrations, and `README.md`
lists the values to set there.

`docker-compose.observability.yml` adds Jaeger and an OpenTelemetry collector:

```bash
docker compose -f docker-compose.yml -f docker-compose.observability.yml up
```

The collector reads `opentelemetry-collector.config.yaml` and forwards the traces to Jaeger, whose
UI is at `localhost:16686`. Tracing stays off until an app runs with `OTEL_SDK_DISABLED=false`.
`test/infra` starts the same Jaeger and collector on `localhost:16687` and OTLP ports 4319 and 4320
for a local run, whose `.env` turns tracing on; `.env.test` keeps it off.
