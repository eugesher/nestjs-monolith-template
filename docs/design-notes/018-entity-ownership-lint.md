# 018 — Entity ownership lint

Core belongs to no app: lint decides by the layer of the importing file, never by the app.

| Core element           | Layers of an app that may import it                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `@acme-core/entities`  | infrastructure, the persistence interfaces of outbound, the `app/` folder, common entities and e2e       |
| `@acme-core/contracts` | core adapters, queue adapters, `common/shared`, processor presentation and e2e                           |
| `@acme-core/modules`   | the module file of a feature or processor, the shell of a global module and the shell of a common module |

`spec/architecture/common-modules.spec.ts` holds the cases that every app may import any core
entity, contract and module in those layers.

**An entity of one app needs no rule of its own.** An entity that only one app maps lives in
`apps/<app>/src/common/entities` (category `acme-app:common:entities`). Only the infrastructure,
the `app/` folder and the e2e code of the same app may import it, so another app cannot reach it.
An entity that several apps map stays in `core/entities`.

**Code needs no rule of its own.** An app may import only its own contracts and common modules, so
one app cannot reach the contracts or common modules of another.

**A relation registers its target.** TypeORM needs the target of every relation in the entity list
of the connection, so the entity list of every app that maps an entity lists its targets too, and
the spec of a query builder registers them on its data source.

**An app without claims mounts `AuthLibModule` alone**, so no claim guard runs there (see
`002-global-auth-guards.md`). `lint/boundaries/policies/customer-claims.mjs` refuses in customer-app
the decorators that would be silently ignored: `AuthClaimsLibModule`, `@RequiresPermission`,
`RoleEnum` and `PermissionCodeEnum`.
