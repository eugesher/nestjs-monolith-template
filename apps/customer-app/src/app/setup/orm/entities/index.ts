import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import {
  IdempotencyKey,
  Item,
  LedgerEntry,
  Permission,
  Reminder,
  Role,
  RolePermission,
  User,
  UserRole,
} from '@acme-core/entities';

export const entities: TypeOrmModuleOptions['entities'] = [
  IdempotencyKey,
  Item,
  LedgerEntry,
  Permission,
  Reminder,
  Role,
  RolePermission,
  User,
  UserRole,
];
