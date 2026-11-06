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
| injection token of a value   | `<CONTEXT>_<SUBJECT>_TOKEN`, `<context>-<subject>.token.ts`                 | `ORDER_LEDGER_TIMEOUT_MS_TOKEN`                               |

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

**A value token ends in `_TOKEN` and names what it holds.** A token that carries a value rather than
a port, such as a timeout read from the configuration, takes the suffix `_TOKEN`, so it stands apart
from the `_PORT` tokens in the same `outbound` barrel. It names the subject without the action:
`IDEMPOTENCY_KEY_TTL_HOURS_TOKEN`, not `IDEMPOTENCY_PURGE_KEY_TTL_HOURS`, and
`ORDER_LEDGER_TIMEOUT_MS_TOKEN`, not `ORDER_LEDGER_RECORD_TIMEOUT_MS`. The description of the
`Symbol` repeats the constant, and the file drops the suffix: `order-ledger-timeout-ms.token.ts`.
