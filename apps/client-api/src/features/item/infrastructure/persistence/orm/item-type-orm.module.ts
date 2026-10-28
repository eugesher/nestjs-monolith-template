import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Item } from '@acme-core/entities';

export class ItemTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([Item]);
  }
}
