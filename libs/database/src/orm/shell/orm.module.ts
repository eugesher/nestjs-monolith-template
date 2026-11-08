import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { LocalStorageTransactionModule } from '@acme-libs/local-storage';
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
      imports: [OrmModule.forRootAsync(entities), LocalStorageTransactionModule.forRoot()],
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
      },
    });
  }
}
