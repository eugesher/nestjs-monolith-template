# 033 — Local storage lib

The CLS context of a request and the transactions that live in it are one mechanism, `nestjs-cls`,
so they live in one lib, `libs/local-storage`, in two parts:

| Part           | Entry                                     | What it gives the app                                                       |
| -------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| `setup/`       | `LocalStorageSetupModule.forRoot()`       | the root `ClsModule`, the context of every request under its correlation id |
| `transaction/` | `LocalStorageTransactionModule.forRoot()` | the transactional plugin, global `TRANSACTION_PORT`                         |

`AppModule` imports both, around the connection:
`LocalStorageSetupModule` → `TypeOrmSetupModule` → `LocalStorageTransactionModule` (see
`012-app-bootstrap.md`).

## `setup/`

`LocalStorageSetupModule` is a setup class, as `BullSetupModule` is (see `032-queue-lib.md`):
`forRoot()` returns `ClsModule.forRoot` with the options of the private static `options()`. The
middleware is mounted on every route and stores the id of `CorrelationIdHelper.resolve` under
`CLS_ID`, so the context and the pino request logger see one id. The helper stays in
`libs/observability`, which the lib imports: the logger needs it too.

## `transaction/`

The part has the shape of `libs/cache` (see `010-cache-aside.md`):

| Layer            | What it holds                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `shell`          | `LocalStorageTransactionModule`, `LocalStorageTransactionFacade`                                                       |
| `application`    | `LocalStorageTransactionRunUseCase`, `LocalStorageTransactionAfterCommitUseCase`                                       |
| `outbound`       | `LOCAL_STORAGE_TRANSACTION_HOST_PORT`, `LOCAL_STORAGE_TRANSACTION_CONTEXT_PORT`                                        |
| `infrastructure` | `LocalStorageTransactionHostAdapter` over `TransactionHost`, `LocalStorageTransactionContextAdapter` over `ClsService` |

`forRoot()` returns a global module that registers `ClsPluginTransactional` with the TypeORM adapter
through `ClsModule.registerPlugins` and exports `TRANSACTION_PORT`. It passes the plugin no
`imports`: the `DataSource` comes from the global `TypeOrmCoreModule` of `TypeOrmSetupModule`. What
`run` and `afterCommit` promise is in `026-transaction-port.md`.

**The contract keeps its names.** The port is `ITransactionPort` / `TRANSACTION_PORT` of
`@acme-libs/contracts/local-storage`, with `run` and `afterCommit`, not `<LIB>_LIB_PORT` with
`handle*` methods as `libs/cache` and `libs/credentials` have: twelve use cases of the apps and the
core call it, and the names say what they do there.

## What stays in `libs/database`

`libs/database` holds the connection and `REPOSITORY_HOST_PORT`. `RepositoryHostAdapter` takes
`TransactionHost` from the global module of the CLS plugins, so a repository joins the transaction
that `TRANSACTION_PORT.run` opened without importing this lib. Only the two libs import
`@nestjs-cls/transactional`.

## Who sees the lib

| Importer                               | Uses                                  |
| -------------------------------------- | ------------------------------------- |
| `app.module.ts`                        | both `forRoot()`                      |
| `application` of the apps and the core | `TRANSACTION_PORT` from the contracts |

No other layer imports the lib or its contracts. The lib itself sees `libs/observability` and the
packages of CLS, the TypeORM adapter, `http` and `nestjs-pino` (see `016-lint-allowlists.md`).
