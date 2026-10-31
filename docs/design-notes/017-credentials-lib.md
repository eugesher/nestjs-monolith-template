# 017 — Credentials lib

Password hashing and token signing are used by both HTTP apps, so they live in a lib.

| Port                               | Adapter                            | Reads                                                                         |
| ---------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| `CREDENTIALS_PASSWORD_HASHER_PORT` | `CredentialsPasswordHasherAdapter` | `AUTH_ARGON2_MEMORY_COST`, `AUTH_ARGON2_PARALLELISM`, `AUTH_ARGON2_TIME_COST` |
| `CREDENTIALS_ACCESS_TOKEN_PORT`    | `CredentialsAccessTokenAdapter`    | `JWT_SECRET`, `JWT_EXPIRES_IN`                                                |

The ports are in `libs/contracts/src/credentials`, the adapters and `CredentialsLibModule` in
`libs/credentials`.

**The lib reads the config of the app it runs in.** `CredentialsLibModule` takes the values from
`ConfigService`, as `libs/cache` does, so the features bind no config tokens of their own, and each
app signs with its own secret.

**The signer signs the subject alone.** `sign({ sub })` passes only `sub` to the JWT library, so a
caller that hands it a wider object cannot widen the token.

**Features use the lib like any lib.** The module root imports `CredentialsLibModule`, the
application injects the ports, and no feature imports `argon2` or `@nestjs/jwt`. Example:
`apps/customer-app/src/features/auth/application/use-cases/auth-register.use-case.ts`. Verifying a
token stays in `libs/auth`: signing and verifying meet only in `JWT_SECRET`.

## One model per module over one table

Modules that read the same table keep models of their own, narrowed to what each uses (see
`024-code-placement.md`). Example: `AuthStaffUserModel`
(`apps/staff-app/src/features/identity/modules/auth/domain/models`), `UserStaffUserModel`
(`apps/staff-app/src/features/identity/modules/user/domain/models`) and `AuthCommonStaffUserModel`
(`apps/staff-app/src/common/modules/auth/domain/models`) all map `staff_user`.

## A common module for a method of two modules

`validateSubject` is called by a feature and by a global module of staff-app, so it lives in
`apps/staff-app/src/common/modules/auth` behind `AUTH_COMMON_PORT`
(`apps/staff-app/src/contracts/auth`). The feature reaches it through
`AuthIdentityCommonAdapter`, the global module through `AuthGlobalSubjectCommonAdapter`.

## Table naming

Tables of one module share a prefix, and indexes and foreign keys repeat the table name, so a
constraint error in a log points at the module at once. A prefix also avoids reserved words such as
`user`. Examples: the entities of `core/entities/src/staff-identity/`.
