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

import { ItemStatusEnum } from '@acme-libs/kernel';

@Entity({ name: 'item' })
export class Item {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  public id: string;

  @Index('uq_item_sku', { unique: true })
  @Column({ type: 'varchar', length: 64 })
  public sku: string;

  @Column({ type: 'varchar', length: 255 })
  public name: string;

  @Index('idx_item_owner')
  @Column({ type: 'char', length: 36 })
  public ownerId: string;

  @Column({ type: 'enum', enum: ItemStatusEnum, default: ItemStatusEnum.DRAFT })
  public status: ItemStatusEnum;

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
