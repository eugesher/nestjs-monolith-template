import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Permission, Role, RolePermission, User, UserRole } from '@acme-core/entities';

export const entities: TypeOrmModuleOptions['entities'] = [
  Permission,
  Role,
  RolePermission,
  User,
  UserRole,
];
