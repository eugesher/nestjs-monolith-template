# 019 — Schema conventions

The entities live in `core/entities/src`, and the migrations in `migrations/`. Examples below use
the tables of `core/entities/src/order` and `core/entities/src/product`.

**A quantity is a sum of signed movements.** `product_stock` stores one row per movement, and the
value is `SUM(quantity)` over the rows of a key. No column holds the current value, so no update can
lose a movement, and only one module writes the rows (see `022-enqueue-after-commit.md`).

**A nullable unique column limits only the rows that have a value.**
`uq_product_stock_order_product` is unique on `order_product_id`, so a second movement for the same
line breaks the key, while MySQL allows many `NULL` values.

**A covering index serves the sum.** `idx_product_stock_product (product_id, quantity)` covers
`SUM(quantity) … WHERE product_id = ?` and `GROUP BY product_id`, so the sum never reads the table
rows.

**Constraint names repeat the table**: `idx_<table>_<column>`, `uq_<table>_<column>`,
`fk_<table>_<target>`.

**A reserved table name is quoted by hand.** TypeORM quotes the table name in the queries it builds;
raw SQL, the migration and the seed write `` `order` `` with backticks.

**A relation registers its target.** A foreign key makes TypeORM require the target entity in the
entity list of every app that maps the source (see `018-entity-ownership-lint.md`). Example:
`apps/processor-app/src/app/setup/orm/entities/index.ts`.
