import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { IdempotencyKey, LedgerEntry } from '@acme-core/entities';

export const entities: TypeOrmModuleOptions['entities'] = [IdempotencyKey, LedgerEntry];
