# 018 — Entity ownership lint

Two lint policies keep entities and decorators out of the app that must not use them.

| Policy                                         | Keeps out of            | What                                                                                                         |
| ---------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| `lint/boundaries/policies/user-entities.mjs`   | customer-app, staff-app | the entities that belong to the other app                                                                    |
| `lint/boundaries/policies/customer-claims.mjs` | customer-app            | `AuthClaimsLibModule`, `@Roles`, `@RequiresPermission`, `AUTH_CLAIMS_PORT`, `RoleEnum`, `PermissionCodeEnum` |

`spec/architecture/common-modules.spec.ts` and `spec/architecture/libs-by-layer.spec.ts` hold the
cases in both directions.

**Code needs no rule of its own.** An app may import only its own contracts and common modules, so
one app cannot reach the contracts or common modules of another.

**A relation can force an exception.** TypeORM needs the target of every relation in the entity
list of the connection. When an entity of one app references an entity of another, the entity list
of every app that maps it must list the target too. The exception in `user-entities.mjs` names
that one file (`apps/staff-app/src/app/setup/orm/entities/index.ts`) and that one specifier, so no
other file may import the entity.

**An app without claims mounts `AuthLibModule` alone**, so no claim guard runs there (see
`002-global-auth-guards.md`), and the decorators that would be silently ignored are refused by lint.
