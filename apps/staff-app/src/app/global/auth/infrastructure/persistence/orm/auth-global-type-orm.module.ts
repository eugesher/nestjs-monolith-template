import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StaffPermission, StaffRolePermission, StaffUserRole } from '@acme-core/entities';

export class AuthGlobalTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([StaffPermission, StaffRolePermission, StaffUserRole]);
  }
}
