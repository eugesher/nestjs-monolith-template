# 09 — Ledger catalog events processor

`apps/client-api/src/processors/ledger-catalog-events` records catalog events in the ledger of
`core/modules/src/ledger` (see `05-core-ledger.md`). It is a processor, not a feature: an in-process
event enters it, not an HTTP request, and it has no controller.

| Layer                          | What it holds                                                         |
| ------------------------------ | --------------------------------------------------------------------- |
| `presentation`                 | `LedgerCatalogEventsConsumer`, one `@OnEvent` handler per event       |
| `application`                  | a use case per event and `LedgerCatalogEventsRecordService`           |
| `outbound`                     | `LEDGER_CATALOG_EVENTS_LEDGER_PORT`                                   |
| `infrastructure/core-adapters` | `LedgerCatalogEventsLedgerCoreAdapter` over `LEDGER_CORE_APPEND_PORT` |

The processor sees no feature. The event names and payloads live in
`@acme-client-contracts/ledger-catalog-events`, which the item feature publishes against (see
`08-item-feature.md`).

## Events and entries

| Event                   | Operation key        | Action         | Payload                  |
| ----------------------- | -------------------- | -------------- | ------------------------ |
| `catalog.item.created`  | `item-created:<id>`  | `ItemCreated`  | `sku`, `name`, `ownerId` |
| `catalog.item.archived` | `item-archived:<id>` | `ItemArchived` | `sku`, `previousStatus`  |

Every entry has the subject type `item` and the item id as the subject id. The item feature also
publishes `catalog.item.renamed`, which nothing subscribes to.

**The archive has two writers.** The item feature also records the archive after the commit, under
the same key and with the same payload. The ledger keeps the first append and answers the second
with `appended: false`, so the row is the same whichever comes first.

## Correlation

The payload has no correlation id. `EventEmitter2.emitAsync` runs the handler in the async context
of the publishing request, so the ledger reads the request's id from `CorrelationContextHelper`
like any other code serving that request.

## Failures

The item is already committed when its event arrives, so a failed append must not reach the
publisher. `LedgerCatalogEventsRecordService` tries three times through `ReplayRetryHelper`, logs
each retry at `warn` and then the entry at `error` for a replay, and returns normally.

## Logs

Every event logs `Catalog event received` with its operation key and action at `info`, then
`Catalog event recorded` or `Catalog event already recorded`.
