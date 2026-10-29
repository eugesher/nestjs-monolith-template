# 09 — Ledger catalog events processor

`apps/staff-app/src/processors/ledger-catalog-events` records catalog events in the ledger of
`core/modules/src/ledger` (see `05-core-ledger.md`). It is a processor, not a feature: an in-process
event enters it, not an HTTP request, and it has no controller.

| Layer                          | What it holds                                                         |
| ------------------------------ | --------------------------------------------------------------------- |
| `presentation`                 | `LedgerCatalogEventsConsumer`, one `@OnEvent` handler per event       |
| `application`                  | a use case per event and `LedgerCatalogEventsRecordService`           |
| `outbound`                     | `LEDGER_CATALOG_EVENTS_LEDGER_PORT`                                   |
| `infrastructure/core-adapters` | `LedgerCatalogEventsLedgerCoreAdapter` over `LEDGER_CORE_APPEND_PORT` |

The processor sees no feature. The event names and payloads live in
`@acme-staff-contracts/ledger-catalog-events`, which the product feature publishes against (see
`08-product-feature.md`).

## Events and entries

| Event                      | Operation key           | Action            | Payload                 |
| -------------------------- | ----------------------- | ----------------- | ----------------------- |
| `catalog.product.created`  | `product-created:<id>`  | `ProductCreated`  | `sku`, `name`           |
| `catalog.product.archived` | `product-archived:<id>` | `ProductArchived` | `sku`, `previousStatus` |

Every entry has the subject type `product` and the product id as the subject id. The product feature also
publishes `catalog.product.renamed`, which nothing subscribes to.

**The archive has two writers.** The product feature also records the archive after the commit, under
the same key and with the same payload. The ledger keeps the first append and answers the second
with `appended: false`, so the row is the same whichever comes first.

## Correlation

The payload has no correlation id. `EventEmitter2.emitAsync` runs the handler in the async context
of the publishing request, so the ledger reads the request's id from `CorrelationContextHelper`
like any other code serving that request.

## Failures

The product is already committed when its event arrives, so a failed append must not reach the
publisher. `LedgerCatalogEventsRecordService` tries three times through `ReplayRetryHelper`, logs
each retry at `warn` and then the entry at `error` for a replay, and returns normally.

## Logs

Every event logs `Catalog event received` with its operation key and action at `info`, then
`Catalog event recorded` or `Catalog event already recorded`.
