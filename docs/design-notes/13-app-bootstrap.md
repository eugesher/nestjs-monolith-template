# 13 — App bootstrap

admin-api and client-api are two deployables over one module graph: each has its own `main.ts`,
its own `AppModule` and its own port, and both read the same database, Redis and JWT secrets. A
token issued by one app is accepted by the other.

## main.ts

`main.ts` starts the process and nothing else:

1. `@acme-libs/observability/tracer` is the first import, so OpenTelemetry patches the modules
   before Nest loads them. Tracing starts only when `OTEL_SDK_DISABLED=false` is set in the
   environment of the process: `.env.local` is not loaded yet at that point.
2. `BootstrapLogger.setup(<app>)` gives a pino logger for the lines outside DI: `listening` and a
   failed start.
3. `NestFactory.create(AppModule, { bufferLogs: true })`, then `app.useLogger(app.get(Logger))`:
   Nest's own lines go through pino too, and the lines buffered before the logger existed are
   flushed through it.
4. The global prefix from `API_PREFIX`, `enableShutdownHooks`, the API reference and `listen` on
   `ADMIN_API_PORT` or `CLIENT_API_PORT`.

**Request behavior is registered in DI, never in `main.ts`.** The validation pipe, the exception
filters, the guards and the correlation middleware are all in `AppModule` or in modules it imports.
An e2e context built from `AppModule` without `main.ts` behaves like the running app.

`ApiReference.setup` builds the OpenAPI document and serves it at `/<prefix>/reference` when
`API_USE_API_REFERENCE` is true, which is the default outside production. It runs after
`setGlobalPrefix`, so the document lists the prefixed paths.

## AppModule

| Piece                              | Where                                                | What it does                                                |
| ---------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| `ConfigSetupModule.forRoot()`      | `app/setup/config`                                   | validates the environment of the app with Joi               |
| `LoggerSetupModule.forRoot(<app>)` | `libs/observability`                                 | pino, HTTP request logs                                     |
| `TypeOrmSetupModule.forRoot()`     | `app/setup/orm`                                      | the connection, the entities of the app, `TRANSACTION_PORT` |
| `ScheduleSetupModule`              | `app/setup/schedule`, client-api only                | `ScheduleModule.forRoot()` for `@Cron`                      |
| `CacheModule`, `EventsModule`      | `libs/cache`, `libs/messaging`                       | global `CACHE_PORT` and `EVENT_PUBLISHER_PORT`              |
| `AuthModule`                       | `app/global/auth`                                    | the three global guards                                     |
| features, processors               | `@acme-<app>-features`, `@acme-client-processors`    | the routes and the consumers                                |
| `APP_PIPE`                         | `StrictValidationPipe`                               | whitelist, forbid unknown properties, transform             |
| `APP_FILTER`                       | `HttpExceptionFilter`, `DuplicateKeyExceptionFilter` | the error body and its log                                  |
| `CorrelationMiddleware`            | every route, `*path`                                 | opens the correlation context of the request                |

Every module in `app/setup/` is named `*SetupModule`.

**The two global filters catch disjoint types**, `HttpException` and `QueryFailedError`, so their
order does not matter. A feature filter on a controller catches the domain exceptions of that
feature first and hands the response to `HttpExceptionFilter`.

**The correlation middleware and the request logger see one id.** Both call
`CorrelationIdHelper.resolve`, which takes the inbound `x-correlation-id`, or creates one and sets
it on the request and the response. Whichever runs first decides, and the other reads the same
header. Inside the request, `CorrelationContextHelper.current()` answers that id, so a ledger entry
written by the request carries the id the client got back.

The entity list of each app holds exactly the entities of the modules it mounts. admin-api has no
`Item`, client-api has no `Note`.

## Logs

Outside production, the `info` lines of `InstanceLoader`, `NestFactory`, `NestApplication`,
`RouterExplorer` and `RoutesResolver` are dropped by a pino `logMethod` hook in `LoggerSetupConfig`:
a start prints `listening` instead of one line per module and route. Their warnings and errors
still pass, and production keeps everything.

## Entry points

`@acme-admin-app` and `@acme-client-app` resolve to the FILE `app/app.module.ts`, not to a folder:
`app/` has no barrel next to the module. `main.ts` and the e2e context import `AppModule` by them.

Lint gives `app.module.ts` its own category, `acme-app:app:module`:

- only `main.ts` and `test/` of the same app may import it;
- `main.ts` sees nothing else of the app: not `setup/`, not `global/`;
- it may import `@nestjs/core` for `APP_PIPE` and `APP_FILTER`, and the rest of `app/` may not.

`main.ts` may also import the `database`, `kernel`, `observability` and `openapi` libs and
`nestjs-pino`.
