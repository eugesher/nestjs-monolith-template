import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ClsModule } from 'nestjs-cls';
import { DataSource } from 'typeorm';
import type { DynamicModule } from '@nestjs/common';

import { TRANSACTION_PORT } from '@acme-libs/contracts/local-storage';

import {
  LocalStorageTransactionAfterCommitUseCase,
  LocalStorageTransactionRunUseCase,
} from '../application';
import {
  LocalStorageTransactionContextAdapter,
  LocalStorageTransactionHostAdapter,
} from '../infrastructure';
import { LocalStorageTransactionFacade } from './local-storage-transaction.facade';

export class LocalStorageTransactionModule {
  public static forRoot(): DynamicModule {
    const adapter = new TransactionalAdapterTypeOrm({ dataSourceToken: DataSource });
    const transactional = new ClsPluginTransactional({ adapter });

    return {
      module: LocalStorageTransactionModule,
      global: true,
      imports: [ClsModule.registerPlugins([transactional])],
      exports: [TRANSACTION_PORT],
      providers: [
        { provide: TRANSACTION_PORT, useClass: LocalStorageTransactionFacade },
        LocalStorageTransactionRunUseCase,
        LocalStorageTransactionAfterCommitUseCase,
        LocalStorageTransactionHostAdapter.provider,
        LocalStorageTransactionContextAdapter.provider,
      ],
    };
  }
}
