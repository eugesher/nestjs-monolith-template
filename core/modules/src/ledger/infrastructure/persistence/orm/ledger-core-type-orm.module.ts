import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LedgerEntry } from '@acme-core/entities';

export class LedgerCoreTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([LedgerEntry]);
  }
}
