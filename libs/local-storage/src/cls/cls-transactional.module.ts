import { DynamicModule } from '@nestjs/common';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ClsModule } from 'nestjs-cls';
import { DataSource } from 'typeorm';

import { TRANSACTION_PORT } from '@acme-libs/contracts/database';

import { ClsTransactionAdapter } from './cls-transaction.adapter';

export class ClsTransactionalModule {
  public static forRoot(): DynamicModule {
    const adapter = new TransactionalAdapterTypeOrm({ dataSourceToken: DataSource });
    const transactional = new ClsPluginTransactional({ adapter });

    return {
      module: ClsTransactionalModule,
      global: true,
      imports: [ClsModule.registerPlugins([transactional])],
      providers: [{ provide: TRANSACTION_PORT, useClass: ClsTransactionAdapter }],
      exports: [TRANSACTION_PORT],
    };
  }
}
