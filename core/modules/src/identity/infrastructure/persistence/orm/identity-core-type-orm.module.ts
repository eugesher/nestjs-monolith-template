import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Permission, Role, RolePermission, User, UserRole } from '@acme-core/entities';

export class IdentityCoreTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([Permission, Role, RolePermission, User, UserRole]);
  }
}
