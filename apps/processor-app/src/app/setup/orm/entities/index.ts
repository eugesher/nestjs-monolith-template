import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import {
  Customer,
  IdempotencyKey,
  LedgerEntry,
  Order,
  OrderProduct,
  Product,
  ProductStock,
} from '@acme-core/entities';

export const entities: TypeOrmModuleOptions['entities'] = [
  Customer,
  IdempotencyKey,
  LedgerEntry,
  Order,
  OrderProduct,
  Product,
  ProductStock,
];
