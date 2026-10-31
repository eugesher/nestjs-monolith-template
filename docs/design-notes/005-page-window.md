# 005 — Page window

A paged read takes `page` and `size`, and the use case owns the limits.

| Part     | Example                                                                                    |
| -------- | ------------------------------------------------------------------------------------------ |
| DTO      | `apps/staff-app/src/features/ledger/presentation/dto/`                                     |
| use case | `apps/staff-app/src/features/ledger/application/use-cases/ledger-list-entries.use-case.ts` |
| helper   | `PaginationHelper.clampPageWindow` in `libs/toolkit`                                       |

**The DTO checks the type, the use case the limits.** The DTO accepts positive integers, and the
use case applies the defaults (page 1, size 20) and caps `size` at 100 with
`PaginationHelper.clampPageWindow`. A size above the cap is capped, not rejected, and the response
echoes the window it used.

**A read-only module has no domain.** `apps/staff-app/src/features/ledger` refuses nothing by code,
so it has no domain exception and no exception filter.

**Ids of `bigint unsigned` are strings** from the row to the response, because they may exceed the
safe integer range of a JavaScript number. Instants are ISO strings in UTC.

**A mounted module registers its entities**, and the app's TypeORM entity list includes them,
because a module needs its entity registered on the app's connection.
