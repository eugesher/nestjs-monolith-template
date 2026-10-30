import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Customer, LedgerEntry } from '@acme-core/entities';

export const entities: TypeOrmModuleOptions['entities'] = [Customer, LedgerEntry];
