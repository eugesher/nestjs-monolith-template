import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderAndProductStock1793170002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`order\` (
        id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        customer_id CHAR(36)  NOT NULL,
        created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_order_customer (customer_id, id),
        CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customer (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE order_product (
        id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id   BIGINT UNSIGNED NOT NULL,
        product_id BIGINT UNSIGNED NOT NULL,
        KEY idx_order_product_order (order_id),
        KEY idx_order_product_product (product_id),
        CONSTRAINT fk_order_product_order FOREIGN KEY (order_id) REFERENCES \`order\` (id),
        CONSTRAINT fk_order_product_product FOREIGN KEY (product_id) REFERENCES product (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE product_stock (
        id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        product_id       BIGINT UNSIGNED NOT NULL,
        quantity         INT             NOT NULL,
        order_product_id BIGINT UNSIGNED NULL,
        created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_product_stock_order_product (order_product_id),
        KEY idx_product_stock_product (product_id, quantity),
        CONSTRAINT fk_product_stock_product FOREIGN KEY (product_id) REFERENCES product (id),
        CONSTRAINT fk_product_stock_order_product FOREIGN KEY (order_product_id)
          REFERENCES order_product (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS product_stock');
    await queryRunner.query('DROP TABLE IF EXISTS order_product');
    await queryRunner.query('DROP TABLE IF EXISTS `order`');
  }
}
