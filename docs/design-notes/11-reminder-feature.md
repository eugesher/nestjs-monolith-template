# 11 — Reminder feature

`apps/client-api/src/features/reminder` keeps the reminders of each owner and a summary of them:
how many are pending and when the next one is due. This note covers the `ReminderModel` aggregate,
ownership, optimistic concurrency and the cache-aside summary.

## The aggregate

`ReminderModel` walks `pending → done`. Completing or moving a reminder bumps `version`, and a done
reminder refuses every further change with `REMINDER_ALREADY_DONE`.

| Rule | Code |
| --- | --- |
| `title` is 1 to 255 characters after trimming | `REMINDER_TITLE_INVALID` |
| `body` is at most 2000 characters after trimming, empty is fine | `REMINDER_BODY_INVALID` |
| `dueOn` is a real calendar date written `YYYY-MM-DD` | `REMINDER_DUE_ON_INVALID` |
| `version` is a positive integer | `REMINDER_VERSION_INVALID` |

**`dueOn` is a calendar date, not an instant.** It has no time and no zone, so it stays a string
from the request to the `date` column. The model refuses a string with a time and a date that does
not exist, such as `2026-02-30`.

**Moving a reminder to its current date changes nothing.** It keeps the version, and the write
service does not touch the database.

**The id is a string**, like the item id: the column is `bigint unsigned`.

The aggregate records no events. Nothing outside the feature reacts to a reminder.

## Ownership

`ReminderAccessService` loads a reminder or refuses it: a missing reminder is `REMINDER_NOT_FOUND`
(404), and a reminder of another owner is `REMINDER_ACCESS_FORBIDDEN` (403). The `ownerId` is
always required. Unlike items, reminders have no admin path: every caller sees only their own.

Listing and the summary take the owner as a required filter, so no query can return the reminders
of everyone.

## Optimistic concurrency

`ReminderWriteService.write(command, mutate)` changes a stored reminder the same way
`ItemWriteService` changes an item: it loads the reminder fresh, applies `mutate`, and saves with
`UPDATE … WHERE version = <as read>`. The repository answers a lost race with `false`, and the
service turns it into `ReminderWriteConflictError` for `OccRetryHelper`.

The budget is `REMINDER_OCC_RETRY_ATTEMPTS`. A spent budget is `VERSION_MISMATCH` (409) with
`details.currentVersion`. There is no `If-Match`: a reminder has nothing a client could overwrite
by mistake, because completing and moving are the only changes.

## The summary

`ReminderGetSummaryUseCase` answers `{ pending, nextDueOn }` through `REMINDER_SUMMARY_PORT`:

```ts
summary.read({ ownerId, compute: () => repository.summarize(ownerId) })
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
