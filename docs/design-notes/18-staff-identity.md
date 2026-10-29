# 18 — Staff identity

`core/modules/src/staff-identity` owns the accounts of the people who run the business: their
credentials, their roles and what each role permits. Its contract
`core/contracts/src/staff-identity` has two ports:

| Port                               | Facade                           | Consumer                                       |
| ---------------------------------- | -------------------------------- | ---------------------------------------------- |
| `STAFF_IDENTITY_CORE_SESSION_PORT` | `StaffIdentityCoreSessionFacade` | login, the global auth guards                  |
| `STAFF_IDENTITY_CORE_ADMIN_PORT`   | `StaffIdentityCoreAdminFacade`   | the back office that registers users and roles |

The whole module belongs to staff-app: the lint policy `identity-modules.mjs` refuses its
contracts, its module and its `Staff*` entities anywhere in customer-app, which has a module of its
own (see `19-customer-identity.md`).

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

## What the module shares

**Password hashing and token signing come from `libs/credentials`.** The module imports
`CredentialsLibModule`, and its use cases inject `CREDENTIALS_PASSWORD_HASHER_PORT` and
`CREDENTIALS_ACCESS_TOKEN_PORT` from `@acme-libs/contracts/credentials`. `customer-identity` does the
same, so both kinds of account are hashed and signed by one piece of code, each with the
`AUTH_ARGON2_*` and `JWT_*` values of its own app (see `19-customer-identity.md`).

**The kernel enums are staff vocabulary.** `RoleEnum` lists staff roles and `PermissionCodeEnum`
lists the codes those roles grant: `ledger:read`, the three `iam:*` codes and the two `note:*`
codes. A customer holds none of them. `IdentityErrorCodeEnum` and `UserStatusEnum` are shared by
both identity modules.
