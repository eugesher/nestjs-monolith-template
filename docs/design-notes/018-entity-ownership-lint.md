# 018 — Entity ownership lint

Two lint policies keep entities and decorators out of the app that must not use them.

| Policy                                         | Keeps out of  | What                                                                           |
| ---------------------------------------------- | ------------- | ------------------------------------------------------------------------------ |
| `lint/boundaries/policies/user-entities.mjs`   | staff-app     | `Customer`, which stays in core because the core entity `Order` references it  |
| `lint/boundaries/policies/user-entities.mjs`   | customer-app  | the `Staff*` entities, `STAFF_AUTH_CORE_PORT` and `StaffAuthCoreModule`        |
| `lint/boundaries/policies/user-entities.mjs`   | processor-app | the `Staff*` entities, read only through the core module `staff-auth`          |
| `lint/boundaries/policies/customer-claims.mjs` | customer-app  | `AuthClaimsLibModule`, `@RequiresPermission`, `RoleEnum`, `PermissionCodeEnum` |

`spec/architecture/common-modules.spec.ts`, `spec/architecture/libs-by-layer.spec.ts` and
`spec/architecture/app-entities.spec.ts` hold the cases in both directions.

**An entity of one app needs no rule of its own.** An entity that only one app maps lives in
`apps/<app>/src/common/entities` (category `acme-app:common:entities`). Only the infrastructure,
the `app/` folder and the e2e code of the same app may import it, so another app cannot reach it.
An entity that several apps map stays in `core/entities`.

**Code needs no rule of its own.** An app may import only its own contracts and common modules, so
one app cannot reach the contracts or common modules of another.

**A relation can force an exception.** TypeORM needs the target of every relation in the entity
list of the connection. When an entity of one app references an entity of another, the entity list
of every app that maps it must list the target too. The exceptions in `user-entities.mjs` name
that one file (`apps/<app>/src/app/setup/orm/entities/index.ts`) and those specifiers, so no other
file may import the entity. processor-app lists the `Staff*` entities for the same reason: the core
module `staff-auth` runs its queries on the connection of the app that mounts it.

**An app without claims mounts `AuthLibModule` alone**, so no claim guard runs there (see
`002-global-auth-guards.md`), and the decorators that would be silently ignored are refused by lint.
