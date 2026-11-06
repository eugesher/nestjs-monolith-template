import { Module } from '@nestjs/common';

import { LedgerListEntriesUseCase } from './application';
import { LedgerListEntriesRepository } from './infrastructure';
import { LedgerController } from './presentation';

@Module({
  controllers: [LedgerController],
  providers: [LedgerListEntriesUseCase, LedgerListEntriesRepository.provider],
})
export class LedgerModule {}
