import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTemplateSchema1793170000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE staff_user (
        id            CHAR(36)     NOT NULL PRIMARY KEY,
        email         VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        status        VARCHAR(16)  NOT NULL DEFAULT 'active',
        created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_staff_user_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE staff_role (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(64) NOT NULL,
        description VARCHAR(255) NULL,
        UNIQUE KEY uq_staff_role_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE staff_permission (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        code        VARCHAR(64) NOT NULL,
        description VARCHAR(255) NULL,
        UNIQUE KEY uq_staff_permission_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE staff_user_roles (
        user_id CHAR(36) NOT NULL,
        role_id INT      NOT NULL,
        PRIMARY KEY (user_id, role_id),
        CONSTRAINT fk_staff_user_roles_user FOREIGN KEY (user_id) REFERENCES staff_user(id) ON DELETE CASCADE,
        CONSTRAINT fk_staff_user_roles_role FOREIGN KEY (role_id) REFERENCES staff_role(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE staff_role_permissions (
        role_id       INT NOT NULL,
        permission_id INT NOT NULL,
        PRIMARY KEY (role_id, permission_id),
        CONSTRAINT fk_staff_role_permissions_role FOREIGN KEY (role_id) REFERENCES staff_role(id) ON DELETE CASCADE,
        CONSTRAINT fk_staff_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES staff_permission(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE item (
        id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        sku        VARCHAR(64)  NOT NULL,
        name       VARCHAR(255) NOT NULL,
        owner_id   CHAR(36)     NOT NULL,
        status     ENUM('draft','active','archived') NOT NULL DEFAULT 'draft',
        version    INT          NOT NULL DEFAULT 1,
        created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP    NULL,
        UNIQUE KEY uq_item_sku (sku),
        KEY idx_item_owner (owner_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE idempotency_key (
        id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        idempotency_key      VARCHAR(128) NOT NULL,
        request_fingerprint  CHAR(64)     NOT NULL,
        status               VARCHAR(16)  NOT NULL DEFAULT 'in_flight',
        response_body        TEXT         NULL,
        created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_idempotency_key (idempotency_key),
        KEY idx_idempotency_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE ledger_entry (
        id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        operation_key  VARCHAR(128) NOT NULL,
        subject_type   VARCHAR(64)  NOT NULL,
        subject_id     VARCHAR(64)  NOT NULL,
        action         VARCHAR(64)  NOT NULL,
        payload        JSON         NOT NULL,
        correlation_id VARCHAR(64)  NOT NULL DEFAULT '',
        occurred_at    TIMESTAMP(3) NOT NULL,
        recorded_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        UNIQUE KEY uq_ledger_operation_key (operation_key),
        KEY idx_ledger_subject (subject_type, subject_id),
        KEY idx_ledger_correlation (correlation_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS ledger_entry');
    await queryRunner.query('DROP TABLE IF EXISTS idempotency_key');
    await queryRunner.query('DROP TABLE IF EXISTS item');
    await queryRunner.query('DROP TABLE IF EXISTS staff_role_permissions');
    await queryRunner.query('DROP TABLE IF EXISTS staff_user_roles');
    await queryRunner.query('DROP TABLE IF EXISTS staff_permission');
    await queryRunner.query('DROP TABLE IF EXISTS staff_role');
    await queryRunner.query('DROP TABLE IF EXISTS staff_user');
  }
}
