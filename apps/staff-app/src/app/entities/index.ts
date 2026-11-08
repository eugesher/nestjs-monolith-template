import {
  Customer,
  IdempotencyKey,
  LedgerEntry,
  Order,
  OrderProduct,
  Product,
  ProductStock,
  StaffRole,
  StaffRolePermission,
  StaffUser,
  StaffUserRole,
} from '@acme-core/entities';
import { Note, NoteRevision, Reminder, SubjectTag, Tag } from '@acme-staff/common/entities';

export const entities = [
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
  StaffRole,
  StaffRolePermission,
  StaffUser,
  StaffUserRole,
  SubjectTag,
  Tag,
];
