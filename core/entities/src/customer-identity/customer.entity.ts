import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

import { UserStatusEnum } from '@acme-libs/kernel';

@Entity({ name: 'customer' })
export class Customer {
  @PrimaryColumn({ type: 'char', length: 36 })
  public id: string;

  @Index('uq_customer_email', { unique: true })
  @Column({ type: 'varchar', length: 255 })
  public email: string;

  @Column({ type: 'varchar', length: 255 })
  public passwordHash: string;

  @Column({ type: 'varchar', length: 16, default: UserStatusEnum.ACTIVE })
  public status: UserStatusEnum;

  @CreateDateColumn({ type: 'timestamp', precision: 0, default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;
}
