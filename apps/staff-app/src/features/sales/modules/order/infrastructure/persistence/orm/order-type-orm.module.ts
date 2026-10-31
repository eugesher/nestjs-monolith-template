import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order, OrderProduct, Product } from '@acme-core/entities';

export class OrderTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([Order, OrderProduct, Product]);
  }
}
