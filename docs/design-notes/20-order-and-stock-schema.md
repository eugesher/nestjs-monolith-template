# 20 — Order and stock schema

Three tables hold what a customer bought and what the warehouse has. Their entities live in
`core/entities`, so customer-app, which places orders, and staff-app, which reads them and restocks,
map the same tables.

| Entity         | Table           | Keys                                                                                                                        |
| -------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Order`        | `order`         | `idx_order_customer`, `fk_order_customer`                                                                                   |
| `OrderProduct` | `order_product` | `idx_order_product_order`, `idx_order_product_product`, `fk_order_product_order`, `fk_order_product_product`                |
| `ProductStock` | `product_stock` | `uq_product_stock_order_product`, `idx_product_stock_product`, `fk_product_stock_product`, `fk_product_stock_order_product` |

## One row per unit

**An order line is one unit of one product.** `order_product` has no quantity column: two units of
a product are two rows. Each row is a thing the customer holds, so a later return or a per-unit
price attaches to a row and never splits a count.

## Stock is a ledger of movements

**The quantity on hand is a sum.** `product_stock` stores signed movements, and the stock of a
product is `SUM(quantity)` over its rows. A restock writes `+N` with no order line. An ordered unit
writes `-1` with the id of its `order_product` row. No column holds the current stock, so no update
can lose a movement, and the history of a product is its rows in id order.

**A unit leaves the warehouse once.** `uq_product_stock_order_product` is unique on
`order_product_id`. A second `-1` for the same order line breaks the key instead of selling the unit
twice. MySQL allows many `NULL` values in a unique index, so restocks are not limited by it.

**The sum reads one index.** `idx_product_stock_product (product_id, quantity)` covers
`SUM(quantity) … WHERE product_id = ?` and `GROUP BY product_id`, so the stock of a product never
reads the table rows.

## `order` is a reserved word

TypeORM quotes the table name in the queries it builds. Raw SQL, the migration and the seed write
`` `order` `` with backticks.

## The customer of an order

**`order.customer_id` has a foreign key to `customer`.** An order of a customer that does not exist
is a broken record, and the database refuses it. The relation makes TypeORM require `Customer` in
the entity list of every app that maps `Order`, so the entity list of staff-app registers
`Customer` through a narrow lint exception (see `19-customer-identity.md`).

A reminder or a note stores its owner without a foreign key: the owner may come from another
module, and the record outlives nothing. An order is different: it is money, and a dangling
customer id would leave a sale nobody can be found for.

## What the schema leaves out

- **No order status.** An order does not change after it is placed.
- **No author of a restock.** A stock movement records what and how many, not who.
