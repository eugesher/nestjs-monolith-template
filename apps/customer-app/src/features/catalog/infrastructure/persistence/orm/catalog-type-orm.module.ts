import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '@acme-core/entities';

export class CatalogTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([Product]);
  }
}
