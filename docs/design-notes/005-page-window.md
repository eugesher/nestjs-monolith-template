# 005 — Page window

A paged read takes `page` and `limit`, and the use case owns the bounds.

| Part     | Example                                                                                    |
| -------- | ------------------------------------------------------------------------------------------ |
| DTO      | `apps/staff-app/src/features/ledger/presentation/dto/`                                     |
| use case | `apps/staff-app/src/features/ledger/application/use-cases/ledger-list-entries.use-case.ts` |
| helper   | `PaginationHelper.clampPageWindow` in `libs/toolkit`                                       |

**The DTO checks the type, the use case the limits.** The DTO accepts positive integers through
`@IsInt()` and `@IsPositive()`, not `@Min(1)`, and the use case applies the defaults (page 1,
limit 20) and caps `page` at 1000 and `limit` at 100 with `PaginationHelper.clampPageWindow`. A
value above the cap is capped, not rejected, and the response echoes the window it used.

**The helper computes the offset.** `clampPageWindow` answers `{ page, limit, offset }`, and the
repository passes `offset` and `limit` to the query as they are. The page cap keeps the offset under
100 000: `@IsInt()` accepts `1e20`, whose offset JavaScript prints as `1e+22`, which MySQL rejects
as a syntax error. It also bounds the cache of the customer catalog, which keeps one key per page
and limit (see `020-cross-app-cache-invalidation.md`).

**A read-only module refuses nothing.** `apps/staff-app/src/features/ledger` has no domain exception
and no exception filter. Its domain holds only the read model `LedgerEntryModel`: the use case
rebuilds each record of the page and answers its snapshot (see `035-enums-and-response-dtos.md`).

**Ids of `bigint unsigned` are strings** from the row to the response, because they may exceed the
safe integer range of a JavaScript number. Instants are ISO strings in UTC.

**The app lists the entities of the modules it mounts** in `app/entities` and hands them to
`OrmModule.forRoot`, because a repository reads only an entity registered on the connection.
