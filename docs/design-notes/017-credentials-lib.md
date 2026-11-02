# 017 — Credentials lib

Password hashing and token signing are used by both HTTP apps, so they live in a lib.

The lib has the shape of `libs/health`: one port in `libs/contracts/src/credentials`,
`CREDENTIALS_LIB_PORT`, implemented by `CredentialsLibFacade`. The facade hands each method to a use
case, and the use cases reach the libraries through ports of the lib's own `outbound`:

| Facade method     | Use case                               | Adapter                               | Reads                                                                         |
| ----------------- | -------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| `signAccessToken` | `CredentialsLibSignAccessTokenUseCase` | `CredentialsLibAccessTokenAdapter`    | `JWT_SECRET`, `JWT_EXPIRES_IN`                                                |
| `hashPassword`    | `CredentialsLibHashPasswordUseCase`    | `CredentialsLibPasswordHasherAdapter` | `AUTH_ARGON2_MEMORY_COST`, `AUTH_ARGON2_PARALLELISM`, `AUTH_ARGON2_TIME_COST` |
| `verifyPassword`  | `CredentialsLibVerifyPasswordUseCase`  | `CredentialsLibPasswordHasherAdapter` | —                                                                             |

**The lib reads the config of the app it runs in.** `CredentialsLibModule` takes the values from
`ConfigService`, as `libs/cache` does, so the features bind no config tokens of their own, and each
app signs with its own secret.

**The signer signs the subject alone.** `signAccessToken({ sub })` passes only `sub` to the JWT
library, so a caller that hands it a wider object cannot widen the token.

**Features reach the lib through lib adapters.** The module root imports `CredentialsLibModule`;
the feature declares ports of its own (`AUTH_ACCESS_TOKEN_PORT`, `AUTH_PASSWORD_HASHER_PORT`) and
implements them in `infrastructure/lib-adapters` on top of `CREDENTIALS_LIB_PORT`, so no feature
imports `argon2` or `@nestjs/jwt` and the application never sees the lib. Example:
`apps/customer-app/src/features/auth/infrastructure/lib-adapters/auth-password-hasher-lib.adapter.ts`. Verifying a
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
`user`. Examples: the entities of `apps/staff-app/src/common/entities/staff-identity/`.
