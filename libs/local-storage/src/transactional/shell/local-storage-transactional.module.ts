import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ClsModule } from 'nestjs-cls';
import { DataSource } from 'typeorm';
import type { DynamicModule } from '@nestjs/common';

import { TRANSACTION_PORT } from '@acme-libs/contracts/local-storage';

import {
  LocalStorageTransactionalAfterCommitUseCase,
  LocalStorageTransactionalRunUseCase,
} from '../application';
import {
  LocalStorageTransactionalContextAdapter,
  LocalStorageTransactionalHostAdapter,
} from '../infrastructure';
import { LocalStorageTransactionalFacade } from './local-storage-transactional.facade';

export class LocalStorageTransactionalModule {
  public static forRoot(): DynamicModule {
    const adapter = new TransactionalAdapterTypeOrm({ dataSourceToken: DataSource });
    const transactional = new ClsPluginTransactional({ adapter });

    return {
      module: LocalStorageTransactionalModule,
      global: true,
      imports: [ClsModule.registerPlugins([transactional])],
      exports: [TRANSACTION_PORT],
      providers: [
        { provide: TRANSACTION_PORT, useClass: LocalStorageTransactionalFacade },
        LocalStorageTransactionalRunUseCase,
        LocalStorageTransactionalAfterCommitUseCase,
        LocalStorageTransactionalHostAdapter.provider,
        LocalStorageTransactionalContextAdapter.provider,
      ],
    };
  }
}
