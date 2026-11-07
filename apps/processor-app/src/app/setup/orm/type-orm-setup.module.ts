import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ClsModule } from 'nestjs-cls';
import { DataSource } from 'typeorm';

import {
  RepositoryHostAdapter,
  SnakeNamingStrategy,
  TransactionAdapter,
} from '@acme-libs/database';
import { REPOSITORY_HOST_PORT, TRANSACTION_PORT } from '@acme-libs/contracts/database';

import { entities } from './entities';

export class TypeOrmSetupModule {
  public static forRoot(): DynamicModule {
    const typeOrm = TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        entities,
        type: 'mysql',
        url: config.getOrThrow<string>('DATABASE_URL'),
        logging: config.getOrThrow<boolean>('DATABASE_LOGGING'),
        synchronize: false,
        timezone: 'Z',
        dateStrings: ['DATE'],
        charset: 'utf8mb4',
        namingStrategy: new SnakeNamingStrategy(),
      }),
    });
    const transactional = new ClsPluginTransactional({
      imports: [typeOrm],
      adapter: new TransactionalAdapterTypeOrm({ dataSourceToken: DataSource }),
    });

    return {
      module: TypeOrmSetupModule,
      global: true,
      imports: [typeOrm, ClsModule.registerPlugins([transactional])],
      providers: [
        { provide: TRANSACTION_PORT, useClass: TransactionAdapter },
        { provide: REPOSITORY_HOST_PORT, useClass: RepositoryHostAdapter },
      ],
      exports: [TRANSACTION_PORT, REPOSITORY_HOST_PORT],
    };
  }
}
