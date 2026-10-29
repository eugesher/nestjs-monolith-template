import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Customer, IdempotencyKey, Item, LedgerEntry, Reminder } from '@acme-core/entities';

export const entities: TypeOrmModuleOptions['entities'] = [
  Customer,
  IdempotencyKey,
  Item,
  LedgerEntry,
  Reminder,
];
