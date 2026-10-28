import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ledger_entry' })
@Index('idx_ledger_subject', ['subjectType', 'subjectId'])
export class LedgerEntry {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  public id: string;

  @Index('uq_ledger_operation_key', { unique: true })
  @Column({ type: 'varchar', length: 128 })
  public operationKey: string;

  @Column({ type: 'varchar', length: 64 })
  public subjectType: string;

  @Column({ type: 'varchar', length: 64 })
  public subjectId: string;

  @Column({ type: 'varchar', length: 64 })
  public action: string;

  @Column({ type: 'json' })
  public payload: Record<string, unknown>;

  @Index('idx_ledger_correlation')
  @Column({ type: 'varchar', length: 64, default: '' })
  public correlationId: string;

  @Column({ type: 'timestamp', precision: 3 })
  public occurredAt: Date;

  @CreateDateColumn({ type: 'timestamp', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)' })
  public recordedAt: Date;
}
