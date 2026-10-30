import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Customer } from '@acme-core/entities';

export class CustomerIdentityCommonTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([Customer]);
  }
}
