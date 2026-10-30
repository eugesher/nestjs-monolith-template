import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { OrderProduct } from '../order/order-product.entity';
import { Product } from './product.entity';

@Entity({ name: 'product_stock' })
@Index('idx_product_stock_product', ['productId', 'quantity'])
export class ProductStock {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  public id: string;

  @Column({ type: 'bigint', unsigned: true })
  public productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id', foreignKeyConstraintName: 'fk_product_stock_product' })
  public product: Product;

  @Column({ type: 'int' })
  public quantity: number;

  @Index('uq_product_stock_order_product', { unique: true })
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  public orderProductId: string | null;

  @ManyToOne(() => OrderProduct, { nullable: true })
  @JoinColumn({
    name: 'order_product_id',
    foreignKeyConstraintName: 'fk_product_stock_order_product',
  })
  public orderProduct: OrderProduct | null;

  @CreateDateColumn({ type: 'timestamp', precision: 0, default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;
}
