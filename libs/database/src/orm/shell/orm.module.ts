import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { DynamicModule } from '@nestjs/common';

import { TlsHelper } from '@acme-libs/config';
import { LocalStorageTransactionalModule } from '@acme-libs/local-storage';
import { ORM_PORT } from '@acme-libs/contracts/database';

import { SnakeNamingStrategy } from '../../naming/snake-naming.strategy';
import { OrmGetRepositoryUseCase } from '../application';
import { OrmHostAdapter } from '../infrastructure';
import { OrmFacade } from './orm.facade';

export class OrmModule {
  public static forRoot(entities: TypeOrmModuleOptions['entities']): DynamicModule {
    return {
      module: OrmModule,
      global: true,
      imports: [OrmModule.forRootAsync(entities), LocalStorageTransactionalModule.forRoot()],
      exports: [ORM_PORT],
      providers: [
        { provide: ORM_PORT, useClass: OrmFacade },
        OrmGetRepositoryUseCase,
        OrmHostAdapter.provider,
      ],
    };
  }

  private static forRootAsync(entities: TypeOrmModuleOptions['entities']): DynamicModule {
    return TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const host = config.getOrThrow<string>('DATABASE_HOST');
        const port = config.getOrThrow<number>('DATABASE_PORT');
        const username = config.getOrThrow<string>('DATABASE_USER');
        const password = config.getOrThrow<string>('DATABASE_PASSWORD');
        const database = config.getOrThrow<string>('DATABASE_NAME');
        const logging = config.getOrThrow<boolean>('DATABASE_LOGGING');
        const caPath = config.getOrThrow<string>('DATABASE_SSL_CA');
        const poolSize = config.getOrThrow<number>('DATABASE_POOL_SIZE');
        const queueLimit = config.getOrThrow<number>('DATABASE_POOL_QUEUE_LIMIT');
        const ssl = TlsHelper.options(caPath);
        const namingStrategy = new SnakeNamingStrategy();

        return {
          entities,
          type: 'mysql',
          host,
          port,
          username,
          password,
          database,
          ssl,
          logging,
          synchronize: false,
          timezone: 'Z',
          dateStrings: ['DATE'],
          charset: 'utf8mb4',
          namingStrategy,
          poolSize,
          extra: { queueLimit },
        };
      },
    });
  }
}
