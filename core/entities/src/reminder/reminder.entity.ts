import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

import { ReminderStatusEnum } from '@acme-libs/kernel';

@Entity({ name: 'reminder' })
@Index('idx_reminder_owner_status', ['ownerId', 'status'])
export class Reminder {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  public id: string;

  @Column({ type: 'char', length: 36 })
  public ownerId: string;

  @Column({ type: 'varchar', length: 255 })
  public title: string;

  @Column({ type: 'varchar', length: 2000, default: '' })
  public body: string;

  @Index('idx_reminder_due')
  @Column({ type: 'date' })
  public dueOn: string;

  @Column({ type: 'enum', enum: ReminderStatusEnum, default: ReminderStatusEnum.PENDING })
  public status: ReminderStatusEnum;

  @VersionColumn({ default: 1 })
  public version: number;

  @CreateDateColumn({ type: 'timestamp', precision: 0, default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  public updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', precision: 0, nullable: true })
  public deletedAt: Date | null;
}
