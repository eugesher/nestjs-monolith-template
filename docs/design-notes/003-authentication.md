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

**A customer logs in inside the feature, the staff inside core.** No other module of customer-app
logs anyone in, so its `AuthLoginUseCase` reads the customer, checks the password and signs the
token itself. The staff log in to staff-app and to processor-app, so their login lives in the core
module `staff-auth` as `StaffAuthCoreLoginUseCase` (see `024-code-placement.md` and
`017-credentials-lib.md`). It answers an outcome, and `AuthLoginUseCase` of each app turns
`invalid-credentials` and `user-inactive` into the exceptions of its feature (see
`027-core-module-outcomes.md`), so the two apps answer a login the same way.

**An unknown email costs as much as a wrong password.** Each login use case checks the password
before it looks at whether the user was found, and passes `passwordHash: null` for an unknown email;
the lib then runs argon2id against a dummy hash (see `017-credentials-lib.md`). Both cases answer
the same 401 after one hash, so the response time does not tell whether an address is registered.
The registration of customer-app still answers 409 to a taken email: hiding it needs a confirmation
by mail, and the route is under the `auth` limit below.

**No address reaches the logs.** The warning `Login failed: unknown email` carries no email, so a
guessing run does not leave a list of addresses in the logs. `AuthEmailTakenException` answers
`Email is already registered` without the address, because the shared filter logs the response.

**A route that only echoes the guard has no use case.** `handleMe` of customer-app copies
`@CurrentUser()` into the response DTO: `AuthJwtGuard` has already re-read the user. In staff-app
`AuthMeUseCase` asks the core module `staff-auth` through `AUTH_IDENTITY_PORT` and
`infrastructure/core-adapters/auth-identity-core.adapter.ts`.

## A unique index instead of a lookup

`AuthRegisterUseCase` of customer-app inserts at once through its repository and turns a `DUPLICATE`
outcome of the insert into a domain error. A lookup and an insert are two statements: two concurrent
requests would both pass the lookup, and the loser would hit the index as a 500.
`UserRegisterUseCase` of staff-app does the same, and the e2e of both apps sends two such requests
at once and expects one 201 and one 409.

**The repository reports the duplicate, the use case decides.** A write that a unique index may
refuse answers an outcome of its port, `<Port><Subject><Method>OutcomeEnum` in `outbound/enums`:
`INSERTED` with the id, or `UPDATED`, or `DUPLICATE`. The repository catches the duplicate-key error
of the driver with `MysqlErrorHelper.isDuplicateKey`
(`libs/toolkit/src/database/mysql-error.helper.ts`) around that one statement and passes any other
error through, so the application never sees an error of the driver, and a duplicate of a later
statement of the same transaction stays an error instead of passing for a taken name. A use case
throws its own exception for the outcome (`AuthEmailTakenException`, `TagNameTakenException`) or
takes another branch (see `004-append-only-journal.md` and `006-idempotency-keys.md`).

## The feature filter delegates

`AuthHttpExceptionFilter` turns the code of `AuthBaseException` into an `HttpException` with the
body `{ statusCode, message, code }` and hands it to the shared `HttpExceptionFilter` of
`libs/http`. Logging, and masking of `password` and `email` in the logged request, stay in one
place. The feature module provides `HttpExceptionFilter` so that Nest can inject it into the feature
filter.

## One token per audience

Each app signs and verifies with its `JWT_SECRET` and its audience: `staff` for staff-app and
processor-app, which share the secret, and `customer` for customer-app, which has its own. A token
of customer-app is refused by the staff apps with 401, and the other way round, even if the secrets
were the same (see `002-global-auth-guards.md`). Login carries `@Public()`; without it the global
JWT guard would answer 401 before the controller runs. The token carries only `sub`, `aud`, `iat`
and `exp`, and its lifetime is `JWT_EXPIRES_IN`. Signing lives in `libs/credentials` (see
`017-credentials-lib.md`).

**A disabled account stops at once, a token of an active one only at expiry.** The guard re-reads
the user on every request (see `002-global-auth-guards.md`), so a disabled account or a changed role
applies to the next call. Nothing revokes the token of an active user: there is no logout and no
list of issued tokens, so a leaked token works until `exp`. The lifetime bounds that window, and it
is short where the token carries the most power: `12h` in staff-app and processor-app, a working day
without a second login, and `7d` in customer-app.

## Limits on the public routes

Login and registration are public and each runs argon2id, so they carry the tightest limits of the
app.

**Every route has a limit per address, the credential routes a second one.** `ThrottleSetupModule`
of `libs/http` mounts `ThrottleGuard`, a subclass of the `ThrottlerGuard` of `@nestjs/throttler`, as
a global guard with two throttlers: `default` from `THROTTLE_TTL_MS` and `THROTTLE_LIMIT` on every
route, and `auth` from `THROTTLE_AUTH_TTL_MS` and `THROTTLE_AUTH_LIMIT` on the routes marked
`@AuthThrottle()`: login in the three apps and registration in customer-app. A request over a limit
gets `429` with `{ statusCode, message: 'Too many requests' }` and a `Retry-After` header,
`Retry-After-auth` for the second throttler. The guard counts per route and per client address; the
address is `req.ip`, so behind a proxy it needs `HTTP_TRUST_PROXY_HOPS` (see
`036-production-stack.md`).

**The guard throws an object body.** The `ThrottlerException` of the package carries a string, and
`HttpExceptionFilter` replies with `getResponse()` as it is, so the client would get plain text.
`ThrottleGuard` overrides `throwThrottlingException` with an `HttpException` whose response is the
object above.

**The counters live in Redis, so the replicas of an app share them.** `ThrottleRedisStorage`
increments a key `throttle:<hash>` and sets its expiry with the first hit, in one Lua script: a
fixed window, and a hit over the limit is refused until the window ends. The package's own storage
is in memory, so each replica would allow the limit again. `ThrottleSetupModule` hands the storage
to `ThrottlerModule.forRootAsync` through its own `ThrottleStorageModule`: the storage stays a
provider of Nest, so it reads `ConfigService` and closes its Redis connection on shutdown, where an
instance built inside `useFactory` would never see `onApplicationShutdown`.

**A Redis outage lifts the limits instead of failing the requests.** The client has no offline queue
and a command timeout, as the cache has; a failed increment logs a warning and lets the request
through, so an outage of Redis does not take login down with it.

**The number of hashes at once is bounded too.** A limit per address does not stop a flood from many
addresses, and every hash holds `AUTH_ARGON2_MEMORY_COST` KiB while it runs. The password hasher of
`libs/credentials` therefore runs at most `AUTH_ARGON2_MAX_CONCURRENCY` hashes at a time (see
`017-credentials-lib.md`).
