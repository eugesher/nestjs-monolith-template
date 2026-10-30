# 19 — Customer identity

The accounts of the people who buy, an email, a password hash and a status, live in customer-app.
Each part sits with the only module that uses it (see `26-code-placement.md`):

| Part                   | Module            | Entry point                               |
| ---------------------- | ----------------- | ----------------------------------------- |
| sign-up and login      | `features/auth`   | `AuthRegisterUseCase`, `AuthLoginUseCase` |
| the subject of a token | `app/global/auth` | `AuthGlobalValidateSubjectUseCase`        |

Sign-up creates an active customer with an argon2id hash and answers `{ id, email }`, login checks
the password and signs an access token, and the global guard accepts a token only while its subject
is an active customer. No method serves two modules, so customer-app has no common module for its
customers. A customer signs up alone: there is no back office for customers (see
`03-auth-feature.md`).

## Customers are not staff

**Two sets of tables and code, not one with a type column.** A customer and a staff user differ in more than a
flag. Staff have roles and permissions, an admin port and a back office; a customer has none of
these and only ever sees their own records. One `user` table with a kind would make every query of
one kind filter out the other, and every lint rule about the admin port would need a second look at
which kind of user is behind it. Keeping them apart keeps each app's view of its users whole.

**A customer holds no roles or permissions.** Authorization in customer-app is ownership: a record
of a customer carries the id of its owner, and every query filters by the caller, as the reminders
of staff-app do (see `11-reminder-feature.md`). customer-app mounts `AuthLibModule` alone, so no
claim guard runs there (see `02-global-auth-guards.md`).

| Entity     | Table      | Keys                |
| ---------- | ---------- | ------------------- |
| `Customer` | `customer` | `uq_customer_email` |

The entity has no prefix: `customer` names its owner already, and it is not a reserved word.

## Who sees what

The lint policy `user-entities.mjs` gives the entities of each kind of user to one app:

| From         | May not import        |
| ------------ | --------------------- |
| customer-app | the `Staff*` entities |
| staff-app    | `Customer`            |

The code needs no rule of its own: an app may import only its own contracts and common modules, so
customer-app cannot reach `@acme-staff-contracts/auth` or `@acme-staff-common/modules/auth`.

The policy `customer-claims.mjs` keeps the claim machinery out of customer-app: `AuthClaimsLibModule`,
`@Roles`, `@RequiresPermission`, `AUTH_CLAIMS_PORT` and the kernel enums `RoleEnum` and
`PermissionCodeEnum`. `spec/architecture/common-modules.spec.ts` and
`spec/architecture/libs-by-layer.spec.ts` hold the cases in both directions.

**One file of staff-app registers `Customer`.** An order references its customer by a foreign key,
and TypeORM needs the target of every relation in the entity list of the connection. staff-app
reads orders, so `apps/staff-app/src/app/setup/orm/entities/index.ts` lists `Customer` next to
`Order`. The exception in `user-entities.mjs` names that file alone and the `Customer` specifier
alone: no other file of staff-app may import the entity (see `20-order-and-stock-schema.md`).

## Shared credentials

**Code used by both apps lives in a lib.** Staff and customers are hashed and signed by the same
code, so the argon2 adapter and the JWT signer live in
`libs/credentials`, behind two ports in `libs/contracts/src/credentials`:

| Port                               | Adapter                            | Reads                                                                         |
| ---------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| `CREDENTIALS_PASSWORD_HASHER_PORT` | `CredentialsPasswordHasherAdapter` | `AUTH_ARGON2_MEMORY_COST`, `AUTH_ARGON2_PARALLELISM`, `AUTH_ARGON2_TIME_COST` |
| `CREDENTIALS_ACCESS_TOKEN_PORT`    | `CredentialsAccessTokenAdapter`    | `JWT_SECRET`, `JWT_EXPIRES_IN`                                                |

**The lib reads the config of the app it runs in.** `CredentialsLibModule` takes the values from
`ConfigService`, as `libs/cache` does, so the features bind no config tokens of their own. The
same code signs with the secret of staff-app in one process and with the secret of customer-app in
the other.

**The signer signs the subject alone.** `sign({ sub })` passes only `sub` to the JWT library, so a
caller that hands it a wider object cannot widen the token.

**Features use the lib like any lib.** The module root imports `CredentialsLibModule`, the
application injects the ports, and no feature imports `argon2` or `@nestjs/jwt`. Verifying a token stays in `libs/auth`: signing and verifying meet only in
`JWT_SECRET`.
