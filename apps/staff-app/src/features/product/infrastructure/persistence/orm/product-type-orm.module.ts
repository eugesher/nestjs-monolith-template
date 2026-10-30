import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product, ProductStock } from '@acme-core/entities';

export class ProductTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([Product, ProductStock]);
  }
}
