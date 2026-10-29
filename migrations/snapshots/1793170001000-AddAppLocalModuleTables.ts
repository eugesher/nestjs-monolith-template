import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAppLocalModuleTables1793170001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE note (
        id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        subject_type VARCHAR(64)  NOT NULL,
        subject_id   VARCHAR(64)  NOT NULL,
        body         TEXT         NOT NULL,
        author_id    CHAR(36)     NOT NULL,
        resolved     TINYINT(1)   NOT NULL DEFAULT 0,
        version      INT          NOT NULL DEFAULT 1,
        created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at   TIMESTAMP    NULL,
        KEY idx_note_subject (subject_type, subject_id),
        KEY idx_note_author (author_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE note_revision (
        id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        note_id        BIGINT UNSIGNED NOT NULL,
        note_version   INT          NOT NULL,
        body_before    TEXT         NOT NULL,
        body_after     TEXT         NOT NULL,
        editor_id      CHAR(36)     NOT NULL,
        correlation_id VARCHAR(64)  NOT NULL DEFAULT '',
        recorded_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        UNIQUE KEY uq_note_revision_version (note_id, note_version),
        KEY idx_note_revision_correlation (correlation_id),
        CONSTRAINT fk_note_revision_note FOREIGN KEY (note_id)
          REFERENCES note (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE reminder (
        id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        owner_id   CHAR(36)      NOT NULL,
        title      VARCHAR(255)  NOT NULL,
        body       VARCHAR(2000) NOT NULL DEFAULT '',
        due_on     DATE          NOT NULL,
        status     ENUM('pending','done') NOT NULL DEFAULT 'pending',
        version    INT           NOT NULL DEFAULT 1,
        created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP     NULL,
        KEY idx_reminder_owner_status (owner_id, status),
        KEY idx_reminder_due (due_on)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS reminder');
    await queryRunner.query('DROP TABLE IF EXISTS note_revision');
    await queryRunner.query('DROP TABLE IF EXISTS note');
  }
}
