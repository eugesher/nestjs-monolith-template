import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { LedgerEntry, Permission, Role, RolePermission, User, UserRole } from '@acme-core/entities';

export const entities: TypeOrmModuleOptions['entities'] = [
  LedgerEntry,
  Permission,
  Role,
  RolePermission,
  User,
  UserRole,
];
