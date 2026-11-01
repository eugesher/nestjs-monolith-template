import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '@acme-core/entities';

export class ProductStockTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([Product]);
  }
}
