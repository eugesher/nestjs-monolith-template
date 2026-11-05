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

export const entities: TypeOrmModuleOptions['entities'] = [
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
];
