# 012 — App bootstrap

staff-app, customer-app and processor-app are three deployables over one module graph: each has its
own `main.ts`, its own `AppModule` and its own port, and all three read the same database and Redis.
staff-app and customer-app serve the HTTP API; processor-app serves the health probes, the staff
login and the failed jobs of its queues, and runs the queue processors and the schedules (see
`023-processor-app.md`).

## main.ts

`main.ts` starts the process and nothing else:

1. `@acme-libs/observability/tracer` is the first import, so OpenTelemetry patches the modules
   before Nest loads them. Tracing starts only when `OTEL_SDK_DISABLED=false` is set in the
   environment of the process: the env file of the app is not loaded yet at that point.
2. `BootstrapLogger.setup(<app>)` gives a pino logger for the lines outside DI: `listening` and a
   failed start.
3. `NestFactory.create(AppModule, { bufferLogs: true })`, then `app.useLogger(app.get(Logger))`:
   Nest's own lines go through pino too, and the lines buffered before the logger existed are
   flushed through it.
4. The global prefix from `API_PREFIX`, `enableShutdownHooks`, the API reference and `listen` on
   `PORT`.

## Environment

Each app has its own env file, and the migrations have theirs, all in `env/`:

| Example                               | Read by                            | Holds                                      |
| ------------------------------------- | ---------------------------------- | ------------------------------------------ |
| `env/apps/staff-app/.env.example`     | staff-app                          | every variable of the staff-app schema     |
| `env/apps/customer-app/.env.example`  | customer-app                       | every variable of the customer-app schema  |
| `env/apps/processor-app/.env.example` | processor-app                      | every variable of the processor-app schema |
| `env/migrations/.env.example`         | `migrations/config/data-source.ts` | the `DATABASE_*` variables only            |

A variable with the same meaning has the same name in every app: `PORT`, the `DATABASE_*` variables,
the JWT secrets. An example lists exactly the variables its schema reads and connects to the
infrastructure of `test/infra`, so a copy of it is all an app needs. A schema has no defaults: a
missing or invalid variable stops the app at boot, and a Redis without `REDIS_PASSWORD` is refused.

`ConfigSetupModule` loads `env/apps/<app>/.env`, or `env/apps/<app>/.env.test` under
`NODE_ENV=test`. Each file sits next to its example. `migrations/config/data-source.ts` chooses
between `env/migrations/.env` and `env/migrations/.env.test` the same way.

`EnvHelper.appEnvFilePaths` finds the paths from the repository root, the nearest directory up from
the code that holds `nest-cli.json`, so the app reads the same files from the sources and from the
bundle in `dist/`, whatever the working directory. A built image holds `nest-cli.json` as that
marker and gets `env/apps/<app>/.env` as a read-only mount, so the secrets stay out of its layers.
The variables of the process take precedence over `.env`; under `NODE_ENV=test` the `.env.test`
files take precedence over them (see `014-e2e-suites.md`).

**Request behavior is registered in DI, never in `main.ts`.** The validation pipe, the exception
filters, the guards and the correlation context are all in `AppModule` or in modules it imports. An
e2e context built from `AppModule` without `main.ts` behaves like the running app.

`ApiReference.setup` builds the OpenAPI document and serves it at `/<prefix>/reference` when
`API_USE_API_REFERENCE` is true. It runs after `setGlobalPrefix`, so the document lists the prefixed
paths.

## AppModule

