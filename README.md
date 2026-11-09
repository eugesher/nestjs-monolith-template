# nestjs-monolith-template

Three NestJS apps over one MySQL and one Redis: `staff-app` (port 3001), `customer-app` (port 3000)
and `processor-app` (port 3002).

## Prerequisites

- Node 24, with Corepack enabled (`corepack enable`)
- Docker with Compose

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
| `env/apps/<app>/.env.test` | the e2e suite of the app                              |
| `env/migrations/.env`      | `yarn migration:*`                                    |
| `env/migrations/.env.test` | the migrations and the seed of the e2e infrastructure |

## Infrastructure

Start MySQL and Redis in a terminal of their own. The command stays attached, and the `node`
container exits with code 0 once the migrations and the seed have run:

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

With the infrastructure running, start the three apps in watch mode:

```bash
yarn start:dev
```

To start one app, use `yarn start:dev:staff-app`, `yarn start:dev:customer-app` or
`yarn start:dev:processor-app`. To apply new migrations to the database of `env/migrations/.env`:

```bash
yarn migration:run
```

## Run the e2e tests

With the infrastructure running, reset its data and run a suite. Every suite needs its own reset,
because the cases write to the fixtures:

```bash
yarn test:e2e:infra:reseed && yarn test:e2e:staff
```

```bash
yarn test:e2e:infra:reseed && yarn test:e2e:customer
```

```bash
yarn test:e2e:infra:reseed && yarn test:e2e:processor
```

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

| Variable                   | Value                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                 | `production`                                                                                      |
| `API_USE_API_REFERENCE`    | `false`                                                                                           |
| `DATABASE_HOST`            | `mysql`                                                                                           |
| `DATABASE_PORT`            | `3306`                                                                                            |
| `DATABASE_USER`            | `acme`                                                                                            |
| `DATABASE_PASSWORD`        | the value of `MYSQL_PASSWORD`                                                                     |
| `REDIS_HOST`               | `redis`                                                                                           |
| `REDIS_PORT`               | `6379`                                                                                            |
| `REDIS_PASSWORD`           | the value of `REDIS_SERVER_PASSWORD`                                                              |
| `JWT_SECRET`               | 32 characters or more: one secret for `staff-app` and `processor-app`, another for `customer-app` |
| `OTEL_RESOURCE_ATTRIBUTES` | `deployment.environment=production`                                                               |

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
and Redis are published only on `127.0.0.1`.

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
