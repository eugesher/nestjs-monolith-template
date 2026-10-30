import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StaffUser } from '@acme-core/entities';

export class AuthTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([StaffUser]);
  }
}
