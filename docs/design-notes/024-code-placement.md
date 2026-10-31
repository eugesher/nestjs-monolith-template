# 024 — Code placement

Code lives as close to its callers as it can. A method of a facade decides where its code goes:

| A facade method is called by                         | Its code lives in                                    |
| ---------------------------------------------------- | ---------------------------------------------------- |
| two or more apps                                     | a core module, `core/modules/src/<m>`                |
| two or more modules of one app                       | a common module, `apps/<app>/src/common/modules/<m>` |
| one module (a feature, a processor, a global module) | that module, behind a port of its own                |

The rule counts callers per method, not per module. A core module whose every method serves two
apps stays in core; a method of it that one app calls moves into that app, and the rest stays.

## What lives where today

| Module               | Methods                        | Callers                                                                      |
| -------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| core `idempotency`   | `claim`, `complete`, `release` | staff `product`, customer `order`                                            |
| core `product`       | `archive`                      | staff `product`, the processor `product-stock`                               |
| core `product-stock` | `lock`, `move`                 | staff `product`, customer `order`, `lock` also the processor `product-stock` |
| staff common `auth`  | `validateSubject`              | staff `auth` (`GET /identity/auth/me`), staff `app/global/auth`              |

Everything else sits with its only caller, for example:

| Code                                   | Lives in                                              |
| -------------------------------------- | ----------------------------------------------------- |
| the append to `ledger_entry`           | `apps/processor-app/src/processors/ledger-record`     |
| the read of `ledger_entry`             | `apps/staff-app/src/features/ledger`                  |
| the delete of expired idempotency keys | `apps/processor-app/src/processors/idempotency-purge` |
| a login                                | `apps/<app>/src/features/**/auth`                     |
| the permission codes of a user         | `apps/staff-app/src/app/global/auth`                  |

## Why per method

**A shared module is a contract between its callers.** Every method on its facade is one more thing
two teams must agree on before it changes. A method with one caller has nobody to agree with, so a
facade around it only adds a port, a facade and an adapter between the caller and its own code.

**Moving down is cheap, moving up is a decision.** When a second caller appears, the code moves up
one level and gets a facade. Until then it stays with the caller, where its tests and its changes
are.

## Copies over shared internals

**Each module keeps its own model**, narrowed to what it uses, even over one table (see
`017-credentials-lib.md`). A shared model would be a facade method in disguise: a change for one
caller would ripple into the others. The copies share the table and the kernel enums, nothing else.

**The names say where a symbol lives.** A symbol of a common module carries `Common`
(`AuthCommonModule`, `AUTH_COMMON_PORT`), a symbol of a core module carries `Core`, and a feature
symbol carries neither. A feature and a common module may share a name, as staff `auth` and staff
common `auth` do, and the infix keeps them apart.

## Global modules have layers too

A global module (`app/global/<m>`) used to hold only a module root and infrastructure. When it owns
logic, it gets `application/` and `outbound/` like a feature: the facade calls a use case, the use
case calls a repository port, and the repository lives in `infrastructure/persistence`. The lint
categories `acme-app:app:global:application` and `acme-app:app:global:outbound` cover them (see
`016-lint-allowlists.md`).
