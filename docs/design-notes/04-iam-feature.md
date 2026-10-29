# 04 — IAM feature

`apps/staff-app/src/features/iam` is the back office over identity: `POST /iam/users`,
`POST /iam/users/:userId/roles`, `GET /iam/roles` and `PUT /iam/roles/:role/permissions`. It has
the same layers as `session` (see `03-session-feature.md`): one use case per endpoint,
`IAM_IDENTITY_PORT`, and `IamIdentityCoreAdapter` over `IDENTITY_CORE_ADMIN_PORT`.

## Only staff-app has it

**customer-app cannot even import the admin port.** The lint policy `identity-admin.mjs` forbids
`IDENTITY_CORE_ADMIN_PORT` and `IIdentityCoreAdminPort` anywhere in customer-app, so copying the
feature there fails the lint before it can fail a review. Over HTTP, `/iam/*` on customer-app is a
404, not a 403: the route does not exist, and the answer does not confirm that it exists elsewhere.

## Three permission codes, on purpose

| Endpoint                                          | Permission        |
| ------------------------------------------------- | ----------------- |
| `POST /iam/users`                                 | `iam:user-create` |
| `POST /iam/users/:userId/roles`, `GET /iam/roles` | `iam:assign`      |
| `PUT /iam/roles/:role/permissions`                | `iam:role-edit`   |

Creating a principal, granting a role and redefining what a role means are separate privileges.
With one shared code, anyone allowed to grant a role could also mint users or rewrite `viewer` to
include everything. Reading roles goes with `iam:assign`, because whoever grants a role needs to see
what it carries.

## Behavior worth knowing

- **Granting a role answers 200.** The endpoint creates nothing, so it uses `@HttpCode(200)`, and the
  OpenAPI document says the same.
- **Replacing permissions replaces them.** `PUT` sends the full set, and an empty list is rejected by
  the DTO. An unknown code is a 400 (`AUTH_PERMISSION_NOT_FOUND`), not a silently ignored grant.
- **Unknown role or user is a 404.** The path `:role` is not validated against `RoleEnum` in
  presentation: identity looks the role up and answers `AUTH_ROLE_NOT_FOUND`.
- **Refusals reuse the session pattern.** The core adapter rethrows identity refusals as
  `IamDomainException`, and `IamHttpExceptionFilter` maps them with the same status table and
  delegates to the shared `HttpExceptionFilter`.
