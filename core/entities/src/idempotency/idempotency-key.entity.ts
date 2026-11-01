import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { IdempotencyStatusEnum } from '@acme-libs/kernel';

@Entity({ name: 'idempotency_key' })
export class IdempotencyKey {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  public id: string;

  @Index('uq_idempotency_key', { unique: true })
  @Column({ type: 'varchar', length: 128 })
  public idempotencyKey: string;

  @Column({ type: 'char', length: 64 })
  public requestFingerprint: string;

  @Column({ type: 'varchar', length: 16, default: IdempotencyStatusEnum.IN_FLIGHT })
  public status: IdempotencyStatusEnum;

  @Column({ type: 'text', nullable: true })
  public responseBody: string | null;

  @Index('idx_idempotency_created_at')
  @CreateDateColumn({ type: 'timestamp', precision: 0, default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;
}
