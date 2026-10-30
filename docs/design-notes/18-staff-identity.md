# 18 — Staff identity

The accounts of the people who run the business, their credentials, their roles and what each role
permits, live in staff-app. No single module owns them: each part sits with the module that uses
it (see `26-code-placement.md`).

| Part                              | Module                | Entry point                            |
| --------------------------------- | --------------------- | -------------------------------------- |
| login                             | `features/auth`       | `AuthLoginUseCase`                     |
| users, roles and permissions      | `features/iam`        | the four `Iam*UseCase`                 |
| the subject of a token, its roles | `common/modules/auth` | `AUTH_COMMON_PORT.validateSubject`     |
| the permission codes of a user    | `app/global/auth`     | `AuthGlobalFindPermissionCodesUseCase` |

**The subject check is the one shared part.** `GET /auth/me` and the global guards both ask who
the user of a token is and which roles they hold, so `validateSubject` lives in the common module
`auth` (`@acme-staff-common/modules/auth`), behind `AUTH_COMMON_PORT` in
`@acme-staff-contracts/auth`. The feature reaches it through `AuthIdentityCommonAdapter`, the
global module through `AuthGlobalSubjectCommonAdapter`, behind its port `AUTH_GLOBAL_SUBJECT_PORT`.

**The `Staff*` entities belong to staff-app.** The lint policy `user-entities.mjs` refuses them
anywhere in customer-app, which keeps its own customers (see `19-customer-identity.md`).

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
`core/entities/src/staff-identity/`, next to the entities of other modules, as the schema of one
database does, and the `Staff` prefix tells an account of staff apart from any other principal in
every import.

## What the parts share

**Password hashing and token signing come from `libs/credentials`.** The features `auth` and `iam`
import `CredentialsLibModule`, and their use cases inject `CREDENTIALS_PASSWORD_HASHER_PORT` and
`CREDENTIALS_ACCESS_TOKEN_PORT` from `@acme-libs/contracts/credentials`. The `auth` feature of
customer-app does the same, so both kinds of account are hashed and signed by one piece of code,
each with the `AUTH_ARGON2_*` and `JWT_*` values of its own app (see `19-customer-identity.md`).

**Each part keeps its own model of a staff user.** `AuthStaffUserModel` knows the password hash and
the status, `IamStaffUserModel` registers users and assigns roles, `AuthCommonStaffUserModel` knows
the status and the roles. They read the same `staff_user` table and share only the kernel enums.

**The kernel enums are staff vocabulary.** `RoleEnum` lists staff roles and `PermissionCodeEnum`
lists the codes those roles grant: `ledger:read`, the three `iam:*` codes, the four `product:*`
codes and `order:read`. A customer holds none of them. `IdentityErrorCodeEnum` and
`UserStatusEnum` are shared by both apps.

## A taken email

**The unique index answers whether an email is taken.** `IamRegisterUserRepository`
inserts the user without looking the email up first and turns a duplicate-key error on
`uq_staff_user_email` into `AUTH_EMAIL_TAKEN`. A lookup first would leave a window between the two
statements in which a second registration with the same email passes too and then fails with 500.
The roles are inserted after the user in the same transaction, so a refused registration leaves no
rows behind. The `auth` feature of customer-app registers customers the same way.
