# 029 — Naming

A name says who or where; the action lives in the method or in the port.

| Element                      | Name                                                                        | Example                                                       |
| ---------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| port of a core or lib module | `I<Module><Layer>Port`, `<MODULE>_<LAYER>_PORT`, `<module>-<layer>.port.ts` | `IIdempotencyCorePort`, `IDEMPOTENCY_CORE_PORT`               |
| facade of that module        | `<Module><Layer>Facade`, `<module>-<layer>.facade.ts`                       | `IdempotencyCoreFacade`                                       |
| facade method                | `handle<Action>`                                                            | `handleClaim`, `handleSignAccessToken`                        |
| use case held by a facade    | `<action>`, without the context                                             | `claim: IdempotencyCoreClaimUseCase`                          |
| domain exception codes       | `<Context>ExceptionCodeEnum`, `<context>-exception-code.enum.ts`            | `OrderExceptionCodeEnum`                                      |
| queue adapter                | `<Context><Target>QueueAdapter`, `<context>-<target>-queue.adapter.ts`      | `OrderLedgerQueueAdapter` implements `IOrderLedgerRecordPort` |
| commands of a service        | one file `<context>-<service>.command.ts`                                   | `product-ledger.command.ts` for `ProductLedgerService`        |
| token of a config value      | `<MODULE>_<PROPERTY>_TOKEN`, `<module>-<property>.token.ts`                 | `ORDER_REDIS_COMMAND_TIMEOUT_MS_TOKEN`                        |

**A module with one port names it after the module.** The port, its token and its facade carry the
name of the module and its layer (`Core`, `Lib`, `Common`) and nothing else, so a consumer finds the
facade of `@acme-core/contracts/idempotency` under `IdempotencyCoreFacade` without knowing what
the module stores.

**A facade method is `handle<Action>`, its use case is `<action>`.** The facade forwards each method
to one use case. The field that holds the use case takes the action alone, because its type already
names the context: `CredentialsLibSignAccessTokenUseCase` is `signAccessToken`, not
`credentialsLibSignAccessToken`. The prefix `handle` keeps the method apart from that field, so
`handleSignAccessToken` calls `this.signAccessToken.execute(command)` in the same class. Where the
method and the use case name the action differently, each keeps its own: `handleReadiness` calls
`checkReadiness`, `handleValidate` calls `validateSubject`.

**Exception codes are named after the exceptions.** The enum lists the values of `code` on the
`<Context>BaseException` subclasses of a module and the exception filter maps them to HTTP statuses,
so the enum takes the word `Exception`, not `Error`. `IdentityExceptionCodeEnum` in `libs/kernel`
serves the identity exceptions of several apps the same way.

**A queue adapter is named by where it sends, the port by what it does.** The adapter is transport
to a target, the ledger here, so `OrderLedgerQueueAdapter` drops the action. The outbound port it
implements keeps the action: `IOrderLedgerRecordPort`, `ORDER_LEDGER_RECORD_PORT`. A target with a
compound name keeps it whole: `ProductStockCorePostSubtractQueueAdapter` sends to the
post-subtract queue.

**The commands of a service live in one file named after the service.** A service of
`application/services` takes its commands from
`application/interfaces/commands/<context>-<service>.command.ts`, next to
`<context>-<service>.service.ts`. Two commands of one service share the file, as
`IProductLedgerRecordCommand` and `IProductLedgerRecordCreatedCommand` do in
`product-ledger.command.ts`. The interfaces keep the names of what they carry; only the file follows
the service. A use case keeps one command file of its own, `<context>-<verb>.command.ts`.

**A config token is the module, the property and `_TOKEN`.** A token that carries a value read with
`ConfigValueProvider.provide` takes the prefix of its module, the name of the configuration
property it reads and the suffix `_TOKEN`: the order module reads `REDIS_COMMAND_TIMEOUT_MS` into
`ORDER_REDIS_COMMAND_TIMEOUT_MS_TOKEN`, the product-stock core module reads `QUEUE_RETRY_ATTEMPTS`
into `PRODUCT_STOCK_CORE_QUEUE_RETRY_ATTEMPTS_TOKEN`. The token names where the value comes from,
not what the module does with it, so a reader finds the variable of `.env` by the name alone. A
property that already starts with the module name is not repeated: `IDEMPOTENCY_KEY_TTL_HOURS`
becomes `IDEMPOTENCY_KEY_TTL_HOURS_TOKEN`. The suffix sets the token apart from the `_PORT` tokens
in the same `outbound` barrel. The description of the `Symbol` repeats the constant, and the file
drops the suffix: `order-redis-command-timeout-ms.token.ts`.
