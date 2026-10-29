# 03 — Session feature

`apps/<app>/src/features/session` serves `POST /auth/login` and `GET /auth/me` in both apps. The feature is called `session` because `auth` already names the lib,
its contract and the global module. The route keeps `auth`, because the URL is a contract.

## The full path, even for a thin feature

| Layer          | Piece                                                                    | Job                                                    |
| -------------- | ------------------------------------------------------------------------ | ------------------------------------------------------ |
| presentation   | `SessionController`, request/response DTOs, `SessionHttpExceptionFilter` | HTTP, validation, status codes                         |
| application    | `SessionLoginUseCase`, `SessionMeUseCase` in staff-app                   | the feature's operations                               |
| outbound       | `SESSION_IDENTITY_PORT`                                                  | what the feature needs from identity, in its own terms |
| infrastructure | `SessionStaffIdentityCoreAdapter`, `SessionCustomerIdentityCoreAdapter`  | calls the session port of the identity module          |
| domain         | `SessionDomainException`                                                 | the refusal the feature understands                    |

The port is named after the need, identity, and the adapter after the core module it calls:
`staff-identity` in staff-app, `customer-identity` in customer-app (see `18-staff-identity.md` and
`19-customer-identity.md`). A staff user cannot log in to customer-app and a customer cannot log in
to staff-app: each login reads only the table of its own module.

**The controller never sees a core contract.** A shortcut, a controller that injects the identity
port, would save four files. It would also make presentation depend on a core module, and then the
lint would need a "presentation-only feature" exception. With the full path, every feature follows
one rule, and this thin feature is the smallest example of it.

**`me` of customer-app has no use case.** `AuthJwtGuard` has already re-read the customer from the
database and put `{ id, email }` on the request. `handleMe` copies `@CurrentUser()` into the
response DTO. A use case would only pass the same value through.

**`me` of staff-app reads the roles.** The current user of the guard is `{ id, email }`, the same in
both apps, and roles are a claim the guards read only where a route asks for one. `SessionMeUseCase`
asks `SESSION_IDENTITY_PORT.findSubject`, which calls `validateSubject` of `staff-identity`, and
answers `{ id, email, roles }`. A user disabled between the guard and the use case gets
`AUTH_USER_NOT_FOUND`.

**`me` answers no permissions.** A client that needs the codes would get a use case that asks the
session facade for them explicitly, rather than a read on every request.

## Refusals

**The core adapter translates, the filter maps.** Identity throws its own `DomainException`
subclass, which a feature must not import. The session core adapter catches any
`DomainException` whose code belongs to `IdentityErrorCodeEnum` and rethrows it as
`SessionDomainException` with the same code and message. Anything else, such as a lost connection,
passes through untouched and ends up as a 500.

**The codes stay `AUTH_*` on the wire.** The enum lives in `libs/kernel`, so the feature reuses
it instead of inventing `SESSION_*` names. A client sees the same `code` whichever layer produced
the refusal.

**The feature filter delegates.** `SessionHttpExceptionFilter` turns the code into an
`HttpException` with the body `{ statusCode, message, code }` and hands it to the shared
`HttpExceptionFilter`. Logging, and masking of `password` in the logged request,
therefore stay in one place. The feature module provides `HttpExceptionFilter` so that Nest can
inject it into the feature filter.

| Code                                                                        | Status |
| --------------------------------------------------------------------------- | ------ |
| `AUTH_INVALID_CREDENTIALS`                                                  | 401    |
| `AUTH_USER_INACTIVE`                                                        | 403    |
| `AUTH_USER_NOT_FOUND`, `AUTH_ROLE_NOT_FOUND`                                | 404    |
| `AUTH_EMAIL_TAKEN`                                                          | 409    |
| `AUTH_EMAIL_INVALID`, `AUTH_PASSWORD_TOO_WEAK`, `AUTH_PERMISSION_NOT_FOUND` | 400    |

Login answers the same 401 for an unknown email and for a wrong password, so the response does not
reveal which accounts exist.

## One token per app

Each app signs and verifies with its own `JWT_SECRET`, and its identity module reads its own
tables. A token issued by one app is refused by the other with 401. Login carries `@Public()`;
without it the global JWT guard would answer 401 before the controller runs.

**Login answers one access token.** The response is `{ accessToken }`, and the token carries only
the subject: `sub`, `iat`, `exp`. There is no refresh token: when the access token expires, the
user logs in again. Its lifetime is `JWT_EXPIRES_IN` of the app, 30 days in staff-app and 7 days
in customer-app by default. The signing itself lives in `libs/credentials` (see
`19-customer-identity.md`).

**A long lifetime does not delay revocation.** The guard re-reads the user on every request (see
`02-global-auth-guards.md`), so a disabled account or a revoked permission stops working on the
next call. Expiry only bounds how long a stolen token stays usable for an account nobody disabled.
