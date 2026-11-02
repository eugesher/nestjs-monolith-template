import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Customer } from '../customer-identity/customer.entity';
import { OrderProduct } from './order-product.entity';

@Entity({ name: 'order' })
@Index('idx_order_customer', ['customerId', 'id'])
export class Order {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  public id: string;

  @Column({ type: 'bigint', unsigned: true })
  public customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id', foreignKeyConstraintName: 'fk_order_customer' })
  public customer: Customer;

  @CreateDateColumn({ type: 'timestamp', precision: 0, default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
  public orderProducts: OrderProduct[];
}
