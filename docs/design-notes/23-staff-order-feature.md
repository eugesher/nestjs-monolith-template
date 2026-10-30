# 23 — Staff order feature

`apps/staff-app/src/features/order` lets the back office read the orders that customers placed
through customer-app (see `22-order-feature.md`). It only reads: staff-app cannot place, change or
cancel an order.

| Method and path        | Permission   | Answer                                                |
| ---------------------- | ------------ | ----------------------------------------------------- |
| `GET /orders`          | `order:read` | 200, a page of the orders of every customer, no lines |
| `GET /orders/:orderId` | `order:read` | 200, the order with a line per unit; 404 when unknown |

A principal without `order:read` gets a 403, and one without a token gets a 401. The test seeds
grant `order:read` to admin, editor and viewer, like `product:read`.

## Layers

The feature has the layers of `ledger` (see `06-ledger-feature.md`): an application, outbound
ports, infrastructure and presentation. Its domain holds only `OrderErrorCodeEnum` and
`OrderDomainException`, as in `auth` and `iam`: there is no rule to model, only the
`ORDER_NOT_FOUND` code that `OrderHttpExceptionFilter` maps to 404.

`OrderCrudRepository` answers outbound views, not models: `list` gives `{ id, customerId,
createdAt }` and `findById` gives the order with its lines, or `null`. `OrderViewMapper` turns the
dates into ISO strings.

## No code shared with customer-app

The two apps never import each other, and their reads differ: customer-app filters by the caller
and hides the orders of other customers behind a 404, staff-app reads every order. So each app has
its own `OrderCrudRepository` over the same `order`, `order_product` and `product` tables.

## Shape

The list is newest first, as `{ id, customerId, createdAt }`, with the page window of the catalog:
page 1 and size 20 by default, size capped at 100. One order is `{ id, customerId, createdAt,
products }`, where a line is `{ id, productId, sku, name }`, the shape customer-app answers. The
`sku` and `name` of a line come from the product as it is now, soft-deleted or not, because the
schema keeps no copy.

The answer names the customer by id only. Their email is a read of the customer identity module that
no route needs yet.

## Wiring

| Port                         | Implementation        |
| ---------------------------- | --------------------- |
| `ORDER_CRUD_REPOSITORY_PORT` | `OrderCrudRepository` |

`OrderModule` imports `OrderTypeOrmModule.forFeature()` with `Order`, `OrderProduct` and
`Product`.
