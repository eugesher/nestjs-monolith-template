# 22 — Order feature

`apps/customer-app/src/features/order` lets a customer buy: place an order for products in stock,
list their orders, and read one with its products. It has every layer of `product` in staff-app
(see `08-product-feature.md`): a domain, an application, outbound ports, infrastructure and
presentation.

| Method and path        | Headers                     | Answer                                       |
| ---------------------- | --------------------------- | -------------------------------------------- |
| `POST /orders`         | `Idempotency-Key`, required | 201, the order with a line per unit          |
| `GET /orders`          |                             | 200, a page of the caller's orders, no lines |
| `GET /orders/:orderId` |                             | 200, the order with a line per unit          |

Every route needs a customer token. The customer is always the caller: `@CurrentUser()` gives the
id, and no route takes a customer id from the request.

## One line per unit

The body is `{ productIds }` with one id per unit: `["100", "100"]` is two units of product 100.
The schema works the same way (see `20-order-and-stock-schema.md`): each unit is an `order_product`
row and a `product_stock` movement of `-1` that points at it. So the answer has a line per unit
too, `{ id, productId, sku, name }`, in the order the lines were written.

The DTO accepts 1 to 100 ids, each a string of up to 20 digits without a leading zero. The domain
refuses an empty list again with `ORDER_EMPTY`, so the rule holds for a caller that is not HTTP.

## Placing an order

`OrderModel.place` takes the units and the stock the repository locked, and checks every unit:

- **The product must be `active`.** A `draft`, an `archived`, a soft-deleted or an unknown product
  is the same `ORDER_PRODUCT_NOT_FOUND`, with `details.productId`. A customer cannot tell a draft
  from a product that does not exist, as in the catalog (see `21-catalog-feature.md`).
- **The stock must cover every unit of the product.** Otherwise `ORDER_STOCK_INSUFFICIENT`, with
  `details` of the product, the units requested and the units on hand.

One refused unit refuses the whole order: nothing is written.

### The lock

`OrderPlaceUseCase` runs the placement in one transaction:

1. `lockStock` reads the products of the order with `SELECT … FOR UPDATE`, in `id` order, and the
   sum of their stock movements with `FOR SHARE`.
2. The domain checks the units.
3. `insert` writes the `order` row, an `order_product` row per unit and a `-1` movement per line.
4. The idempotency key is completed with the answer.

**The product rows are the lock.** Two orders for the same product queue on its row, so the second
one sums the stock after the first one committed and cannot sell a unit twice. The rows are locked
in `id` order, so two orders that share several products wait for each other instead of
deadlocking. The sum is a locking read too, so it sees the latest committed movements whatever the
transaction read before. `lockStock([])` answers `[]` without a query, and the domain refuses the
empty order.

### Idempotency

The use case claims the key on `{ customerId, productIds }` before the transaction, through the
core idempotency module (see `07-core-idempotency.md`):

| Claim       | Answer                                     |
| ----------- | ------------------------------------------ |
| `claimed`   | place the order                            |
| `replay`    | the stored response, nothing else happens  |
| `in-flight` | `ORDER_IDEMPOTENT_REQUEST_IN_FLIGHT` (409) |
| `mismatch`  | `ORDER_IDEMPOTENCY_KEY_REUSED` (422)       |

**The customer is part of the body.** Keys share one table across customers, and the column is as
wide as the header allows, so the key itself cannot carry a prefix. With the customer in the
claimed body, a key that another customer used is a `mismatch`, never a replay of someone else's
order.

Completing the key is the last write of the transaction, so the order and the stored answer commit
together. Any failure releases the key, so a client may retry a refused order with the same key once
the stock is back.

### The ledger

After the commit, `OrderLedgerService` enqueues the record `order-placed:<orderId>` on the
`ledger-record` queue, with the customer and the product ids in the payload, like the sign-up of
`auth`. A failed enqueue is retried `LEDGER_RETRY_ATTEMPTS` times and then logged for a replay by
hand. The order stays placed: the queue is not part of the transaction.

## Reading orders

`GET /orders` lists the caller's orders, the newest first, as `{ id, createdAt }`. The page window
works as in the catalog: page 1 and size 20 by default, size capped at 100.

`GET /orders/:orderId` reads the order with its lines. The `sku` and `name` of a line come from the
product as it is now, soft-deleted or not, because the schema keeps no copy. The order of another
customer and an unknown order are the same `ORDER_NOT_FOUND` (404), so a customer cannot probe which
order ids exist.

## Errors

`OrderHttpExceptionFilter` maps the domain codes to statuses, with `details` when the exception has
them:

| Code                                                             | Status |
| ---------------------------------------------------------------- | ------ |
| `ORDER_EMPTY`                                                    | 400    |
| `ORDER_PRODUCT_NOT_FOUND`, `ORDER_NOT_FOUND`                     | 404    |
| `ORDER_STOCK_INSUFFICIENT`, `ORDER_IDEMPOTENT_REQUEST_IN_FLIGHT` | 409    |
| `ORDER_IDEMPOTENCY_KEY_REUSED`                                   | 422    |

## Wiring

| Port                          | Implementation                  |
| ----------------------------- | ------------------------------- |
| `ORDER_PLACE_REPOSITORY_PORT` | `OrderPlaceRepository`          |
| `ORDER_CRUD_REPOSITORY_PORT`  | `OrderCrudRepository`           |
| `ORDER_IDEMPOTENCY_PORT`      | `OrderIdempotencyCoreAdapter`   |
| `ORDER_LEDGER_RECORD_PORT`    | `OrderLedgerRecordQueueAdapter` |

`OrderModule` imports `OrderTypeOrmModule.forFeature()`, `LedgerRecordQueueModule` and
`IdempotencyCoreModule`. It reads `ORDER_LEDGER_RECORD_TIMEOUT_MS` from `REDIS_COMMAND_TIMEOUT_MS`
and `ORDER_LEDGER_RETRY_ATTEMPTS` from `LEDGER_RETRY_ATTEMPTS`.
