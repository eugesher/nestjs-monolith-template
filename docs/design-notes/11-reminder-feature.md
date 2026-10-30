# 11 — Reminder feature

`apps/staff-app/src/features/reminder` is the per-owner list behind `/reminders`, with a summary of
it: how many reminders are pending and when the next one is due. This note covers the
`ReminderModel` aggregate, ownership, optimistic concurrency, the cache-aside summary, the
persistence and the HTTP surface.

## The aggregate

`ReminderModel` walks `pending → done`. Completing or moving a reminder bumps `version`, and a done
reminder refuses every further change with `REMINDER_ALREADY_DONE`.

| Rule                                                            | Code                       |
| --------------------------------------------------------------- | -------------------------- |
| `title` is 1 to 255 characters after trimming                   | `REMINDER_TITLE_INVALID`   |
| `body` is at most 2000 characters after trimming, empty is fine | `REMINDER_BODY_INVALID`    |
| `dueOn` is a real calendar date written `YYYY-MM-DD`            | `REMINDER_DUE_ON_INVALID`  |
| `version` is a positive integer                                 | `REMINDER_VERSION_INVALID` |

**`dueOn` is a calendar date, not an instant.** It has no time and no zone, so it stays a string
from the request to the `date` column. The model refuses a string with a time and a date that does
not exist, such as `2026-02-30`.

**Moving a reminder to its current date changes nothing.** It keeps the version, and the write
service does not touch the database.

**The id is a string**, like the product id: the column is `bigint unsigned`.

The aggregate records no events. Nothing outside the feature reacts to a reminder.

## Ownership

`ReminderAccessService` loads a reminder of the caller or refuses it with `REMINDER_NOT_FOUND`
(404): a missing reminder and a reminder of another staff user get the same answer, so an id never
reveals whether someone else's reminder exists. The `ownerId` is always required. The owner is the
staff user who created the reminder. Reminders and notes are the ownership examples of the template
(see `12-note-feature.md`): products are a shared catalog (see `08-product-feature.md`).

Listing and the summary take the owner as a required filter, so no query can return the reminders
of everyone.

**Ownership replaces permissions.** No route of the feature names a permission: a reminder is the
private record of one staff user, so any signed-in staff user works with their own reminders and
never sees anyone else's.

**`owner_id` has no foreign key.** `reminder` belongs to its feature and `staff_user` to the
modules that sign staff in and manage them. A foreign key across modules would tie the migrations and the deletes of one module
to the tables of another. The owner is checked where it is set: it is the subject of a verified
token that `validateSubject` accepted.

## Optimistic concurrency

`ReminderWriteService.write(command, mutate)` changes a stored reminder the same way
`ProductWriteService` changes a product: it loads the reminder fresh, applies `mutate`, and saves with
`UPDATE … WHERE version = <as read>`. The repository answers a lost race with `false`, and the
service turns it into `ReminderWriteConflictError` for `OccRetryHelper`.

The budget is `REMINDER_OCC_RETRY_ATTEMPTS`. A spent budget is `VERSION_MISMATCH` (409) with
`details.currentVersion`. There is no `If-Match`: a reminder has nothing a client could overwrite
by mistake, because completing and moving are the only changes.

## The summary

`ReminderGetSummaryUseCase` answers `{ pending, nextDueOn }` through `REMINDER_SUMMARY_PORT`:

```ts
summary.read({ ownerId, compute: () => repository.summarize(ownerId) });
```

**The use case knows how to compute the summary, the port knows how to cache it.** The use case
has no key, no TTL and no branch on a hit or a miss. The port's adapter has no repository: it calls
`compute` on a miss. The repository port belongs to the use case, so the summary follows the rule
of one repository per consumer like everything else.

**Every write invalidates the summary after it.** `ReminderCreateUseCase`,
`ReminderCompleteUseCase`, `ReminderRescheduleUseCase` and `ReminderDeleteUseCase` call
`summary.invalidate(ownerId)` once their write has returned. A write that fails or is refused
invalidates nothing. A write is one statement, so "after the write" is "after the commit".

**Invalidation does not fail a write.** The cache lib's `delByPrefix` logs a failure and answers 0
instead of throwing, so the use cases call `invalidate` without a guard. The stale summary then
expires on its TTL, `REMINDER_SUMMARY_TTL_MS`.

The page of reminders is not cached. A key per owner, page, size and status filter would give each
write as many keys to invalidate as there are queries.

## Logs

A write logs its outcome at `info` after the work: `Reminder created`, `Reminder completed`,
`Reminder rescheduled` or `Reminder deleted`. A lost race logs at `info` and a spent budget at
`warn`. Reads log nothing.

