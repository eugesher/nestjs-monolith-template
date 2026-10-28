# 12 — Note feature

`apps/admin-api/src/features/note` keeps back-office notes behind `/notes`: free text that an admin
attaches to any subject, edits, and finally resolves. Every edit keeps the body it replaced as a
revision. This note covers the `NoteModel` aggregate, the frozen `NoteRevisionModel`, and the one
write that spans two tables.

## The aggregate

`NoteModel` points at its subject with an opaque pair, `(subjectType, subjectId)`. Nothing checks
that the subject exists or what kind of thing it is: a note on an item and a note on a support
ticket are the same note. `resolved` closes a note for good.

| Rule | Code |
| --- | --- |
| `subjectType` matches `^[a-z][a-z-]{1,63}$` | `NOTE_SUBJECT_INVALID` |
| `subjectId` is 1 to 64 characters after trimming | `NOTE_SUBJECT_INVALID` |
| `body` is 1 to 4000 characters after trimming | `NOTE_BODY_INVALID` |
| `version` is a positive integer | `NOTE_VERSION_INVALID` |
| a resolved note refuses `edit` and `resolve` | `NOTE_RESOLVED` |

**An edit to the current body changes nothing.** It keeps the version, and the edit use case
writes nothing: no update and no revision.

**The id is a string**, like the item and reminder ids: the column is `bigint unsigned`.

Notes have no owner. Any caller with `note:read` reads every note, and any caller with
`note:write` edits or resolves any note. A missing note is `NOTE_NOT_FOUND`.

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
- `reload({ noteId, saved })` reads the note through `NoteAccessService` and answers it, or throws
  `NoteWriteConflictError` with its current version when `saved` is false.

Each use case runs its own attempt, because only editing appends a revision and opens a
transaction. Resolving is one statement and runs without one.

## Use cases

| Use case | Repository port | What it does |
| --- | --- | --- |
| `NoteCreateUseCase` | `NOTE_CREATE_REPOSITORY_PORT` | inserts an unresolved note at version 1 |
| `NoteGetOneUseCase` | none, through `NoteAccessService` | answers one note |
| `NoteGetManyUseCase` | `NOTE_CRUD_REPOSITORY_PORT` | a page of notes, optionally of one subject and of one resolution |
| `NoteEditUseCase` | `NOTE_EDIT_REPOSITORY_PORT` | edits the body and appends a revision |
| `NoteResolveUseCase` | `NOTE_RESOLVE_REPOSITORY_PORT` | resolves the note |
| `NoteGetRevisionsUseCase` | `NOTE_GET_REVISIONS_REPOSITORY_PORT` | a page of the revisions of an existing note |

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

**The version check is in the `WHERE`**, as for items and reminders: `update` writes `body`,
`resolved` and `version` where the id and the version as read match, and answers whether one row
changed.

`appendRevision` inserts one `note_revision` row. `UNIQUE (note_id, note_version)` is the last
guard: two edits that both passed the version check could not record the same version twice.

`list` returns the notes newest first, by id, optionally of one subject and of one resolution.
`listForNote` returns the revisions of one note, newest version first.

## HTTP

| Method and path | Permission | Answer |
| --- | --- | --- |
| `POST /notes` | `note:write` | 201, the note |
| `GET /notes` | `note:read` | 200, a page of notes |
| `GET /notes/:noteId` | `note:read` | 200, the note |
| `PATCH /notes/:noteId` | `note:write` | 200, the note |
| `PATCH /notes/:noteId/resolve` | `note:write` | 200, the note |
| `GET /notes/:noteId/revisions` | `note:read` | 200, a page of revisions |

The caller is the author of a note they create and the editor of a revision they cause. Nothing
else in a route depends on the caller.

**Half a subject filter is a domain error, not a validation error.** The query DTO checks each
half on its own; the pair rule lives in `NoteGetManyUseCase` only, and answers
`NOTE_SUBJECT_INVALID`.

`resolved` in the query is `true` or `false`; anything else is a 400 from validation. `noteId` is a
string of 1 to 20 digits without a leading zero, checked by `NoteIdRequestDto`, like `itemId`.

### Errors

`NoteHttpExceptionFilter` maps the domain codes to statuses and hands the response to the
`HttpExceptionFilter` of `libs/http`, with the same body as items.

| Code | Status |
| --- | --- |
| `NOTE_SUBJECT_INVALID`, `NOTE_BODY_INVALID`, `NOTE_VERSION_INVALID` | 400 |
| `NOTE_NOT_FOUND` | 404 |
| `NOTE_RESOLVED`, `VERSION_MISMATCH` | 409 |

## Wiring

`NoteModule` imports `NoteTypeOrmModule.forFeature()`, binds every port with
`{ provide, useClass }` and reads `NOTE_OCC_RETRY_ATTEMPTS` from `OCC_RETRY_ATTEMPTS`. The entity
list of admin-api includes `Note` and `NoteRevision`. The feature exists only in admin-api: the
client app has no `/notes` route.
