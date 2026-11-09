# 035 — Enums and response DTOs

A closed set of values is an enum, never a union of string literals. A lone literal joins the enum
it belongs to: the liveness answer is `HealthLivenessStatusEnum.OK`, a replayed claim is
`ProductIdempotencyOutcomeEnum.REPLAY`.

## Where an enum lives

An enum lives with the narrowest code that reads all of its values:

| Folder                                  | What it holds                                         | Example                                                                |
| --------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| `domain/enums`                          | the exception codes of a module                       | `ProductExceptionCodeEnum`                                             |
| `outbound/enums`                        | the outcomes of a port of the module                  | `ProductStatusArchiveOutcomeEnum`                                      |
| `core/contracts/src/<module>/enums`     | the outcomes and kinds a core module answers or takes | `ProductCoreArchiveOutcomeEnum`                                        |
| `apps/<app>/src/contracts/<name>/enums` | the same for a common module of the app               | `TagCommonReplaceOutcomeEnum`, `TagCommonSubjectTypeEnum`              |
| `libs/kernel`                           | a vocabulary of several layers, modules or apps       | `PermissionCodeEnum`, `ProductStatusEnum`, `HealthReadinessStatusEnum` |
| `libs/<lib>/src/enums`                  | what only the lib reads                               | `AuthMetadataKeyEnum`                                                  |

**An outcome stays with its port.** The outcome of a core module lives in its contract, not in the
kernel, because only the core-adapters read it (see `006-idempotency-keys.md` and
`027-core-module-outcomes.md`). A feature names its own outcome in `outbound/enums`, and the
core-adapter maps one into the other.

**The kernel holds what a column stores.** `ProductStatusEnum` is a column of a core entity read by
all three apps, `IdempotencyStatusEnum` a column of `idempotency_key`, `PermissionCodeEnum` a column
of `staff_role_permissions`. A role is not an enum: the names live in `staff_role`, no code branches
on one, and a new role needs no release. The health statuses are in the kernel because both the
health lib and the health features of the apps name them.

**An enum is never copied between a lib and an app.** The app imports the kernel enum the lib
answers with, so a new value reaches both at once.

## Response DTOs

**A nested DTO is a class of the outer file and is not exported.** Only the DTO a controller returns
is exported, so a nested class cannot be reused by another response and drift with it.

| Nested DTO                   | Name                    | Example                                     |
| ---------------------------- | ----------------------- | ------------------------------------------- |
| the element of an array      | `<Container>ItemDto`    | `OrderResponseItemDto` for `products`       |
| the value of an object field | `<Container><Field>Dto` | `QueueResponseJobCountsDto` for `jobCounts` |

`<Container>` is the name of the exported DTO without `Dto`. The field suffix is taken only by the
DTO of an object field: an array has one element type, so `Item` is enough. A DTO nested in a nested
one extends the name of its container, and fields that share one class are named by what they have
in common: `HealthReadinessResponseDependenciesDto` for `dependencies`, and inside it
`HealthReadinessResponseDependencyDto` for `database` and `cache`.

A nested name is unique within its app, not across the apps: customer-app and staff-app both have an
`OrderResponseItemDto`. Each app serves its own OpenAPI document, so the schemas never meet.

**A field that may be missing is always sent, with `null`.** The type is `T | null`, and the field
is declared with `@ApiProperty({ readOnly: true, nullable: true })`, because `@ApiResponseProperty`
takes no `nullable`. The client reads one shape and never checks for an absent key.

**An enum field names its enum in the schema**: `@ApiResponseProperty({ enum, example })`, so the
OpenAPI document lists the values and the client can generate the same enum.

## Domain interfaces

The interfaces of a domain lie in two folders, by the side of the model they are on:

| Folder                       | Kind        | What it is                                                    |
| ---------------------------- | ----------- | ------------------------------------------------------------- |
| `domain/interfaces/inputs/`  | `record`    | the row a model is rebuilt from, `Model.reconstitute(record)` |
|                              | `candidate` | the data a new row is checked against, `Model.createDraft`    |
|                              | `changes`   | the edits a model takes, `ProductModel.update(changes)`       |
| `domain/interfaces/outputs/` | `draft`     | the row `createDraft` answers for an insert                   |
|                              | `snapshot`  | the state a model answers with `toSnapshot()`                 |
|                              | `changes`   | the diff a model answers, `TagCommonSubjectTagsModel.replace` |

The direction is the type of the file and the kind ends its name: `product-record.input.ts` holds
`IProductRecordInput`, `auth-customer-draft.output.ts` holds `IAuthCustomerDraftOutput`, and
`tag-common-subject-tags-changes.output.ts` sets the diff of tags apart from
`product-changes.input.ts`. A part of an input or an output without a kind of its own takes the
direction alone: `order-stock.input.ts` is a field of `IOrderCandidateInput`,
`order-product.output.ts` an element of `IOrderSnapshotOutput`.
