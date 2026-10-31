# 04 — User and role features

Two modules of the `identity` group of staff-app manage the back office of staff users (see
`27-feature-groups.md`):

| Module                           | Endpoints                                                      |
| -------------------------------- | -------------------------------------------------------------- |
| `features/identity/modules/user` | `POST /identity/users`, `POST /identity/users/:userId/roles`   |
| `features/identity/modules/role` | `GET /identity/roles`, `PUT /identity/roles/:role/permissions` |

No other module manages users or roles, so each module owns its code (see `26-code-placement.md`):
one use case per endpoint and one repository port per use case. `user` has `UserStaffUserModel`
over `staff_user` and `staff_user_roles`, `role` has `RoleModel` and `RolePermissionModel` over
`staff_role`, `staff_permission` and `staff_role_permissions`. Each module registers only the
entities it reads in its `TypeOrmModule.forFeature`.

The modules manage staff only: a customer signs up on their own through `POST /auth/register` of
customer-app (see `03-auth-feature.md`).

## Only staff-app has them

**customer-app cannot even read the staff tables.** The lint policy `user-entities.mjs` refuses the
`Staff*` entities anywhere in customer-app, so copying a module there fails the lint before it can
fail a review. Over HTTP, `/identity/*` on customer-app is a 404, not a 403: the route does not
exist, and the answer does not confirm that it exists elsewhere.

## Three permission codes, on purpose

| Endpoint                                                    | Permission        |
| ----------------------------------------------------------- | ----------------- |
| `POST /identity/users`                                      | `iam:user-create` |
| `POST /identity/users/:userId/roles`, `GET /identity/roles` | `iam:assign`      |
| `PUT /identity/roles/:role/permissions`                     | `iam:role-edit`   |

Creating a principal, granting a role and redefining what a role means are separate privileges.
With one shared code, anyone allowed to grant a role could also mint users or rewrite `viewer` to
include everything. Reading roles goes with `iam:assign`, because whoever grants a role needs to see
what it carries. The codes keep the `iam:` prefix: they are stored in `staff_permission` and
granted by the seeds, so renaming them is a data migration, not a refactoring.

## Behavior worth knowing

- **Granting a role answers 200.** The endpoint creates nothing, so it uses `@HttpCode(200)`, and the
  OpenAPI document says the same.
- **Replacing permissions replaces them.** `PUT` sends the full set, and an empty list is rejected by
  the DTO. An unknown code is a 400 (`AUTH_PERMISSION_NOT_FOUND`), not a silently ignored grant.
- **A change of permissions applies to the next request.** Tokens carry no permissions, and
  `AuthPermissionsGuard` reads the codes from the database on every gated route (see
  `02-global-auth-guards.md`). A token that passed a moment before the `PUT` is refused right after
  it, with no re-login.
- **Unknown role or user is a 404.** The path `:role` is not validated against `RoleEnum` in
  presentation: the use case looks the role up and answers `AUTH_ROLE_NOT_FOUND`.
- **Refusals reuse the auth pattern.** Each module has its own domain exception and filter,
  `UserDomainException` with `UserHttpExceptionFilter` and `RoleDomainException` with
  `RoleHttpExceptionFilter`. Both filters map the codes with the same status table and delegate to
  the shared `HttpExceptionFilter`.
