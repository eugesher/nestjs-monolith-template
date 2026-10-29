import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import {
  LedgerEntry,
  Note,
  NoteRevision,
  StaffPermission,
  StaffRole,
  StaffRolePermission,
  StaffUser,
  StaffUserRole,
} from '@acme-core/entities';

export const entities: TypeOrmModuleOptions['entities'] = [
  LedgerEntry,
  Note,
  NoteRevision,
  StaffPermission,
  StaffRole,
  StaffRolePermission,
  StaffUser,
  StaffUserRole,
];
