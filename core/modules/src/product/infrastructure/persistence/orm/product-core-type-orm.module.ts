import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '@acme-core/entities';

export class ProductCoreTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([Product]);
  }
}
