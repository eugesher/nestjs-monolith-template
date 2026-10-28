# 02 — Global auth guards

## Where the pieces live

| Piece | Location | Knows about |
| --- | --- | --- |
| Guards, route decorators | `libs/auth` | the token, the request, `AUTH_USER_VALIDATOR_PORT` |
| Validator port, user view | `libs/contracts/src/auth` | kernel enums only |
| Port implementation | `apps/<app>/src/app/global/auth` | the identity core module, through a core adapter |

**The lib checks, the app decides who the user is.** `libs/auth` never reads a table. It verifies
the bearer token and hands the subject to `AUTH_USER_VALIDATOR_PORT`. Each app binds that port in
its global `AuthModule`: the facade calls `AuthIdentityCoreAdapter`, which calls
`IDENTITY_CORE_SESSION_PORT.validateSubject`. The global module also imports `AuthLibModule`, so
mounting `AuthModule` in `AppModule` is the whole wiring.

**A global module pairs with the lib contract of its own name.** `app/global/auth` may import
`libs/contracts/src/auth`, and only that contract. The lint expresses it as one selector,
`{ lib: '{{ from.file.captured.module }}' }`, so a future `app/global/<name>` gets the same rule
without a new policy.

## Order

`AuthLibModule` registers three `APP_GUARD` providers, one per guard, and Nest runs global guards
in registration order:

1. `AuthJwtGuard` — lets a `@Public()` route through, otherwise needs a valid
   `Authorization: Bearer` token and a subject the validator still accepts. Anything else is 401.
   It puts the user on `request.user`.
2. `AuthRolesGuard` — `@Roles(...)`: 403 unless the user holds ANY of the listed roles.
3. `AuthPermissionsGuard` — `@RequiresPermission(...)`: 403 unless the user holds ANY of the
   listed codes.

**Authentication must come first.** The claim guards read `request.user`. Ahead of the JWT guard
they would see an anonymous request on every gated route and answer 403 where 401 is meant. Keep
the three providers in this order, and add a new guard where its input is ready.

**Deny by default.** A route without decorators needs a token. `@Public()` is the only way out, and
it is visible in the controller. Health endpoints are public: an orchestrator probes them without
credentials.

## The user is re-derived

**Claims in the token are not trusted.** The guard reads only `sub` from the verified payload and
asks the validator for the user. Roles and permissions come from the database on every request, so
a revoked grant or a disabled account stops working on the next call, not at token expiry. The
cost is one read per request.

**A refresh token does not open a route.** The guard verifies with `JWT_ACCESS_SECRET`; refresh
tokens are signed with `JWT_REFRESH_SECRET`, and the config schema refuses equal secrets.
