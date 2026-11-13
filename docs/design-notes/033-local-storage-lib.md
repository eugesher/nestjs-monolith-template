# 033 — Local storage lib

The CLS context of a request and the transactions that live in it are one mechanism, `nestjs-cls`,
so they live in one lib, `libs/local-storage`, in two parts:

| Part             | Entry                                       | What it gives the app                                                       |
| ---------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| `setup/`         | `LocalStorageSetupModule.forRoot()`         | the root `ClsModule`, the context of every request under its correlation id |
| `transactional/` | `LocalStorageTransactionalModule.forRoot()` | the transactional plugin, global `TRANSACTION_PORT`                         |

`AppModule` imports `LocalStorageSetupModule` before `OrmModule` of `libs/database`, and `OrmModule`
imports `LocalStorageTransactionalModule` (see `012-app-bootstrap.md`).

## `setup/`

`LocalStorageSetupModule` is a setup class, as `BullSetupModule` is (see `032-queue-lib.md`):
`forRoot()` returns `ClsModule.forRoot` with the options of the private static `options()`. The
middleware is mounted on every route and stores the id of `CorrelationIdHelper.resolve` under
`CLS_ID`, so the context and the pino request logger see one id. The helper stays in
`libs/observability`, which the lib imports: the logger needs it too.

## `transactional/`

The part has the shape of `libs/cache` (see `010-cache-aside.md`):

| Layer            | What it holds                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `shell`          | `LocalStorageTransactionalModule`, `LocalStorageTransactionalFacade`                                                       |
| `application`    | `LocalStorageTransactionalRunUseCase`, `LocalStorageTransactionalAfterCommitUseCase`                                       |
| `outbound`       | `LOCAL_STORAGE_TRANSACTIONAL_HOST_PORT`, `LOCAL_STORAGE_TRANSACTIONAL_CONTEXT_PORT`                                        |
| `infrastructure` | `LocalStorageTransactionalHostAdapter` over `TransactionHost`, `LocalStorageTransactionalContextAdapter` over `ClsService` |

`forRoot()` returns a global module that registers `ClsPluginTransactional` with the TypeORM adapter
through `ClsModule.registerPlugins` and exports `TRANSACTION_PORT`. It passes the plugin no
`imports`: the `DataSource` comes from the global `TypeOrmCoreModule` of `OrmModule`. What `run` and
`afterCommit` promise is in `026-transaction-port.md`.

**The contract keeps its names.** The port is `ITransactionPort` / `TRANSACTION_PORT` of
`@acme-libs/contracts/local-storage`, with `run` and `afterCommit`, not `<LIB>_LIB_PORT` with
`handle*` methods as `libs/cache` and `libs/credentials` have: fourteen use cases of the apps and
the core call it, and the names say what they do there.

## What stays in `libs/database`

`libs/database` holds the connection and `ORM_PORT` (see `034-orm-lib.md`). `OrmHostAdapter` takes
`TransactionHost` from the global module of the CLS plugins, so a repository joins the transaction
that `TRANSACTION_PORT.run` opened without importing this lib. Only the two libs import
`@nestjs-cls/transactional`.

**`OrmModule` mounts the transactions.** `OrmHostAdapter` needs `TransactionHost`, which only the
plugin of `LocalStorageTransactionalModule` provides, and the plugin needs the `DataSource` of
`OrmModule`. `OrmModule.forRoot` imports `LocalStorageTransactionalModule.forRoot()` itself, so an
app cannot mount the connection without the transactions; `libs/database` is the only lib that may
import `libs/local-storage`.

## Who sees the lib

| Importer                                  | Uses                                                              |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `app.module.ts`                           | `LocalStorageSetupModule.forRoot()`                               |
| `OrmModule` of `libs/database`            | `LocalStorageTransactionalModule.forRoot()`                       |
| `infrastructure` of the apps and the core | `TRANSACTION_PORT` from the contracts, in the transaction adapter |

No other layer or lib imports the lib or its contracts. The lib itself sees `libs/observability` and
the packages of CLS, the TypeORM adapter, `http` and `nestjs-pino` (see `016-lint-allowlists.md`).
