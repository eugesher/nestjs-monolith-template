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
