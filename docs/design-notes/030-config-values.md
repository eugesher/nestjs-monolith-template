# 030 — Config values

A module reads a configuration value through a token of its own, and only `infrastructure/config`
binds that token to the configuration.

| Part     | Example                                                                                     |
| -------- | ------------------------------------------------------------------------------------------- |
| schema   | `apps/customer-app/src/app/setup/config/config-setup.module.ts`                             |
| token    | `apps/customer-app/src/features/order/outbound/tokens/order-ledger-retry-attempts.token.ts` |
| provider | `apps/customer-app/src/features/order/infrastructure/config/order-config.provider.ts`       |
| lib      | `ConfigValueProvider` in `libs/config/src/provider/config-value.provider.ts`                |
| module   | `apps/customer-app/src/features/order/order.module.ts`                                      |

```ts
export const OrderConfigLedgerRetryAttemptsProvider = ConfigValueProvider.provide<number>({
  injectionToken: ORDER_LEDGER_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'LEDGER_RETRY_ATTEMPTS',
});
```

**The schema validates, the provider binds.** `ConfigSetupModule` of each app checks and converts
every variable with Joi, so `LEDGER_RETRY_ATTEMPTS` is already a number when it reaches
`ConfigService`. `ConfigValueProvider.provide<T>` answers a plain `FactoryProvider<T>` that reads
the property with `getOrThrow`. The type argument states what the schema produces; it checks
nothing, so it must follow the Joi type of the property.

**The token belongs to the consumer.** The outbound layer declares the token, as it declares a
port, and the adapter or use case that needs the value injects it. Nothing outside
`infrastructure/config` knows which variable of `.env` feeds the token. The token is named after
the module and the property (see `029-naming.md`).

**One file per module binds its values.** `infrastructure/config/<module>-config.provider.ts`
exports one constant per value, `<Module>Config<Property>Provider`, and the barrel of
`infrastructure` exports the file. As in the token, a property that starts with the module name does
not repeat it: `IdempotencyConfigKeyTtlHoursProvider`. The module root lists the constants next to
the `provider` of its adapters (see `031-static-provider.md`) and so reaches neither `outbound` nor
the config lib.

**The options name what goes in.** `injectionToken` and `configProperty` keep the input apart
from the `FactoryProvider` that comes out, whose fields `provide`, `inject` and `useFactory` belong
to Nest.

**The provider is a literal, not a class.** A class with static `provide`, `inject` and
`useFactory` fields satisfies `FactoryProvider` too, because both TypeScript and Nest check the
shape, but it adds nothing over the literal and makes Nest scan its prototype for enhancers.

## Lint

`infrastructure/config` is a layer of its own in features, processors and core modules
(`categories/module-layers.mjs`, `categories/acme-core.mjs`). It may reach its own outbound and
`@acme-libs/config`, and nothing else, not even `@nestjs/common`. No other layer of a module and no
module root may import the config lib; the only other users are `app/setup/config` and the
observability lib.

## Tests

A spec next to each provider file checks that every constant binds its token and reads its
property. That `inject` holds `ConfigService` is checked once, by the spec of `ConfigValueProvider`,
so the module spec does not import `@nestjs/config`, which its layer may not reach.
