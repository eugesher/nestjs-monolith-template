# 028 — Subject tags

Staff mark products and orders with tags from one dictionary. The feature is the reference common
module of the template: two modules of staff-app call the same facade methods, so the code sits in
`apps/staff-app/src/common/modules/tag` (see `024-code-placement.md`).

| Part                             | Where                                           | Who calls it                     |
| -------------------------------- | ----------------------------------------------- | -------------------------------- |
| the dictionary, `tag`            | `apps/staff-app/src/features/tools/modules/tag` | `/tools/tags`                    |
| the links, `subject_tag`         | `apps/staff-app/src/common/modules/tag`         | staff `product`, staff `order`   |
| the contract of the links        | `apps/staff-app/src/contracts/tag`              | the common-adapters of callers   |
| the entities `Tag`, `SubjectTag` | `apps/staff-app/src/common/entities/tag`        | both modules, each its own model |

## Routes

| Route                            | Permission      | Does                                               |
| -------------------------------- | --------------- | -------------------------------------------------- |
| `POST /tools/tags`               | `tag:write`     | creates a tag; a taken name answers 409            |
| `GET /tools/tags`                | `tag:read`      | a page of tags by name                             |
| `PATCH /tools/tags/:tagId`       | `tag:write`     | renames a tag; the links keep pointing at it       |
| `DELETE /tools/tags/:tagId`      | `tag:write`     | deletes a tag; `ON DELETE CASCADE` drops its links |
| `GET /catalog/products/:id/tags` | `product:read`  | the tags of a product, by name                     |
| `PUT /catalog/products/:id/tags` | `product:write` | replaces them with `{ tagIds }`                    |
| `GET /catalog/products?tagId=`   | `product:read`  | only the products that carry the tag               |
| `GET /sales/orders/:id/tags`     | `order:read`    | the tags of an order, by name                      |
| `PUT /sales/orders/:id/tags`     | `order:write`   | replaces them with `{ tagIds }`                    |
| `GET /sales/orders?tagId=`       | `order:read`    | only the orders that carry the tag                 |

## Schema

`tag` holds the name under `uq_tag_name`. The collation is case-insensitive, so `Fragile` and
`fragile` are one name. `subject_tag` links a subject to a tag by `tagId`: `subject_type` names the
caller (`TagCommonSubjectTypeEnum`), `subject_id` is its key, and a rename touches no link.
`uq_subject_tag_subject_tag (subject_type, subject_id, tag_id)` keeps a link single, and
`idx_subject_tag_tag (tag_id, subject_type, subject_id)` serves both the foreign key and the filter.
No foreign key points at the subject, since the table serves several; the caller checks the subject.

## Two modules over one table

**The dictionary is a feature, the links are a common module.** Only `/tools/tags` creates, renames
and deletes tags, so that code stays with its only caller. Reading the tags of a subject, replacing
them and finding the subjects of a tag are asked by both `product` and `order`, so they move up into
the common module. `Tag` is mapped by both; each keeps its own model narrowed to what it uses
(`TagModel`, `TagCommonSubjectTagsModel`).

**A refusal is an outcome.** `replace` answers `TagCommonReplaceOutcomeEnum.TAG_NOT_FOUND` with
`missingTagIds` instead of throwing, as a core module does (see `027-core-module-outcomes.md`). The
common-adapter of each caller maps it with a `Record` over every value, and the caller throws its
own `PRODUCT_TAG_NOT_FOUND` or `ORDER_TAG_NOT_FOUND`, answered as 422 with `details.missingTagIds`.

## The caller owns the transaction

`ProductReplaceTagsUseCase` and `OrderReplaceTagsUseCase` open a transaction, lock their own row
`FOR UPDATE` and call `replace` inside it. `TagCommonReplaceUseCase` runs in `TRANSACTION_PORT.run`,
so it joins that transaction (see `026-transaction-port.md`), and a refusal of the caller after it
rolls the links back too.

**The lock of the subject serializes the writers of its links.** The common module owns no row of
the subject. Two replaces of one subject without that lock would both read the links, take
compatible gap locks on an empty range and deadlock on insert. With it, the second waits for the
first to commit. Inside, `replace` reads the tags `FOR SHARE`, so a concurrent delete of a tag waits
instead of breaking the foreign key of a new link.

## The filter

`?tagId=` asks the facade for the subject ids that carry the tag, then lists its own table with
`WHERE id IN (...)`. No repository of `product` or `order` joins `subject_tag`: that table belongs
to the common module, and the lint forbids reaching it. A tag no subject carries answers an empty
page without a query. The id list grows with the tagged subjects; a catalog where one tag marks tens
of thousands of rows needs a paged lookup instead.
