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

import { ProductStatusEnum } from '@acme-libs/kernel';

@Entity({ name: 'product' })
export class Product {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  public id: string;

  @Index('uq_product_sku', { unique: true })
  @Column({ type: 'varchar', length: 64 })
  public sku: string;

  @Column({ type: 'varchar', length: 255 })
  public name: string;

  @Column({ type: 'enum', enum: ProductStatusEnum, default: ProductStatusEnum.DRAFT })
  public status: ProductStatusEnum;

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
