# nestjs-monolith-template

Three NestJS apps over one MySQL and one Redis: `staff-app` (port 3001), `customer-app` (port 3000)
and `processor-app` (port 3002).

## Prerequisites

- Node 26
- Docker with Compose

```bash
npm install --global corepack # CI and the Dockerfile pin 0.36.0
corepack enable
```

Then install the dependencies:

```bash
yarn install
```

## Environment files

One infrastructure serves a local run, the migrations and the e2e suites; only the config files
differ. Each `.env.example` in `env/` holds everything needed to connect to that infrastructure and
run the system; a local run uses gitignored copies of them, and the `.env.test` files are in the
repository. There are no default values: a missing or invalid variable stops the process with a
validation error.

| File                       | Read by                                               |
| -------------------------- | ----------------------------------------------------- |
| `env/apps/<app>/.env`      | the app, on `yarn start:dev`                          |
| `env/apps/<app>/.env.test` | the e2e and system suites of the app                  |
| `env/migrations/.env`      | `yarn migration:*`                                    |
| `env/migrations/.env.test` | the migrations and the seed of the e2e infrastructure |

## Infrastructure

Start MySQL and Redis. The command prints the logs of every container and returns once they are
ready, with an empty database. The containers keep running in the background:

```bash
yarn test:e2e:infra:up
```

To remove the containers and their data:

```bash
yarn test:e2e:infra:down
```

## Run locally

Create the env files of the apps and the migrations:

```bash
cp env/apps/staff-app/.env.example env/apps/staff-app/.env
```

```bash
cp env/apps/customer-app/.env.example env/apps/customer-app/.env
```

```bash
cp env/apps/processor-app/.env.example env/apps/processor-app/.env
```

```bash
cp env/migrations/.env.example env/migrations/.env
```

With the infrastructure running, create the schema and load the seed data once:

```bash
yarn migration:run
```

```bash
yarn test:e2e:infra:seed
```

Then start the three apps in watch mode:

```bash
yarn start:dev
```

Traces of the local run are at <http://localhost:16687>: the infrastructure includes Jaeger and an
OpenTelemetry collector.

To start one app, use `yarn start:dev:staff-app`, `yarn start:dev:customer-app` or
`yarn start:dev:processor-app`. To apply new migrations to the database of `env/migrations/.env`:

```bash
yarn migration:run
```

## Run the e2e tests

Rebuild the infrastructure and run every suite one after another, with one report at the end. CI
runs the same command:

```bash
yarn test:e2e
```

With the infrastructure running, `yarn test:e2e:run` runs the same suites without the rebuild. To
run one suite, use its script: it resets the data first, because the cases write to the fixtures:

```bash
yarn test:e2e:staff
```

The suites are `test:e2e:staff`, `test:e2e:customer`, `test:e2e:processor`, and the system suites
`test:e2e:system:staff` and `test:e2e:system:customer`, which start an API app together with
`processor-app`. Each has a `:run` variant, such as `test:e2e:staff:run`, that skips the reset.

A local run and the e2e suites share the database, so a reset also drops what a local run wrote.

## Run in production

The root `docker-compose.yml` builds the images, starts MySQL and Redis, applies the migrations and
starts the three apps. The apps and the migrations read the `.env` files of `env/`, mounted
read-only into their containers.

Create the env files:

```bash
cp env/apps/staff-app/.env.example env/apps/staff-app/.env
```

```bash
cp env/apps/customer-app/.env.example env/apps/customer-app/.env
```

```bash
cp env/apps/processor-app/.env.example env/apps/processor-app/.env
```

```bash
cp env/migrations/.env.example env/migrations/.env
```

Replace these values in the three app files:

| Variable                      | Value                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                    | `production`                                                                                      |
| `API_USE_API_REFERENCE`       | `false`                                                                                           |
| `DATABASE_HOST`               | `mysql`                                                                                           |
| `DATABASE_PORT`               | `3306`                                                                                            |
| `DATABASE_USER`               | `acme`                                                                                            |
| `DATABASE_PASSWORD`           | the value of `MYSQL_PASSWORD`                                                                     |
| `REDIS_HOST`                  | `redis`                                                                                           |
| `REDIS_PORT`                  | `6379`                                                                                            |
| `REDIS_PASSWORD`              | the value of `REDIS_SERVER_PASSWORD`                                                              |
| `JWT_SECRET`                  | 32 characters or more: one secret for `staff-app` and `processor-app`, another for `customer-app` |
| `OTEL_SDK_DISABLED`           | `false`                                                                                           |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://otel-collector:4318`                                                                      |
| `OTEL_RESOURCE_ATTRIBUTES`    | `deployment.environment=production`                                                               |

Behind a load balancer or a reverse proxy, also set `HTTP_TRUST_PROXY_HOPS` to the number of proxies
in front of the apps: the request limits count per client address.

For a browser client served from another origin, list that origin in `HTTP_CORS_ORIGINS`, for
example `https://app.example.com`, or several separated by commas. Left empty, a browser refuses
every call from another origin.

In `env/migrations/.env`, set the `DATABASE_*` variables to the same values.

Create the file with the passwords of the database and Redis, and fill in its three values:

```bash
cp env/compose/.env.example env/compose/.env
```

Build and start everything. Every `docker compose` command of this stack takes this file:

```bash
docker compose --env-file env/compose/.env up --build --detach
```

The apps start once the `migrations` container has exited with code 0. Each app answers on
`GET /api/health` at port 3000 (`customer-app`), 3001 (`staff-app`) or 3002 (`processor-app`). MySQL
and Redis are published only on `127.0.0.1`, like Jaeger, whose traces are at
<http://127.0.0.1:16686>.

Create the first administrator once, after the migrations have run. The command creates the user and
the `admin` role with the `access-management` permission, and fails without changes if the email is
taken. Add `ADMIN_EMAIL` and `ADMIN_PASSWORD`, of 12 characters or more, to `env/migrations/.env`,
and run:

```bash
docker compose --env-file env/compose/.env run --rm migrations node ./scripts/node/admin-create.ts
```

Remove the two variables from the file afterwards. The administrator then creates the other roles
and users through `/api/access` of `staff-app`.

To build a single image, pass the app name, or the `migrations` target:

```bash
docker build --build-arg APP_NAME=staff-app --tag acme-staff-app .
```

```bash
docker build --target migrations --tag acme-migrations .
```

Run an app image with its env file mounted:

```bash
docker run --volume "$PWD/env/apps/staff-app/.env:/app/env/apps/staff-app/.env:ro" --publish 3001:3001 acme-staff-app
```
