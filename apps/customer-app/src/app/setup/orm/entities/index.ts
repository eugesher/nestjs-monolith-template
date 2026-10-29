import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import {
  IdempotencyKey,
  Item,
  LedgerEntry,
  StaffPermission,
  Reminder,
  StaffRole,
  StaffRolePermission,
  StaffUser,
  StaffUserRole,
} from '@acme-core/entities';

export const entities: TypeOrmModuleOptions['entities'] = [
  IdempotencyKey,
  Item,
  LedgerEntry,
  StaffPermission,
  Reminder,
  StaffRole,
  StaffRolePermission,
  StaffUser,
  StaffUserRole,
];
