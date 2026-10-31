# 12 — Note feature

`apps/staff-app/src/features/tools/modules/note` keeps back-office notes behind `/tools/notes`: free text that a staff
user attaches to any subject, edits, and finally resolves. Every edit keeps the body it replaced as a
revision. This note covers the `NoteModel` aggregate, the frozen `NoteRevisionModel`, and the one
write that spans two tables.

## The aggregate

`NoteModel` points at its subject with an opaque pair, `(subjectType, subjectId)`. Nothing checks
that the subject exists or what kind of thing it is: a note on a product and a note on a support
ticket are the same note. `resolved` closes a note for good.

| Rule                                             | Code                   |
| ------------------------------------------------ | ---------------------- |
| `subjectType` matches `^[a-z][a-z-]{1,63}$`      | `NOTE_SUBJECT_INVALID` |
| `subjectId` is 1 to 64 characters after trimming | `NOTE_SUBJECT_INVALID` |
| `body` is 1 to 4000 characters after trimming    | `NOTE_BODY_INVALID`    |
| `version` is a positive integer                  | `NOTE_VERSION_INVALID` |
| a resolved note refuses `edit` and `resolve`     | `NOTE_RESOLVED`        |

**An edit to the current body changes nothing.** It keeps the version, and the edit use case
writes nothing: no update and no revision.

**The id is a string**, like the product and reminder ids: the column is `bigint unsigned`.

A note belongs to its author. `NoteAccessService.loadOwned` refuses a missing note and a note of
another staff user with the same `NOTE_NOT_FOUND` (404), so an id never reveals whether someone
else's note exists, as for reminders (see `11-reminder-feature.md`). No route names a permission:
any signed-in staff user works with their own notes only.

## Revisions

`NoteRevisionModel` is one edit: the note, the version the edit produced, the body before and
after, the editor and the correlation id of the request. It is frozen, and its `noteVersion` is at
least 2, because version 1 is the note as created.

The edit use case reads the correlation id from `CorrelationContextHelper.current`, so the command
carries none.

## Editing writes two tables

`NoteEditUseCase` updates the `note` row and inserts the `note_revision` row in one transaction,
through one repository port:

```ts
interface INoteEditRepositoryPort {
  update(command: INoteWriteUpdateCommand): Promise<boolean>;
  appendRevision(revision: NoteRevisionModel): Promise<void>;
}
```

**The transaction comes from the context.** The use case wraps the two calls in
`TRANSACTION_PORT.run`, and the repository reads its connection from `TransactionHost`, so the two
statements share one transaction without passing anything to each other. A failed revision insert
fails `run`, and the note update rolls back with it.

**The read happens before the transaction, and the re-read after it.** One attempt is:

1. load the note and remember its version;
2. apply the edit; stop here if the version did not change;
3. in a transaction: update the note where the version is still the one read, then append the
   revision only if the update changed a row;
4. after the transaction: read the note again, and answer it or report the lost race.

The `WHERE version = <as read>` of step 3 makes a read inside the transaction unnecessary. Keeping
the re-read of step 4 outside matters: under `REPEATABLE READ`, a read inside the transaction that
lost the race would still see the snapshot from before the winner's commit, and would report a stale
`currentVersion`.

## Optimistic concurrency

`NoteWriteService` holds what editing and resolving share:

- `run(command, attempt)` retries `attempt` through `OccRetryHelper` on `NoteWriteConflictError`,
  with the budget `NOTE_OCC_RETRY_ATTEMPTS`. A spent budget is `VERSION_MISMATCH` (409) with
  `details.currentVersion`.
- `reload({ noteId, authorId, saved })` reads the note through `NoteAccessService` and answers it, or throws
  `NoteWriteConflictError` with its current version when `saved` is false.

Each use case runs its own attempt, because only editing appends a revision and opens a
transaction. Resolving is one statement and runs without one.

## Use cases

