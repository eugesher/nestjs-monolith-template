# 031 — Static provider

A class of `infrastructure/` binds itself to the port it implements, and the module root lists the
binding.

| Part    | Example                                                                                               |
| ------- | ----------------------------------------------------------------------------------------------------- |
| port    | `apps/customer-app/src/features/order/outbound/ports/order-idempotency.port.ts`                       |
| adapter | `apps/customer-app/src/features/order/infrastructure/core-adapters/order-idempotency-core.adapter.ts` |
| module  | `apps/customer-app/src/features/order/order.module.ts`                                                |

```ts
@Injectable()
export class OrderIdempotencyCoreAdapter implements IOrderIdempotencyPort {
  public static readonly provider: ClassProvider<IOrderIdempotencyPort> = {
    provide: ORDER_IDEMPOTENCY_PORT,
    useClass: OrderIdempotencyCoreAdapter,
  };
}
```

```ts
providers: [OrderGetManyRepository.provider, OrderIdempotencyCoreAdapter.provider],
```

**Every class of `infrastructure/` that implements a port carries the field**: repositories, core,
common and lib adapters, queue and cache adapters, and the adapters of `libs/cache`,
`libs/credentials` and `libs/health`. It is `public static readonly`, so no code can rebind the
class for the whole process, and it comes first in the class, before the private constants and the
constructor.

**The type argument checks the binding.** `ClassProvider<IOrderIdempotencyPort>` makes the compiler
check that `useClass` implements the port. A bare `{ provide, useClass }` in the module is a
`ClassProvider<any>`, so a token bound to the wrong class failed only when Nest resolved it.

**The binding lives with the implementation.** The class imports the token from the same `outbound`
barrel as its port, so the module root lists `X.provider` and does not import the token. Together
with the config values of `infrastructure/config` (see `030-config-values.md`), this leaves the
module root with no use of `outbound`, and lint no longer allows it.

**A decorated class may name itself in a static initializer.** TypeScript aliases a decorated class
and sets the alias in a static block that runs before the other static fields, so `useClass` is the
class and not `undefined`. The SWC build of rspack defines `provider` right after the class and
before the decorators run. `@Injectable()` returns the class it decorates, so the metadata of DI
lands on the object that `useClass` holds. A subclass, such as a queue adapter that extends
`SubjectLedgerQueueAdapter`, declares a field of its own; the base classes have none.

## Where the scheme stops

- **Facades** in `shell/` stay `{ provide: <MODULE>_<LAYER>_PORT, useClass: <Facade> }`. A facade is
  the public entry of a module, not an implementation of one of its outbound ports.
- **The facades of `libs/database` and `libs/local-storage`** (`OrmFacade`,
  `LocalStorageTransactionFacade`) are bound under the contract tokens `ORM_PORT` and
  `TRANSACTION_PORT` by `OrmModule` and `LocalStorageTransactionModule` of their libs, next to the
  TypeORM connection and the transactional plugin they need. The app picks the implementation by
  mounting `OrmModule`, which imports `LocalStorageTransactionModule`, and hands it only its
  entities.
- **Global enhancers** (`APP_PIPE`, `APP_FILTER`, `APP_GUARD`) are bound by the app module and the
  auth lib, under tokens of Nest.

## Lint

Core modules, common modules and processors take only DI names from `@nestjs/common`
(`policies/http-surface.mjs`). `ClassProvider` is one of them, next to `DynamicModule`, `Inject`,
`Injectable` and `Module`; it brings no HTTP surface.
