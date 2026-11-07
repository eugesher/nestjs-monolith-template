import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ClsModule } from 'nestjs-cls';
import { DataSource } from 'typeorm';

import { REPOSITORY_HOST_PORT, TRANSACTION_PORT } from '@acme-libs/contracts/database';

import { SnakeNamingStrategy } from '../naming/snake-naming.strategy';
import { RepositoryHostAdapter } from '../repository/repository-host.adapter';
import { TransactionAdapter } from '../transaction/transaction.adapter';

export class TypeOrmSetupModule {
  public static forRoot(entities: TypeOrmModuleOptions['entities']): DynamicModule {
    const typeOrm = TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions =>
        TypeOrmSetupModule.options(config, entities),
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

  private static options(
    config: ConfigService,
    entities: TypeOrmModuleOptions['entities'],
  ): TypeOrmModuleOptions {
    const url = config.getOrThrow<string>('DATABASE_URL');
    const logging = config.getOrThrow<boolean>('DATABASE_LOGGING');
    const namingStrategy = new SnakeNamingStrategy();

    return {
      entities,
      type: 'mysql',
      url,
      logging,
      synchronize: false,
      timezone: 'Z',
      dateStrings: ['DATE'],
      charset: 'utf8mb4',
      namingStrategy,
    };
  }
}