| Use case                  | Repository port                      | What it does                                                     |
| ------------------------- | ------------------------------------ | ---------------------------------------------------------------- |
| `NoteCreateUseCase`       | `NOTE_CREATE_REPOSITORY_PORT`        | inserts an unresolved note at version 1                          |
| `NoteGetOneUseCase`       | none, through `NoteAccessService`    | answers one note of the caller                                   |
| `NoteGetManyUseCase`      | `NOTE_CRUD_REPOSITORY_PORT`          | a page of notes, optionally of one subject and of one resolution |
| `NoteEditUseCase`         | `NOTE_EDIT_REPOSITORY_PORT`          | edits the body and appends a revision                            |
| `NoteResolveUseCase`      | `NOTE_RESOLVE_REPOSITORY_PORT`       | resolves the note                                                |
| `NoteGetRevisionsUseCase` | `NOTE_GET_REVISIONS_REPOSITORY_PORT` | a page of the revisions of a note of the caller                  |

`NoteAccessService` has its own port, `NOTE_ACCESS_REPOSITORY_PORT`. No consumer holds more than one
repository.

**A subject filter names both halves or neither.** `subjectType` alone or `subjectId` alone is
`NOTE_SUBJECT_INVALID`: half of an opaque reference matches notes on unrelated subjects.

## Logs

A write logs its outcome at `info` after the work: `Note created`, `Note edited`,
`Note edit was a no-op` or `Note resolved`. A lost race logs at `info` and a spent budget at `warn`.
Reads log nothing.

## Persistence

Each repository port has its own repository: `NoteAccessRepository`, `NoteCreateRepository`,
`NoteCrudRepository`, `NoteEditRepository`, `NoteResolveRepository` and
`NoteGetRevisionsRepository`. The edit and resolve repositories share `update` through
`NoteUpdateBaseRepository`. Every repository reads its table through `TransactionHost`, so inside
`TRANSACTION_PORT.run` it writes on the connection of the transaction.

**The version check is in the `WHERE`**, as for products and reminders: `update` writes `body`,
`resolved` and `version` where the id and the version as read match, and answers whether one row
changed.

`appendRevision` inserts one `note_revision` row. `UNIQUE (note_id, note_version)` is the last
guard: two edits that both passed the version check could not record the same version twice.

`list` returns the notes of one author newest first, by id, optionally of one subject and of one
resolution. The author is a required filter, and `idx_note_author` serves it.
`listForNote` returns the revisions of one note, newest version first.

## HTTP

| Method and path                      | Answer                   |
| ------------------------------------ | ------------------------ |
| `POST /tools/notes`                  | 201, the note            |
| `GET /tools/notes`                   | 200, a page of notes     |
| `GET /tools/notes/:noteId`           | 200, the note            |
| `PATCH /tools/notes/:noteId`         | 200, the note            |
| `PATCH /tools/notes/:noteId/resolve` | 200, the note            |
| `GET /tools/notes/:noteId/revisions` | 200, a page of revisions |

**Every route needs a staff token, no permission, and is scoped to the caller.** The caller is the
author of a note they create; every other route passes the caller's id as `authorId` and reaches
only the notes of that author. Only the author edits a note, so the editor of every revision is the
author too.

**Half a subject filter is a domain error, not a validation error.** The query DTO checks each
half on its own; the pair rule lives in `NoteGetManyUseCase` only, and answers
`NOTE_SUBJECT_INVALID`.

`resolved` in the query is `true` or `false`; anything else is a 400 from validation. `noteId` is a
string of 1 to 20 digits without a leading zero, checked by `NoteIdRequestDto`, like `productId`.

### Errors

`NoteHttpExceptionFilter` maps the domain codes to statuses and hands the response to the
`HttpExceptionFilter` of `libs/http`, with the same body as products.

| Code                                                                | Status |
| ------------------------------------------------------------------- | ------ |
| `NOTE_SUBJECT_INVALID`, `NOTE_BODY_INVALID`, `NOTE_VERSION_INVALID` | 400    |
| `NOTE_NOT_FOUND`                                                    | 404    |
| `NOTE_RESOLVED`, `VERSION_MISMATCH`                                 | 409    |

## Wiring

`NoteModule` imports `NoteTypeOrmModule.forFeature()`, binds every port with
`{ provide, useClass }` and reads `NOTE_OCC_RETRY_ATTEMPTS` from `OCC_RETRY_ATTEMPTS`. The entity
list of staff-app includes `Note` and `NoteRevision`. The feature exists only in staff-app: the
customer-app has no `/tools/notes` route.
