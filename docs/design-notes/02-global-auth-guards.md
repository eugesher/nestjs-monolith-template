# 02 — Global auth guards

## Where the pieces live

| Piece                      | Location                         | Knows about                                                 |
| -------------------------- | -------------------------------- | ----------------------------------------------------------- |
| Guards, route decorators   | `libs/auth`                      | the token, the request, the two ports below                 |
| Validator and claims ports | `libs/contracts/src/auth`        | kernel enums only                                           |
| Port implementations       | `apps/<app>/src/app/global/auth` | the identity core module of the app, through a core adapter |

**The lib checks, the app decides who the user is.** `libs/auth` never reads a table. It verifies
the bearer token and hands the subject to `AUTH_USER_VALIDATOR_PORT`. Each app binds that port in
its global `AuthModule`: the facade calls the app's core adapter, which calls the session port of
the identity module of that app.

| App          | Core adapter                      | Identity module     | Ports bound                                    |
| ------------ | --------------------------------- | ------------------- | ---------------------------------------------- |
| staff-app    | `AuthStaffIdentityCoreAdapter`    | `staff-identity`    | `AUTH_USER_VALIDATOR_PORT`, `AUTH_CLAIMS_PORT` |
| customer-app | `AuthCustomerIdentityCoreAdapter` | `customer-identity` | `AUTH_USER_VALIDATOR_PORT`                     |

The global module also imports the lib modules, so mounting `AuthModule` in `AppModule` is the
whole wiring.

**A global module pairs with the lib contract of its own name.** `app/global/auth` may import
`libs/contracts/src/auth`, and only that contract. The lint expresses it as one selector,
`{ lib: '{{ from.file.captured.module }}' }`, so a future `app/global/<name>` gets the same rule
without a new policy.

## Two lib modules

| Module                | Guards                                   | Needs                      | Imported by             |
| --------------------- | ---------------------------------------- | -------------------------- | ----------------------- |
| `AuthLibModule`       | `AuthJwtGuard`                           | `AUTH_USER_VALIDATOR_PORT` | staff-app, customer-app |
| `AuthClaimsLibModule` | `AuthRolesGuard`, `AuthPermissionsGuard` | `AUTH_CLAIMS_PORT`         | staff-app               |

**Who the user is and what the user may do are two ports.** `AUTH_USER_VALIDATOR_PORT.validate`
answers `{ id, email }`, which every principal has. `AUTH_CLAIMS_PORT` answers `findRoles` and
`findPermissionCodes`, which only staff have. A customer owns their records and holds no roles, so
customer-app imports `AuthLibModule` alone and binds no claims port.

**Two static modules, not a flag.** `AuthLibModule.forRoot({ claims: true })` would hide the choice
in an argument that no lint can read. An import of `AuthClaimsLibModule` is visible, and the lint
policy `customer-claims.mjs` refuses it in customer-app, together with `@Roles`,
`@RequiresPermission`, `AUTH_CLAIMS_PORT`, `RoleEnum` and `PermissionCodeEnum`. Without the claims
module the decorators would be silently ignored, so a customer route cannot even name them.

## Order

Each guard is one `APP_GUARD` provider, and Nest runs global guards in registration order:

1. `AuthJwtGuard` — lets a `@Public()` route through, otherwise needs a valid
   `Authorization: Bearer` token and a subject the validator still accepts. Anything else is 401.
   It puts the user on `request.user`.
2. `AuthRolesGuard` — `@Roles(...)`: 403 unless the user holds ANY of the listed roles.
3. `AuthPermissionsGuard` — `@RequiresPermission(...)`: 403 unless the user holds ANY of the
   listed codes.

**Authentication must come first.** The claim guards read `request.user`. Ahead of the JWT guard
they would see an anonymous request on every gated route and answer 403 where 401 is meant. The
staff-app `AuthModule` imports `AuthLibModule` before `AuthClaimsLibModule`, and the spec of the
claims module checks that a gated route without a token answers 401.

**Deny by default.** A route without decorators needs a token. `@Public()` is the only way out, and
it is visible in the controller. Health endpoints are public: an orchestrator probes them without
credentials.

## The user is re-derived

**The token names the subject and nothing else.** The identity module of the app signs `{ sub }`,
and the verified payload holds `sub`, `iat` and `exp`. Roles and permissions never travel in the
token, so there is no stale copy of them to trust or to refresh.

**Claims in the token are not trusted.** The guard reads only `sub` from the verified payload and
asks the validator for the user: id and email. The user comes from the database on every request,
so a disabled account stops working on the next call, not at token expiry. The cost is one read per
request.

**Claims are read only where a route asks for them.** Each claim guard returns early on a route
without its decorator. On a route with it, the guard asks the claims port for the roles or the
permission codes of the user, one read, and checks them. A revoked permission therefore refuses the
very next gated request, while an ungated request pays for the user alone.

**One secret per app.** The guard verifies with `JWT_SECRET` of the app, the secret its identity
module signs the access token with. The two apps have different secrets, so a token of one app
fails the signature check in the other. Even with a shared secret it would fail: the subject of a
customer is not a row of `staff_user`, and the other way round. The session e2e of each app sends
both kinds of foreign token and expects 401.
