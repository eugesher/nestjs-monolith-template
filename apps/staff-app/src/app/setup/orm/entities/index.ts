import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import {
  LedgerEntry,
  Note,
  NoteRevision,
  Permission,
  Role,
  RolePermission,
  User,
  UserRole,
} from '@acme-core/entities';

export const entities: TypeOrmModuleOptions['entities'] = [
  LedgerEntry,
  Note,
  NoteRevision,
  Permission,
  Role,
  RolePermission,
  User,
  UserRole,
];