## Persistence

Each repository port has its own repository: `ReminderAccessRepository`, `ReminderCreateRepository`,
`ReminderCrudRepository`, `ReminderDeleteRepository`, `ReminderGetSummaryRepository` and
`ReminderWriteRepository`. The access and write repositories share `findById` through
`ReminderFindByIdBaseRepository`. Every repository reads the `reminder` table through
`TransactionHost`.

**A deleted reminder is gone for every read.** `softDelete` sets `deleted_at`, and TypeORM adds
`deleted_at IS NULL` to every find and query builder on the entity, so the access service answers
`REMINDER_NOT_FOUND` for it and neither the list nor the summary counts it.

**The version check is in the `WHERE`**, as for products: `update` writes `due_on`, `status` and
`version` where the id and the version as read match, and answers whether one row changed.

`list` returns the reminders of one owner, soonest first and then by id, optionally of one status.

`summarize` is one aggregate query over the pending reminders of the owner.

**A `date` column never becomes a JavaScript `Date`.** With `timezone: 'Z'`, mysql2 reads a `date` as
midnight UTC, and TypeORM turns it back into a string with the local getters of the process. East
of UTC that gives the right day; west of it, the day before, and the next write stores that earlier
day, so the reminder walks back a day on every change. Both apps set `dateStrings: ['DATE']`, so
the driver hands over `YYYY-MM-DD` as it is, for entities and for raw rows such as the earliest
date of the summary.

## The cache adapter

`ReminderSummaryCacheAdapter` binds `REMINDER_SUMMARY_PORT` to `CACHE_PORT`:

| Port call                    | Cache call                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `read({ ownerId, compute })` | `wrap(CACHE_KEYS.reminderSummary(ownerId), REMINDER_SUMMARY_TTL_MS, compute)` |
| `invalidate(ownerId)`        | `delByPrefix(CACHE_KEYS.reminderSummaryPrefix(ownerId))`                      |

The keys are `acme:reminders:summary:v1:<ownerId>:__all__` and its prefix without `__all__`.
`REMINDER_SUMMARY_TTL_MS` comes from `CACHE_TTL_MS_DEFAULT`, 60 seconds by default.

**The adapter adds nothing to the cache lib.** `wrap` already shares one computation among
concurrent misses of a key, and computes without caching when Redis fails, so the adapter has no
single-flight and no fallback of its own. It logs nothing either: the cache lib logs its failures.

## HTTP

| Method and path                       | Answer                        |
| ------------------------------------- | ----------------------------- |
| `POST /reminders`                     | 201, the reminder             |
| `GET /reminders`                      | 200, a page of reminders      |
| `GET /reminders/summary`              | 200, `{ pending, nextDueOn }` |
| `PATCH /reminders/:reminderId/done`   | 200, the reminder             |
| `PATCH /reminders/:reminderId/due-on` | 200, the reminder             |
| `DELETE /reminders/:reminderId`       | 204                           |

**Every route needs a staff token, no permission, and is scoped to the caller.** The controller
always passes the caller's own id as `ownerId`.

**`dueOn` is checked twice.** The DTO refuses anything that is not written `YYYY-MM-DD`, such as an
instant, with a 400 from validation. A well-formed date that does not exist, such as `2026-02-30`,
reaches the model and is refused there as `REMINDER_DUE_ON_INVALID`, also a 400.

`reminderId` is a string of 1 to 20 digits without a leading zero, checked by
`ReminderIdRequestDto`, like `productId`.

### Errors

`ReminderHttpExceptionFilter` maps the domain codes to statuses and hands the response to the
`HttpExceptionFilter` of `libs/http`, with the same body as products.

| Code                                                                                                     | Status |
| -------------------------------------------------------------------------------------------------------- | ------ |
| `REMINDER_TITLE_INVALID`, `REMINDER_BODY_INVALID`, `REMINDER_DUE_ON_INVALID`, `REMINDER_VERSION_INVALID` | 400    |
| `REMINDER_NOT_FOUND`                                                                                     | 404    |
| `REMINDER_ALREADY_DONE`, `VERSION_MISMATCH`                                                              | 409    |

## Wiring

`ReminderModule` imports `ReminderTypeOrmModule.forFeature()`, binds every port with
`{ provide, useClass }` and reads `REMINDER_OCC_RETRY_ATTEMPTS` from `OCC_RETRY_ATTEMPTS` and
`REMINDER_SUMMARY_TTL_MS` from `CACHE_TTL_MS_DEFAULT`. The app's entity list includes `Reminder`.
`CACHE_PORT` comes from the global `CacheModule` of `libs/cache`.
