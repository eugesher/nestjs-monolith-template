import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StaffRole, StaffUser, StaffUserRole } from '@acme-core/entities';

export class UserTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([StaffRole, StaffUser, StaffUserRole]);
  }
}
