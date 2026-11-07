import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { SnakeNamingStrategy } from '../naming/snake-naming.strategy';
import { RepositoryHostAdapter } from '../repository/repository-host.adapter';

export class TypeOrmSetupModule {
  public static forRoot(entities: TypeOrmModuleOptions['entities']): DynamicModule {
    const typeOrm = TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions =>
        TypeOrmSetupModule.options(config, entities),
    });

    return {
      module: TypeOrmSetupModule,
      global: true,
      imports: [typeOrm],
      exports: [REPOSITORY_HOST_PORT],
      providers: [{ provide: REPOSITORY_HOST_PORT, useClass: RepositoryHostAdapter }],
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
