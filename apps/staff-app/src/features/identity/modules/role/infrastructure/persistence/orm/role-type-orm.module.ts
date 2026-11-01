import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StaffPermission, StaffRole, StaffRolePermission } from '@acme-core/entities';

export class RoleTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([StaffPermission, StaffRole, StaffRolePermission]);
  }
}
