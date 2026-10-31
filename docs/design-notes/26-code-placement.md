# 26 — Code placement

Code lives as close to its callers as it can. A method of a facade decides where its code goes:

| A facade method is called by                         | Its code lives in                                    |
| ---------------------------------------------------- | ---------------------------------------------------- |
| two or more apps                                     | a core module, `core/modules/src/<m>`                |
| two or more modules of one app                       | a common module, `apps/<app>/src/common/modules/<m>` |
| one module (a feature, a processor, a global module) | that module, behind a port of its own                |

The rule counts callers per method, not per module. A core module whose every method serves two
apps stays in core; a method of it that one app calls moves into that app, and the rest stays.

## What lives where today

| Module               | Methods                        | Callers                                                         |
| -------------------- | ------------------------------ | --------------------------------------------------------------- |
| core `idempotency`   | `claim`, `complete`, `release` | staff `product`, customer `order`                               |
| core `ledger`        | `append`                       | staff `product`, the processor `ledger-record`                  |
| core `product-stock` | `lock`, `move`                 | staff `product`, customer `order`                               |
| staff common `auth`  | `validateSubject`              | staff `auth` (`GET /identity/auth/me`), staff `app/global/auth` |

Everything else sits with its only caller:

| Code                                  | Lives in                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------- |
| reading the ledger                    | staff `ledger` (see `06-ledger-feature.md`)                                 |
| deleting the expired idempotency keys | the processor `idempotency-purge` (see `10-idempotency-purge-processor.md`) |
| staff login                           | staff `auth` (see `18-staff-identity.md`)                                   |
| staff users and their roles           | staff `user` (see `04-user-and-role-features.md`)                           |
| staff roles and their permissions     | staff `role` (see `04-user-and-role-features.md`)                           |
| the permission codes of a staff user  | staff `app/global/auth`                                                     |
| customer sign-up and login            | customer `auth` (see `19-customer-identity.md`)                             |
| the subject of a customer token       | customer `app/global/auth`                                                  |

## Why per method

**A shared module is a contract between its callers.** Every method on its facade is one more thing
two teams must agree on before it changes. A method with one caller has nobody to agree with, so a
facade around it only adds a port, a facade and an adapter between the caller and its own code.

**Moving down is cheap, moving up is a decision.** When a second caller appears, the code moves up
one level and gets a facade. Until then it stays with the caller, where its tests and its changes
are.

## Copies over shared internals

**Each module keeps its own model.** Staff login, the back office and the subject check all read
`staff_user`, and each has a model of its own, narrowed to what it uses:

| Module              | Model                      | Holds                                   |
| ------------------- | -------------------------- | --------------------------------------- |
| staff `auth`        | `AuthStaffUserModel`       | id, email, password hash, status        |
| staff `user`        | `UserStaffUserModel`       | id, email, password hash, status, roles |
| staff common `auth` | `AuthCommonStaffUserModel` | id, email, status, roles                |

A shared model would be a facade method in disguise: a change for one caller would ripple into the
others. The copies share the table and the kernel enums (`UserStatusEnum`, `RoleEnum`,
`IdentityErrorCodeEnum`), nothing else.

**The names say where a symbol lives.** A symbol of a common module carries `Common`
(`AuthCommonModule`, `AUTH_COMMON_PORT`), a symbol of a core module carries `Core`, and a feature
symbol carries neither. A feature and a common module may share a name, as staff `auth` and staff
common `auth` do, and the infix keeps them apart.

## Global modules have layers too

A global module (`app/global/<m>`) used to hold only a module root and infrastructure. When it owns
logic, it gets `application/` and `outbound/` like a feature: the facade calls a use case, the use
case calls a repository port, and the repository lives in `infrastructure/persistence`. The lint
categories `acme-app:app:global:application` and `acme-app:app:global:outbound` cover them (see
`17-lint-allowlists.md`).
