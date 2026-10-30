import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Customer } from '../customer-identity/customer.entity';

@Entity({ name: 'order' })
@Index('idx_order_customer', ['customerId', 'id'])
export class Order {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  public id: string;

  @Column({ type: 'char', length: 36 })
  public customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id', foreignKeyConstraintName: 'fk_order_customer' })
  public customer: Customer;

  @CreateDateColumn({ type: 'timestamp', precision: 0, default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;
}
