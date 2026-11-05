import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import {
  Customer,
  IdempotencyKey,
  LedgerEntry,
  Order,
  OrderProduct,
  Product,
  ProductStock,
  StaffPermission,
  StaffRole,
  StaffRolePermission,
  StaffUser,
  StaffUserRole,
} from '@acme-core/entities';
import { Note, NoteRevision, Reminder } from '@acme-staff/common/entities';

export const entities: TypeOrmModuleOptions['entities'] = [
  Customer,
  IdempotencyKey,
  LedgerEntry,
  Note,
  NoteRevision,
  Order,
  OrderProduct,
  Product,
  ProductStock,
  Reminder,
  StaffPermission,
  StaffRole,
  StaffRolePermission,
  StaffUser,
  StaffUserRole,
];
