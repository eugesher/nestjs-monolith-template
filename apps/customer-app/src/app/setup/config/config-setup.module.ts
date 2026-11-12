import { ConfigModule, type ConfigModuleOptions } from '@nestjs/config';
import Joi from 'joi';
import type { DynamicModule } from '@nestjs/common';

import { ConfigSchema, EnvHelper } from '@acme-libs/config';
import { AppNameEnum } from '@acme-libs/kernel';

export class ConfigSetupModule {
  public static async forRoot(): Promise<DynamicModule> {
    const envFilePath = EnvHelper.appEnvFilePaths(AppNameEnum.CUSTOMER_APP);
    const options: ConfigModuleOptions = {
      isGlobal: true,
      envFilePath,
      validationSchema: Joi.object({
        ...ConfigSchema.APP,
        ...ConfigSchema.DATABASE,
        ...ConfigSchema.REDIS,
        ...ConfigSchema.QUEUE,
        ...ConfigSchema.AUTH,
        ...ConfigSchema.HTTP,
        ...ConfigSchema.OBSERVABILITY,
        CACHE_TTL_MS_DEFAULT: Joi.number().integer().positive().required(),
        OCC_RETRY_ATTEMPTS: Joi.number().integer().min(1).required(),
      }),
    };

    return await ConfigModule.forRoot(options);
  }
}