| Piece                               | Where                                                | What it does                                                                                            |
| ----------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `ConfigSetupModule.forRoot()`       | `app/setup/config`                                   | validates the environment of the app with Joi                                                           |
| `LoggerSetupModule.forRoot(<app>)`  | `libs/observability`                                 | pino, HTTP request logs                                                                                 |
| `LocalStorageSetupModule.forRoot()` | `libs/local-storage`                                 | the CLS context of every request under its correlation id                                               |
| `OrmModule.forRoot(entities)`       | `libs/database`, the entities of `app/entities`      | the connection, the entities of the app, `ORM_PORT`, `TRANSACTION_PORT` (see `026-transaction-port.md`) |
| `ScheduleSetupModule`               | `app/setup/schedule`, processor-app only             | `ScheduleModule.forRoot()` for `@Cron`                                                                  |
| `BullSetupModule.forRoot()`         | `libs/queue`                                         | the Bull connection to Redis, the job options of every queue                                            |
| `CacheLibModule`                    | `libs/cache`                                         | global `CACHE_LIB_PORT`                                                                                 |
| `AuthGlobalModule`                  | `app/global/auth`                                    | the global guards: JWT, and permissions in a staff app                                                  |
| features, processors                | `@acme-<app>/features`, `@acme-processor/processors` | the routes and the processors                                                                           |
| `APP_PIPE`                          | `StrictValidationPipe`                               | whitelist, forbid unknown properties, transform                                                         |
| `APP_FILTER`                        | `HttpExceptionFilter`, `DuplicateKeyExceptionFilter` | the error body and its log; processor-app has only the first                                            |

Every module in `app/setup/` is named `*SetupModule`.

**The two global filters catch disjoint types**, `HttpException` and `QueryFailedError`, so their
order does not matter. A feature filter on a controller catches the domain exceptions of that
feature first and hands the response to `HttpExceptionFilter`.

**One CLS context carries the correlation id, the transaction and the logs.**
`LocalStorageSetupModule` of `libs/local-storage` is the root `ClsModule` of the app. Its middleware
is mounted on every route and opens the context with `run`, never with `enterWith`. It stores the id
under `CLS_ID`. `LocalStorageTransactionModule` of the same lib, which `OrmModule` imports, adds the
transactional plugin with `ClsModule.registerPlugins`, and `TRANSACTION_PORT.run` opens a nested
context with `ifNested: 'inherit'`, so the id stays inside the transaction. A queue job or a tick
has no request, so `CorrelationContextHelper.run` opens a context of its own
(`ifNested: 'override'`).

**The context and the request logger see one id.** Both call `CorrelationIdHelper.resolve`, which
takes the inbound `x-correlation-id`, or creates one and sets it on the request and the response.
Whichever runs first decides, and the other reads the same header. Inside the request,
`CorrelationContextHelper.current()` answers that id, so a ledger entry written by the request
carries the id the client got back. The pino `mixin` of `LoggerSetupConfig` adds the id of the CLS
context to every line, the `request completed` line of pino-http included.

The entity list of each app holds exactly the entities of the modules it mounts. customer-app has no
`Reminder` and no `LedgerEntry`: it writes to the ledger through the queue and mounts no core
ledger. It has `IdempotencyKey`, because the `order` feature mounts the core idempotency module. The
entity list of processor-app is in `023-processor-app.md`.

## Logs

Outside production, the `info` lines of `InstanceLoader`, `NestFactory`, `NestApplication`,
`RouterExplorer` and `RoutesResolver` are dropped by a pino `logMethod` hook in `LoggerSetupConfig`:
a start prints `listening` instead of one line per module and route. Their warnings and errors still
pass, and production keeps everything.

## Entry points

`main.ts` and the e2e context import `AppModule` by `@acme-<app>/app/app.module`. The alias
`@acme-<app>/app/*` maps the folder `app/`, which has no barrel, so the import names the file. The
alias resolves any path under `app/`; lint decides which of them a file may import.

Lint gives `app.module.ts` its own category, `acme-app:app:module`:

- only `main.ts` and `test/` of the same app may import it;
- `main.ts` sees nothing else of the app: not `setup/`, not `global/`;
- it may import `@nestjs/core` for `APP_PIPE` and `APP_FILTER`, and the rest of `app/` may not.

`main.ts` may also import the `database`, `kernel`, `observability` and `openapi` libs and
`nestjs-pino`.
