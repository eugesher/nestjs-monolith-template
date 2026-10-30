# 19 — Customer identity

`core/modules/src/customer-identity` owns the accounts of the people who buy: an email, a password
hash and a status. Its contract `core/contracts/src/customer-identity` has one port:

| Port                               | Facade                           | Consumer                              |
| ---------------------------------- | -------------------------------- | ------------------------------------- |
| `CUSTOMER_IDENTITY_CORE_AUTH_PORT` | `CustomerIdentityCoreAuthFacade` | sign-up, login, the global auth guard |

`register` creates an active customer with an argon2id hash and answers `{ id, email }`, `login`
checks the password and signs an access token, `validateSubject` answers `{ id, email }` of an
active customer. A customer signs up alone, so `register` sits on the auth port: there is no
admin port and no back office for customers (see `03-auth-feature.md`).

## Customers are not staff

**Two modules, not one with a type column.** A customer and a staff user differ in more than a
flag. Staff have roles and permissions, an admin port and a back office; a customer has none of
these and only ever sees their own records. One `user` table with a kind would make every query of
one kind filter out the other, and every lint rule about the admin port would need a second look at
which kind of user is behind it. Two modules keep each app's view of identity whole.

**A customer holds no roles or permissions.** Authorization in customer-app is ownership: a record
of a customer carries the id of its owner, and every query filters by the caller, as the reminders
of staff-app do (see `11-reminder-feature.md`). customer-app mounts `AuthLibModule` alone, so no
claim guard runs there (see `02-global-auth-guards.md`).

| Entity     | Table      | Keys                |
| ---------- | ---------- | ------------------- |
| `Customer` | `customer` | `uq_customer_email` |

The entity has no prefix: `customer` names its owner already, and it is not a reserved word.

## Who sees what

The lint policy `identity-modules.mjs` gives each identity module to one app:

| From         | May not import                                                                                |
| ------------ | --------------------------------------------------------------------------------------------- |
| customer-app | `@acme-core/contracts/staff-identity`, `@acme-core/modules/staff-identity`, `Staff*` entities |
| staff-app    | `@acme-core/contracts/customer-identity`, `@acme-core/modules/customer-identity`, `Customer`  |

The policy `customer-claims.mjs` keeps the claim machinery out of customer-app: `AuthClaimsLibModule`,
`@Roles`, `@RequiresPermission`, `AUTH_CLAIMS_PORT` and the kernel enums `RoleEnum` and
`PermissionCodeEnum`. `spec/architecture/core-modules.spec.ts` and
`spec/architecture/libs-by-layer.spec.ts` hold the cases in both directions.

**One file of staff-app registers `Customer`.** An order references its customer by a foreign key,
and TypeORM needs the target of every relation in the entity list of the connection. staff-app
reads orders, so `apps/staff-app/src/app/setup/orm/entities/index.ts` lists `Customer` next to
`Order`. The exception in `identity-modules.mjs` names that file alone and the `Customer` specifier
alone: no other file of staff-app may import the entity (see `20-order-and-stock-schema.md`).

## Shared credentials

**Code used by two core modules moves to a lib.** While one module hashed passwords and signed
tokens, adapters inside it were enough. With two, the argon2 adapter and the JWT signer live in
`libs/credentials`, behind two ports in `libs/contracts/src/credentials`:

| Port                               | Adapter                            | Reads                                                                         |
| ---------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| `CREDENTIALS_PASSWORD_HASHER_PORT` | `CredentialsPasswordHasherAdapter` | `AUTH_ARGON2_MEMORY_COST`, `AUTH_ARGON2_PARALLELISM`, `AUTH_ARGON2_TIME_COST` |
| `CREDENTIALS_ACCESS_TOKEN_PORT`    | `CredentialsAccessTokenAdapter`    | `JWT_SECRET`, `JWT_EXPIRES_IN`                                                |

**The lib reads the config of the app it runs in.** `CredentialsLibModule` takes the values from
`ConfigService`, as `libs/cache` does, so the core modules bind no config tokens of their own. The
same code signs with the secret of staff-app in one process and with the secret of customer-app in
the other.

**The signer signs the subject alone.** `sign({ sub })` passes only `sub` to the JWT library, so a
caller that hands it a wider object cannot widen the token.

**Core modules use the lib like any lib.** The module root imports `CredentialsLibModule`, the
application injects the ports, and the infrastructure of a core module no longer imports `argon2` or
`@nestjs/jwt`. Verifying a token stays in `libs/auth`: signing and verifying meet only in
`JWT_SECRET`.
