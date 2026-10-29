import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  StaffPermission,
  StaffRole,
  StaffRolePermission,
  StaffUser,
  StaffUserRole,
} from '@acme-core/entities';

export class StaffIdentityCoreTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([
      StaffPermission,
      StaffRole,
      StaffRolePermission,
      StaffUser,
      StaffUserRole,
    ]);
  }
}
