# 017 — Credentials lib

Password hashing and token signing are used by all three apps, so they live in a lib.

The lib has the shape of `libs/health`: one port in `libs/contracts/src/credentials`,
`CREDENTIALS_LIB_PORT`, implemented by `CredentialsLibFacade`. The facade hands each method to a use
case, and the use cases reach the libraries through ports of the lib's own `outbound`:

| Facade method           | Use case                               | Adapter                               | Reads                                                                                                                                        |
| ----------------------- | -------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `handleSignAccessToken` | `CredentialsLibSignAccessTokenUseCase` | `CredentialsLibAccessTokenAdapter`    | `JWT_SECRET`, `JWT_EXPIRES_IN`, the audience of `register()`                                                                                 |
| `handleHashPassword`    | `CredentialsLibHashPasswordUseCase`    | `CredentialsLibPasswordHasherAdapter` | `AUTH_ARGON2_MEMORY_COST`, `AUTH_ARGON2_PARALLELISM`, `AUTH_ARGON2_TIME_COST`, `AUTH_ARGON2_MAX_CONCURRENCY`, `AUTH_ARGON2_QUEUE_TIMEOUT_MS` |
| `handleVerifyPassword`  | `CredentialsLibVerifyPasswordUseCase`  | `CredentialsLibPasswordHasherAdapter` | `AUTH_ARGON2_MAX_CONCURRENCY`, `AUTH_ARGON2_QUEUE_TIMEOUT_MS`                                                                                |

**The lib reads the config of the app it runs in.** `CredentialsLibModule` takes the values from
`ConfigService`, as `libs/cache` does, so the features bind no config tokens of their own, and each
app signs with its own secret.

**The signer signs the subject alone.** `signAccessToken({ sub })` passes only `sub` to the JWT
library, so a caller that hands it a wider object cannot widen the token.

**The hasher runs a bounded number of hashes at once.** Each argon2id hash holds
`AUTH_ARGON2_MEMORY_COST` KiB, so a flood of logins from many addresses would grow the memory of the
process with every request. `CredentialsLibPasswordHasherAdapter` runs `hash` and `verify` through
`CredentialsLibPasswordHasherSemaphore`: at most `AUTH_ARGON2_MAX_CONCURRENCY` at a time, the others
wait in order. A call that waits longer than `AUTH_ARGON2_QUEUE_TIMEOUT_MS` leaves the queue with a
`ServiceUnavailableException`, a `503` that the shared `HttpExceptionFilter` logs as an error. The
semaphore lives in the adapter, so every caller of the lib shares one per process: login,
registration and the users that staff-app creates.

**A missing hash is checked against a dummy one.** `verify` takes `passwordHash: null` for a user
that does not exist. The adapter hashes a fixed dummy password with the same `AUTH_ARGON2_*` costs
when it is built and verifies the password against that hash, through the semaphore like any other
check, and answers `false` whatever the result. The caller pays one argon2id either way, so a login
for an unknown email takes as long as one with a wrong password.

**Features reach the lib through lib adapters.** The module root imports `CredentialsLibModule`; the
feature declares a port of its own (`AUTH_CREDENTIALS_PORT`) and implements it in
`infrastructure/lib-adapters` on top of `CREDENTIALS_LIB_PORT`, so no feature imports `argon2` or
`@nestjs/jwt` and the application never sees the lib. Example:
`apps/customer-app/src/features/auth/infrastructure/lib-adapters/auth-credentials-lib.adapter.ts`.
Verifying a token stays in `libs/auth`: signing and verifying meet only in `JWT_SECRET` and in
`AuthAudienceEnum`. A module imports the lib as `CredentialsLibModule.register(audience)`; the lib
signs `HS256` tokens with that `aud`.

## One model per module over one table

Modules that read the same table keep models of their own, narrowed to what each uses (see
`024-code-placement.md`). Example: `UserStaffUserModel`
(`apps/staff-app/src/features/access/modules/user/domain/models`), and `StaffAuthCoreSubjectModel`
and `StaffAuthCoreUserModel` (`core/modules/src/staff-auth/domain/models`) all map `staff_user`.

## A core module for the staff of two apps

staff-app and processor-app both sign the staff in and check the subject of every request, so both
live in `core/modules/src/staff-auth` behind `STAFF_AUTH_CORE_PORT`
(`core/contracts/src/staff-auth`): `handleFindSubject` for the guard and `GET /auth/me`,
`handleLogin` for the login. Each app reaches it through `AuthIdentityCoreAdapter` in its `auth`
feature and `AuthGlobalSubjectCoreAdapter` in its global module. The login checks the password and
signs the token behind `StaffAuthCoreCredentialsLibAdapter`, and `StaffAuthCoreModule` mounts
`CredentialsLibModule.register(AuthAudienceEnum.STAFF)`, so both apps sign the same staff token.
Only the lib adapter and the module root of a core module reach the credentials; its application
layer sees the port alone.

## Table naming

Tables of one module share a prefix, and indexes and foreign keys repeat the table name, so a
constraint error in a log points at the module at once. A prefix also avoids reserved words such as
`user`. Examples: the entities of `core/entities/src/staff-identity/`.
