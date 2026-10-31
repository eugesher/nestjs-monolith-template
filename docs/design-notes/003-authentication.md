# 003 — Authentication

Login, token signing and the read of the current user live in an `auth` feature of each app.
`auth` also names the lib, its contract and the global module, so the classes of the global module
carry the `AuthGlobal` prefix (see `002-global-auth-guards.md`) and the feature keeps the plain
`Auth` prefix.

| App          | Feature                                             |
| ------------ | --------------------------------------------------- |
| staff-app    | `apps/staff-app/src/features/identity/modules/auth` |
| customer-app | `apps/customer-app/src/features/auth`               |

## The full path, even for a thin feature

| Layer          | Example                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------- |
| presentation   | `presentation/controllers/auth.controller.ts`, `presentation/filters/auth-http-exception.filter.ts` |
| application    | `application/use-cases/auth-login.use-case.ts`, `application/services/auth-access-token.service.ts` |
| outbound       | `outbound/ports/auth-login-repository.port.ts`                                                      |
| infrastructure | `infrastructure/persistence/repositories/auth-login.repository.ts`                                  |
| domain         | `domain/models/`, `domain/exceptions/auth-domain.exception.ts`                                      |

**Login lives in the feature.** No other module logs anyone in, so the use case reads the user,
checks the password and signs the token itself (see `024-code-placement.md`).

**A route that only echoes the guard has no use case.** `handleMe` of customer-app copies
`@CurrentUser()` into the response DTO: `AuthJwtGuard` has already re-read the user. In staff-app
`AuthMeUseCase` asks a common module through `AUTH_IDENTITY_PORT` and
`infrastructure/common-adapters/auth-identity-common.adapter.ts`.

## A unique index instead of a lookup

`AuthRegisterRepository` of customer-app inserts at once and turns the duplicate-key error of the
driver into a domain error with `MysqlErrorHelper.isDuplicateKey`
(`libs/database/src/errors/mysql-error.helper.ts`). A lookup and an insert are two statements: two
concurrent requests would both pass the lookup, and the loser would hit the index as a 500. The
e2e of each app sends two such requests at once and expects one 201 and one 409.

## The feature filter delegates

`AuthHttpExceptionFilter` turns the code of `AuthDomainException` into an `HttpException` with the
body `{ statusCode, message, code }` and hands it to the shared `HttpExceptionFilter` of
`libs/http`. Logging, and masking of `password` in the logged request, stay in one place. The
feature module provides `HttpExceptionFilter` so that Nest can inject it into the feature filter.

## One token per app

Each app signs and verifies with its own `JWT_SECRET`, so a token of one app is refused by the
other with 401. Login carries `@Public()`; without it the global JWT guard would answer 401 before
the controller runs. The token carries only `sub`, `iat` and `exp`, and its lifetime is
`JWT_EXPIRES_IN`. Signing lives in `libs/credentials` (see `017-credentials-lib.md`).

**The lifetime does not delay revocation.** The guard re-reads the user on every request (see
`002-global-auth-guards.md`), so a change to the account applies to the next call.
