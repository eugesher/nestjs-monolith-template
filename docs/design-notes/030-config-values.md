# 030 — Config values

A module reads a configuration value through a token of its own, and only `infrastructure/config`
binds that token to the configuration.

| Part     | Example                                                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------- |
| schema   | `apps/staff-app/src/app/setup/config/config-setup.module.ts`                                              |
| token    | `apps/staff-app/src/features/catalog/modules/product/outbound/tokens/product-occ-retry-attempts.token.ts` |
| provider | `apps/staff-app/src/features/catalog/modules/product/infrastructure/config/product-config.provider.ts`    |
| lib      | `ConfigValueProvider` in `libs/config/src/provider/config-value.provider.ts`                              |
| module   | `apps/staff-app/src/features/catalog/modules/product/product.module.ts`                                   |

```ts
export const ProductConfigOccRetryAttemptsProvider = ConfigValueProvider.provide({
  injectionToken: PRODUCT_OCC_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'OCC_RETRY_ATTEMPTS',
});
```

**The schema validates, the provider binds.** `ConfigSetupModule` of each app checks and converts
every variable with Joi, so `OCC_RETRY_ATTEMPTS` is already a number when it reaches
`ConfigService`. `ConfigValueProvider.provide` answers a plain `FactoryProvider` that reads the
property with `getOrThrow`.

**The lib lists the properties a module may read.** `IConfigValueProperties` of `libs/config` maps
each of them to the type its Joi schema produces, `LEDGER_RETRY_ATTEMPTS: number`. `configProperty`
takes only a key of that map, so a misspelled property fails the typecheck, and the provider takes
its type from the map instead of a type argument at each call. The map follows the schemas by hand,
in one place: a property a module starts to read is added to the map and to the schema of every app
that mounts the module. A property missing from the schema of an app fails that app before its first
test: each e2e suite compiles the whole `AppModule`, so every provider of a config value reads its
property with `getOrThrow` (see `014-e2e-suites.md`).

**The token belongs to the consumer.** The outbound layer declares the token, as it declares a port,
and only the application layer injects it. A use case or a service that calls a port hands the value
over in the command of the port: `ttlMs` of a cache read, `timeoutMs` of an enqueue. An adapter
takes no config value of its own, so one piece of infrastructure never feeds another, and the spec
of the use case shows which value reaches the port. Nothing outside `infrastructure/config` knows
which variable of `.env` feeds the token. The token is named after the module and the property (see
`029-naming.md`).

**One file per module binds its values.** `infrastructure/config/<module>-config.provider.ts`
exports one constant per value, `<Module>Config<Property>Provider`, and the barrel of
`infrastructure` exports the file. As in the token, a property that starts with the module name does
not repeat it: `IdempotencyConfigKeyTtlHoursProvider`. The module root lists the constants next to
the `provider` of its adapters (see `031-static-provider.md`) and so reaches neither `outbound` nor
the config lib.

**The options name what goes in.** `injectionToken` and `configProperty` keep the input apart from
the `FactoryProvider` that comes out, whose fields `provide`, `inject` and `useFactory` belong to
Nest.

**The provider is a literal, not a class.** A class with static `provide`, `inject` and `useFactory`
fields satisfies `FactoryProvider` too, because both TypeScript and Nest check the shape, but it
adds nothing over the literal and makes Nest scan its prototype for enhancers.

## Lint

`infrastructure/config` is a layer of its own in features, processors and core modules
(`categories/module-layers.mjs`, `categories/acme-core.mjs`). It may reach its own outbound and
`@acme-libs/config`, and nothing else, not even `@nestjs/common`. No other layer of a module and no
module root may import the config lib; the only other users are `app/setup/config` and the
observability lib.

## Tests

A spec next to each provider file checks that every constant binds its token and reads its property.
That `inject` holds `ConfigService` is checked once, by the spec of `ConfigValueProvider`, so the
module spec does not import `@nestjs/config`, which its layer may not reach.
