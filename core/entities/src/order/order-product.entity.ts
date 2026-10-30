import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Product } from '../product/product.entity';
import { Order } from './order.entity';

@Entity({ name: 'order_product' })
export class OrderProduct {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  public id: string;

  @Index('idx_order_product_order')
  @Column({ type: 'bigint', unsigned: true })
  public orderId: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id', foreignKeyConstraintName: 'fk_order_product_order' })
  public order: Order;

  @Index('idx_order_product_product')
  @Column({ type: 'bigint', unsigned: true })
  public productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id', foreignKeyConstraintName: 'fk_order_product_product' })
  public product: Product;
}
