# 034 — ORM lib

The connection of an app and the repositories its modules read through live in `libs/database`:

| Part          | Entry                         | What it gives the app                                              |
| ------------- | ----------------------------- | ------------------------------------------------------------------ |
| `orm/`        | `OrmModule.forRoot(entities)` | the TypeORM connection, the transactions, global `ORM_PORT`        |
| `repository/` | `HostedRepository`            | the repository a module gets: TypeORM `Repository` and `insertOne` |
| `naming/`     | `SnakeNamingStrategy`         | snake_case names of tables and columns, for the app and its e2e    |

`AppModule` hands `OrmModule.forRoot` the entities of `app/entities` and nothing else (see
`012-app-bootstrap.md`).

## `orm/`

The part has the shape of `libs/cache` (see `010-cache-aside.md`):

| Layer            | What it holds                           |
| ---------------- | --------------------------------------- |
| `shell`          | `OrmModule`, `OrmFacade`                |
| `application`    | `OrmGetRepositoryUseCase`               |
| `outbound`       | `ORM_HOST_PORT`                         |
| `infrastructure` | `OrmHostAdapter` over `TransactionHost` |

`forRoot(entities)` returns a global module that binds `OrmFacade` under `ORM_PORT` and imports the
connection from the private `forRootAsync(entities)`, which returns `TypeOrmModule.forRootAsync`
with the options built from `DATABASE_URL` and `DATABASE_LOGGING`: MySQL, no `synchronize`,
`timezone: 'Z'`, `dateStrings: ['DATE']` (see `010-cache-aside.md`), `utf8mb4` and
`SnakeNamingStrategy`.

**The adapter answers the raw repository, the use case shapes it.** `OrmHostAdapter` answers
`TransactionHost.tx.getRepository(entity)`, the TypeORM repository bound to the manager and the
query runner of the current transaction, or of no transaction outside `TRANSACTION_PORT.run`.
`OrmGetRepositoryUseCase` wraps it into a `HostedRepository` over the same target, manager and query
runner. Everything that names `@nestjs-cls` stays in the adapter, and what a module may call on a
repository is decided in the application.

**The repository is read on every call.** A persistence host takes `orm.getRepository(<Entity>)` in
a getter, never in its constructor, so every query joins the transaction open at that moment (see
`026-transaction-port.md`). The wrapper is built anew on every call and holds no state of its own.

## `OrmModule` mounts the transactions

`OrmHostAdapter` needs `TransactionHost`, which only the plugin of `LocalStorageTransactionModule`
provides, and the plugin needs the `DataSource` of the connection. `OrmModule.forRoot` imports
`LocalStorageTransactionModule.forRoot()` itself, so an app cannot mount the connection without the
transactions, and the order is set by the import, not by the `AppModule` of each app. The root
`ClsModule` stays with the app: `LocalStorageSetupModule` comes before `OrmModule` (see
`033-local-storage-lib.md`).

The edge goes one way: `libs/database` may import `libs/local-storage`, and `libs/local-storage` may
not import `libs/database`.

## The contract

```ts
interface IOrmPort {
  getRepository<Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>,
  ): IHostedRepository<Entity>;
}
```

`ORM_PORT` and `IHostedRepository` live in `@acme-libs/contracts/database`, the only contracts that
may import `typeorm`. A repository injects the port and reads through it:

```ts
@Inject(ORM_PORT)
protected readonly orm: IOrmPort,
```

The port exposes `getRepository` alone, so a repository can neither open a transaction nor reach the
`DataSource`.

## Who sees the lib

| Importer                                | Uses                                       |
| --------------------------------------- | ------------------------------------------ |
| `app.module.ts`                         | `OrmModule.forRoot(entities)`              |
| infrastructure of the apps and the core | `ORM_PORT`, `IHostedRepository`            |
| `test/` of staff-app                    | `SnakeNamingStrategy` for the schema check |

Infrastructure takes the contracts, never the lib (see `016-lint-allowlists.md`). The lib itself
sees `libs/local-storage`, `@nestjs/common`, `@nestjs/config`, `@nestjs/typeorm`, `typeorm` and the
transactional packages of `nestjs-cls`.
