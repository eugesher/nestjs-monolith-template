# 18 — Staff identity

`core/modules/src/staff-identity` owns the accounts of the people who run the business: their
credentials, their roles and what each role permits. Its contract
`core/contracts/src/staff-identity` has two ports:

| Port                               | Facade                           | Consumer                                       |
| ---------------------------------- | -------------------------------- | ---------------------------------------------- |
| `STAFF_IDENTITY_CORE_SESSION_PORT` | `StaffIdentityCoreSessionFacade` | login, the global auth guards                  |
| `STAFF_IDENTITY_CORE_ADMIN_PORT`   | `StaffIdentityCoreAdminFacade`   | the back office that registers users and roles |

The admin port belongs to staff-app alone: the lint policy `staff-identity-admin.mjs` refuses it
anywhere in customer-app (see `04-iam-feature.md`). customer-app has no identity module of its own
yet, so its login and its guards call the session port of `staff-identity` too.

## Every table carries the `staff_` prefix

| Entity                | Table                    | Keys                                                                     |
| --------------------- | ------------------------ | ------------------------------------------------------------------------ |
| `StaffUser`           | `staff_user`             | `uq_staff_user_email`                                                    |
| `StaffRole`           | `staff_role`             | `uq_staff_role_name`                                                     |
| `StaffPermission`     | `staff_permission`       | `uq_staff_permission_code`                                               |
| `StaffUserRole`       | `staff_user_roles`       | `fk_staff_user_roles_user`, `fk_staff_user_roles_role`                   |
| `StaffRolePermission` | `staff_role_permissions` | `fk_staff_role_permissions_role`, `fk_staff_role_permissions_permission` |

**The prefix names the owner.** A bare `role` or `permission` table reads as access control for
every principal of the system. Roles and permissions belong to staff only, so the tables say so,
and a reader of the schema sees the five tables of one module as one group. Indexes and foreign
keys repeat the table name, so a constraint error in a log points at the module at once.

**`staff_user` needs no quoting.** `user` is a reserved word in MySQL, and every raw query against
it needed backticks. The prefixed name is a plain identifier in migrations, seeds and test queries.

**The entities are named after their tables.** The entities live in
`core/entities/src/staff-identity/`, next to the entities of other modules, and the `Staff` prefix tells
an account of staff apart from any other principal in every import.

## What stays inside the module

**Password hashing and token signing are adapters of the module.** `StaffIdentityCorePasswordHasherAdapter`
wraps argon2 and `StaffIdentityCoreAccessTokenAdapter` signs `{ sub }` with `JWT_SECRET`. Both sit
behind outbound ports in `infrastructure`. While one module uses them, a shared lib would only add
an indirection.

**The kernel enums are staff vocabulary.** `RoleEnum` lists staff roles and `PermissionCodeEnum`
lists the codes those roles grant. The codes for items and reminders are still there, because the
customer-app routes still check them.
