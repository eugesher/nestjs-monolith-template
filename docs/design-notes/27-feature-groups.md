# 27 — Feature groups

The features of staff-app that belong to one business area sit in a group: a parent module that
mounts its child modules and holds no code of its own.

| Group      | Modules                | Routes                                                 |
| ---------- | ---------------------- | ------------------------------------------------------ |
| `identity` | `auth`, `role`, `user` | `/identity/auth`, `/identity/roles`, `/identity/users` |
| `tools`    | `note`, `reminder`     | `/tools/notes`, `/tools/reminders`                     |
| `catalog`  | `product`              | `/catalog/products`                                    |
| `sales`    | `order`                | `/sales/orders`                                        |

`health` and `ledger` stay top-level features. customer-app has no groups.

## Layout

```text
apps/staff-app/src/features/
  index.ts
  identity/
    identity.module.ts
    modules/
      index.ts
      auth/
        auth.module.ts
        domain/ outbound/ application/ infrastructure/ presentation/
      role/
      user/
```

**The parent module only mounts.** `IdentityModule` imports `AuthModule`, `RoleModule` and
`UserModule` and declares nothing. `features/index.ts` exports the parents, and `AppModule` imports
`IdentityModule`, not its children.

**A child module is a feature.** It has the same layers and the same lint rules as a top-level
feature: the categories match `features/{*,*/modules/*}/<layer>`, so a child domain stays
framework-free and a child application cannot reach its presentation. The parent root reaches its
children only through `modules/index.ts`, and `modules/index.ts` re-exports only the Nest modules of
its own children (see `spec/architecture/nested-features.spec.ts`).

**A child keeps its own name.** The classes of `identity/modules/role` carry the `Role` prefix, not
`IdentityRole`: the group is a folder, not a context. Two children of different groups with one
name would need a prefix; none exist.

## Routes and tags

**The group is the first segment of the route.** Each controller states the full path,
`@Controller('identity/roles')`, rather than mounting a prefix through `RouterModule`: the path of
an endpoint reads in one place, and an e2e case or a Posting request matches the controller as is.

**The OpenAPI tag is `Group/Module`**, as `Identity/Role` or `Catalog/Product`, so the reference
page lists the modules of a group together.

## Tests and requests follow the groups

- The e2e sections sit in `apps/staff-app/test/features/<group>/<module>/<module>.e2e.ts`, and
  `app.e2e-spec.ts` nests a `describe` per group around the `describe` of each module (see
  `15-e2e-suites.md`).
- The Posting requests sit in `.http/staff-app/<group>/<module>/<endpoint>/`, and the first line of
  a description names the e2e test with the group in it.
