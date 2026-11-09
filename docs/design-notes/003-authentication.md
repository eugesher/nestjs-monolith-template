# 003 — Authentication

Login and token signing live in an `auth` feature of each app, and staff-app and customer-app also
read the current user there. `auth` also names the lib, its contract and the global module, so the
classes of the global module carry the `AuthGlobal` prefix (see `002-global-auth-guards.md`) and the
feature keeps the plain `Auth` prefix.

| App           | Feature                                |
| ------------- | -------------------------------------- |
| staff-app     | `apps/staff-app/src/features/auth`     |
| customer-app  | `apps/customer-app/src/features/auth`  |
| processor-app | `apps/processor-app/src/features/auth` |

## The full path, even for a thin feature

| Layer          | Example                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| presentation   | `presentation/controllers/auth.controller.ts`, `presentation/filters/auth-http-exception.filter.ts`                               |
| application    | `application/use-cases/auth-login.use-case.ts`                                                                                    |
| outbound       | `outbound/ports/auth-login-repository.port.ts`                                                                                    |
| infrastructure | `infrastructure/persistence/repositories/auth-login.repository.ts`, `infrastructure/lib-adapters/auth-credentials-lib.adapter.ts` |
| domain         | `domain/models/`, `domain/exceptions/base/auth-base.exception.ts`                                                                 |

**Login lives in the feature.** No other module logs anyone in, so the use case reads the user,
checks the password and signs the token itself (see `024-code-placement.md`).

**A route that only echoes the guard has no use case.** `handleMe` of customer-app copies
`@CurrentUser()` into the response DTO: `AuthJwtGuard` has already re-read the user. In staff-app
`AuthMeUseCase` asks the core module `staff-auth` through `AUTH_IDENTITY_PORT` and
`infrastructure/core-adapters/auth-identity-core.adapter.ts`.

## A unique index instead of a lookup

`AuthRegisterUseCase` of customer-app inserts at once through its repository and turns the
duplicate-key error of the driver into a domain error with `MysqlErrorHelper.isDuplicateKey`
(`libs/toolkit/src/database/mysql-error.helper.ts`). A lookup and an insert are two statements: two
concurrent requests would both pass the lookup, and the loser would hit the index as a 500.
`UserRegisterUseCase` of staff-app does the same, and the e2e of both apps sends two such requests
at once and expects one 201 and one 409.

## The feature filter delegates

`AuthHttpExceptionFilter` turns the code of `AuthBaseException` into an `HttpException` with the
body `{ statusCode, message, code }` and hands it to the shared `HttpExceptionFilter` of
`libs/http`. Logging, and masking of `password` in the logged request, stay in one place. The
feature module provides `HttpExceptionFilter` so that Nest can inject it into the feature filter.

## One token per audience

Each app signs and verifies with its `JWT_SECRET`. staff-app and processor-app share the secret and
customer-app has its own, so a token of customer-app is refused by the staff apps with 401, and the
other way round. Login carries `@Public()`; without it the global JWT guard would answer 401 before
the controller runs. The token carries only `sub`, `iat` and `exp`, and its lifetime is
`JWT_EXPIRES_IN`. Signing lives in `libs/credentials` (see `017-credentials-lib.md`).

**The lifetime does not delay revocation.** The guard re-reads the user on every request (see
`002-global-auth-guards.md`), so a change to the account applies to the next call.
