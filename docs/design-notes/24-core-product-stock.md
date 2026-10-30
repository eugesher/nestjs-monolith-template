# 24 — Core product stock

`core/modules/src/product-stock` is the only writer of `product_stock`. It is a core module because
both apps move stock: the customer `order` feature writes units off, and the staff `product` feature
restocks. Its contract `core/contracts/src/product-stock` has one port:

| Port                      | Facade                   | Consumer                            |
| ------------------------- | ------------------------ | ----------------------------------- |
| `PRODUCT_STOCK_CORE_PORT` | `ProductStockCoreFacade` | a feature that reads or moves stock |

A feature mounts `ProductStockCoreModule` from `@acme-core/modules/product-stock` and reaches the
port only from a core-adapter, like any core module.

| Method | Command                                                          | Answer                                                                       |
| ------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `lock` | `{ productIds }`                                                 | `[{ productId, quantity }]`, the stock of each locked product                |
| `move` | `{ kind, movements: [{ productId, quantity, orderProductId }] }` | `{ productStockIds, stock }`, the new rows in order and the stock after them |

## One kind of write

**A movement is added or subtracted.** `move` takes `ProductStockCoreMovementKindEnum`: `ADD` writes
each `quantity` as it is, `SUBTRACT` writes it negated. The caller always passes a positive count and
says which way it goes, so the sign of a row never depends on a caller remembering it. `ADD` covers
any stock that arrives, the first delivery of a product as well as a later one; `SUBTRACT` covers
any that leaves. A movement for an order line carries its `orderProductId`, any other carries `null`.

**The answer serves both callers.** `productStockIds` lists the new rows in the order of the
movements, so a restock can name its ledger record after its row. `stock` holds the stock of every
moved product after the write, so a restock answers its new stock without another call. An order
ignores both.

**The features keep their own words.** The order port says `withdraw` and the product port says
`restock`. Their core-adapters translate: the order adapter subtracts one unit per order line, and
the product adapter adds the restocked units without an order line.

## The lock order lives here

**Every call locks the product rows first.** `lock` and `move` start with
`SELECT … FOR UPDATE` on the `product` rows, in `id` order, and only then read or write
`product_stock`. The stock is summed with `FOR SHARE`. Writes that always take the same rows in the
same order queue behind each other instead of deadlocking, and the sum sees every movement committed
before the lock. The order is written once, in `ProductStockCoreBaseRepository`, and both
repositories of the module extend it.

**The caller locks before it reads.** A feature that checks the product before it moves stock calls
`lock` first and reads the product afterwards, in the same transaction. The read then sees the row
as the last committed writer left it, and no archive can slip in between the check and the write.
`move` takes the lock again; inside one transaction that costs a query and nothing else, and a
caller that forgot `lock` still writes in the right order.

**The module joins the caller's transaction.** Its repositories read through `TransactionHost`, so
every call runs inside the caller's `TRANSACTION_PORT.run`, next to the caller's own writes and its
idempotency key. The module never opens a transaction of its own: a lock outside a transaction
would end with the statement.

## What the module does not decide

- **No rules.** The module checks neither the status of a product, nor whether the stock covers an
  order, nor the range of a restock. Those are rules of the features: `OrderModel.place` refuses a
  short order, and `ProductModel.restock` refuses an archived product or a bad quantity.
- **No product fields.** `lock` answers the stock only. A feature reads `sku`, `name` or `status`
  through its own repository, so the stock contract does not follow the catalog.
- **No error for a missing product.** `lock` skips an unknown or soft-deleted id: it is simply not
  in the answer. The feature turns the gap into its own error code.
- **No reads for listings.** The customer catalog sums stock in its own grouped query, because it
  filters and pages by the sum. The module is for the transactions that move stock.

## Wiring

| Port                                      | Implementation                   |
| ----------------------------------------- | -------------------------------- |
| `PRODUCT_STOCK_CORE_LOCK_REPOSITORY_PORT` | `ProductStockCoreLockRepository` |
| `PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT` | `ProductStockCoreMoveRepository` |

`ProductStockCoreTypeOrmModule` registers `Product` and `ProductStock`.

| Feature              | Feature port               | Core-adapter                   |
| -------------------- | -------------------------- | ------------------------------ |
| customer-app `order` | `ORDER_PRODUCT_STOCK_PORT` | `OrderProductStockCoreAdapter` |
| staff-app `product`  | `PRODUCT_STOCK_PORT`       | `ProductStockCoreAdapter`      |
