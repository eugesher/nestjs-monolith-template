# 03 — Auth feature

`apps/<app>/src/features/auth` serves `POST /auth/login` and `GET /auth/me` in both apps, and
`POST /auth/register` in customer-app. `auth` also names the lib, its contract and the global
module, so the classes of the global module carry the `AuthGlobal` prefix (see
`02-global-auth-guards.md`) and the feature keeps the plain `Auth` prefix.

## The full path, even for a thin feature

| Layer          | Piece                                                                                   | Job                                                    |
| -------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| presentation   | `AuthController`, request/response DTOs, `AuthHttpExceptionFilter`                      | HTTP, validation, status codes                         |
| application    | `AuthLoginUseCase`, `AuthMeUseCase` in staff-app, `AuthRegisterUseCase` in customer-app | the feature's operations                               |
| outbound       | `AUTH_IDENTITY_PORT`                                                                    | what the feature needs from identity, in its own terms |
| infrastructure | `AuthStaffIdentityCoreAdapter`, `AuthCustomerIdentityCoreAdapter`                       | calls the auth port of the identity module             |
| domain         | `AuthDomainException`                                                                   | the refusal the feature understands                    |

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
both apps, and roles are a claim the guards read only where a route asks for one. `AuthMeUseCase`
asks `AUTH_IDENTITY_PORT.findSubject`, which calls `validateSubject` of `staff-identity`, and
answers `{ id, email, roles }`. A user disabled between the guard and the use case gets
`AUTH_USER_NOT_FOUND`.

**`me` answers no permissions.** A client that needs the codes would get a use case that asks the
auth facade for them explicitly, rather than a read on every request.

## Sign-up in customer-app

**A customer signs up alone, staff are created by an admin.** `POST /auth/register` of customer-app
is `@Public()` and calls `register` of the `customer-identity` auth port. staff-app has no
sign-up: a staff user comes from `POST /iam/users`, behind `iam:user:create` (see
`04-iam-feature.md`).

**Sign-up answers who was created, not a token.** The response is `201` with `{ id, email }`, and
the client logs in next. Login stays the only place that issues a token, checks the status and logs
`Customer logged in`, so there is one path to audit and one place where the token lifetime matters.

**The rules are those of a staff user.** The request DTO wants a well-formed email of at most 255
characters and a password of 12 to 256 characters. The core module checks the email and the length
again (`AUTH_EMAIL_INVALID`, `AUTH_PASSWORD_TOO_WEAK`), because it does not trust its caller. The
email is normalized as login normalizes it, so `Eve@Example.com` signs up and logs in as
`eve@example.com`. The password is hashed with argon2id by `CREDENTIALS_PASSWORD_HASHER_PORT`, and a
new customer is `active`.

**A taken email is a 409, whatever its case.** The unique index `uq_customer_email` decides, not a
lookup before the insert. A lookup and an insert are two statements: two sign-ups with one email at
the same moment would both pass the lookup, and the loser would hit the index as a 500. The register
repository inserts at once and turns the duplicate-key error of the driver (`MysqlErrorHelper`) into
`AUTH_EMAIL_TAKEN`, which maps to 409. `POST /iam/users` of staff-app does the same (see
`18-staff-identity.md`), and the e2e of each app sends two such requests at once and expects one 201
and one 409.

**Sign-up records a fact in the ledger through the queue.** After the insert,
`AuthRegisterUseCase` asks `AuthLedgerService` to enqueue `CustomerRegistered` under the operation
key `customer-registered:<id>`, with `{ email }` as the payload and the correlation id of the
request. `AUTH_LEDGER_RECORD_PORT` and `AuthLedgerRecordQueueAdapter` put the record into the
`ledger-record` queue, the queue product writes to in staff-app. customer-app has no processor:
the `ledger-record` processor of staff-app appends the record (see `09-ledger-record-processor.md`),
so both apps must point `REDIS_URL` at one Redis.

The customer is already stored, so a failing enqueue must not turn the sign-up into an error. The
adapter gives up after `REDIS_COMMAND_TIMEOUT_MS`, because Bull waits for a lost Redis without end,
and the service tries three times through `ReplayRetryHelper` and then logs the record at `error`
for a replay, like the product feature (see `08-product-feature.md`).

The e2e signs a customer up, logs in with the same credentials, reads `me`, finds no ledger entry
yet and one waiting job of the new customer with the email and the correlation id of the sign-up.
The e2e context takes the waiting jobs and empties the queue.

## Open questions

**The ledger holds the email of a customer.** The ledger is append-only, so an email in a payload
outlives the account: erasing a customer on request means rewriting entries that were meant never to
change. A project bound by such a duty keeps the id alone in the payload or encrypts the email with a
key it can destroy.

**Login and sign-up have no rate limit.** Both routes are public, and the template has no throttler.
A client can guess passwords at the speed of argon2 or create accounts in bulk. Two ways out:
`@nestjs/throttler` with Redis storage, so the limit holds across instances, or a limit at the
reverse proxy in front of the apps. Either is a decision of the project built on the template.

**Sign-up tells whether an email has an account.** Login answers the same 401 for an unknown email
and a wrong password, but sign-up answers 409 for a taken email. Hiding it would need a confirmation
email that says "you already have an account" while the response stays the same, and the template
sends no email. A rate limit at least makes probing slow.

## Refusals

**The core adapter translates, the filter maps.** Identity throws its own `DomainException`
subclass, which a feature must not import. The auth core adapter catches any
`DomainException` whose code belongs to `IdentityErrorCodeEnum` and rethrows it as
`AuthDomainException` with the same code and message. Anything else, such as a lost connection,
passes through untouched and ends up as a 500.

**The codes stay `AUTH_*` on the wire.** The enum lives in `libs/kernel`, so the feature reuses
it instead of inventing `AUTH_*` names. A client sees the same `code` whichever layer produced
the refusal.

**The feature filter delegates.** `AuthHttpExceptionFilter` turns the code into an
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
