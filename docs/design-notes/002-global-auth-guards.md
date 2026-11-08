# 002 — Global auth guards

## Where the pieces live

| Piece                      | Location                         | Knows about                                  |
| -------------------------- | -------------------------------- | -------------------------------------------- |
| Guards, route decorators   | `libs/auth`                      | the token, the request, the two ports below  |
| Validator and claims ports | `libs/contracts/src/auth`        | kernel enums only                            |
| Port implementations       | `apps/<app>/src/app/global/auth` | the users of the app, through its own layers |

**The lib checks, the app decides who the user is.** `libs/auth` never reads a table. It verifies
the bearer token and hands the subject to `AUTH_USER_VALIDATOR_PORT`. Each app binds that port in
its global `AuthGlobalModule`, which has the layers of a feature (see `024-code-placement.md`):
every facade method calls a use case, and the use case reaches the data through an outbound port.

| App           | The user and its permission codes                                                                                                               | Ports bound                |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| staff-app     | `AuthGlobalValidateSubjectUseCase` over `AUTH_GLOBAL_SUBJECT_PORT`, which `AuthGlobalSubjectCoreAdapter` implements with `STAFF_AUTH_CORE_PORT` | `AUTH_USER_VALIDATOR_PORT` |
| processor-app | the same, file for file                                                                                                                         | `AUTH_USER_VALIDATOR_PORT` |
| customer-app  | `AuthGlobalValidateSubjectUseCase` and its repository                                                                                           | `AUTH_USER_VALIDATOR_PORT` |

The staff subject lives in the core module `core/modules/src/staff-auth`: two apps ask for it, and
staff-app asks twice, from the guard and from `GET /auth/me`. One query reads the user, its roles
and the codes of their permissions; the global module keeps the id, the email and the codes. The
customer check has one caller, so it lives in customer-app.

The global module also imports the lib modules, so mounting `AuthGlobalModule` in `AppModule` is the
whole wiring.

**Global classes carry the `AuthGlobal` prefix.** The folder stays `app/global/auth`, paired with
the lib contract below, but the `auth` feature owns the plain names: `AuthModule`, and
`AuthIdentityCoreAdapter` for the core adapter of its own. The prefix keeps the two apart in
imports, in stack traces and in DI errors.

**A global module pairs with the lib contract of its own name.** `app/global/auth` may import
`libs/contracts/src/auth`, and only that contract. The lint expresses it as one selector,
`{ lib: '{{ from.file.captured.module }}' }`, so a future `app/global/<name>` gets the same rule
without a new policy.

## Two lib modules

| Module                 | Guards                | Needs                               | Imported by                            |
| ---------------------- | --------------------- | ----------------------------------- | -------------------------------------- |
| `AuthJwtModule`        | `AuthJwtGuard`        | `AUTH_USER_VALIDATOR_PORT`          | staff-app, processor-app, customer-app |
| `AuthPermissionModule` | `AuthPermissionGuard` | `permissionCodes` on `request.user` | staff-app, processor-app               |

**Who the user is and what the user may do come in one answer.** `AUTH_USER_VALIDATOR_PORT.validate`
answers `{ id, email, permissionCodes? }`. A staff app fills `permissionCodes`; customer-app leaves
it out and imports `AuthJwtModule` alone. There is no roles guard and no `@Roles`: routes are gated
by permissions only, and a role is a named set of them.

**Two static modules, not a flag.** `AuthJwtModule.forRoot({ claims: true })` would hide the choice
in an argument that no lint can read. An import of `AuthPermissionModule` is visible, and the lint
policy `customer-claims.mjs` refuses it in customer-app, together with `@RequiresPermission` and
`PermissionCodeEnum`. Without the permission module the decorators would be silently ignored, so a
route of customer-app cannot even name them.

## Order

Each guard is one `APP_GUARD` provider, and Nest runs global guards in registration order:

1. `AuthJwtGuard` — lets a `@Public()` route through, otherwise needs a valid
   `Authorization: Bearer` token and a subject the validator still accepts. Anything else is 401. It
   puts the user on `request.user`.
2. `AuthPermissionGuard` — `@RequiresPermission(<code>)`: 403 unless `request.user.permissionCodes`
   holds the code. The decorator takes one code.

**Authentication must come first.** The permissions guard reads `request.user`. Ahead of the JWT
guard they would see an anonymous request on every gated route and answer 403 where 401 is meant.
The `AuthGlobalModule` of a staff app imports `AuthJwtModule` before `AuthPermissionModule`, and the
spec of the permission module checks that a gated route without a token answers 401.

**Deny by default.** A route without decorators needs a token. `@Public()` is the only way out, and
it is visible in the controller. Health endpoints are public: an orchestrator probes them without
credentials.

## The user is re-derived

**The token names the subject and nothing else.** The `auth` feature of the app signs `{ sub }`, and
the verified payload holds `sub`, `iat` and `exp`. Roles and permissions never travel in the token,
so there is no stale copy of them to trust or to refresh.

**Claims in the token are not trusted.** The guard reads only `sub` from the verified payload and
asks the validator for the user: id, email and, in a staff app, permission codes. The user comes
from the database on every request, so a disabled account or a revoked permission stops working on
the next call, not at token expiry. The cost is one read per request.

**One read per request, gated or not.** The staff validator reads the user with its permission codes
in one query, so the permissions guard reads nothing. An ungated request pays for the codes too; the
price is a join, and a gated request saves its second read.

**One secret per audience.** The guard verifies with `JWT_SECRET` of the app, the secret its `auth`
feature signs the access token with. staff-app and processor-app serve the same staff and share the
secret, so a staff token works in both and either app signs one in. customer-app has its own secret,
so its tokens fail the signature check in the staff apps. Even with a shared secret it would fail:
the subject of a customer is not a row of `staff_user`, and the other way round. The auth e2e of
each app sends both kinds of foreign token and expects 401.
