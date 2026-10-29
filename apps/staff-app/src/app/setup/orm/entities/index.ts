import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import {
  IdempotencyKey,
  LedgerEntry,
  Note,
  NoteRevision,
  Product,
  StaffPermission,
  StaffRole,
  StaffRolePermission,
  StaffUser,
  StaffUserRole,
} from '@acme-core/entities';

export const entities: TypeOrmModuleOptions['entities'] = [
  IdempotencyKey,
  LedgerEntry,
  Note,
  NoteRevision,
  Product,
  StaffPermission,
  StaffRole,
  StaffRolePermission,
  StaffUser,
  StaffUserRole,
];
