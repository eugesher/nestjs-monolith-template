import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IdempotencyKey } from '@acme-core/entities';

export class IdempotencyCommonTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([IdempotencyKey]);
  }
}
