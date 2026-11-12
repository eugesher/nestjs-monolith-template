import { ConfigModule, type ConfigModuleOptions } from '@nestjs/config';
import Joi from 'joi';
import type { DynamicModule } from '@nestjs/common';

import { EnvHelper } from '@acme-libs/config';
import { AppNameEnum } from '@acme-libs/kernel';

export class ConfigSetupModule {
  public static async forRoot(): Promise<DynamicModule> {
    const envFilePath = EnvHelper.appEnvFilePaths(AppNameEnum.STAFF_APP);
    const options: ConfigModuleOptions = {
      isGlobal: true,
      envFilePath,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),

        PORT: Joi.number().port().min(1).required(),
        API_PREFIX: Joi.string()
          .pattern(/^[a-z0-9-]+$/)
          .required(),
        API_USE_API_REFERENCE: Joi.boolean()
          .when('NODE_ENV', { is: 'production', then: Joi.valid(false) })
          .required(),

        DATABASE_HOST: Joi.string().hostname().required(),
        DATABASE_PORT: Joi.number().port().min(1).required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_LOGGING: Joi.boolean().required(),
        DATABASE_SSL_CA: Joi.string().allow('').required(),
        DATABASE_POOL_SIZE: Joi.number().integer().positive().required(),
        DATABASE_POOL_QUEUE_LIMIT: Joi.number().integer().min(0).required(),

        REDIS_HOST: Joi.string().hostname().required(),
        REDIS_PORT: Joi.number().port().min(1).required(),
        REDIS_PASSWORD: Joi.string().required(),
        REDIS_TLS_CA: Joi.string().allow('').required(),
        REDIS_COMMAND_TIMEOUT_MS: Joi.number().integer().positive().required(),
        CACHE_TTL_MS_DEFAULT: Joi.number().integer().positive().required(),

        OCC_RETRY_ATTEMPTS: Joi.number().integer().min(1).required(),
        LEDGER_RETRY_ATTEMPTS: Joi.number().integer().min(1).required(),
        QUEUE_RETRY_ATTEMPTS: Joi.number().integer().min(1).required(),

        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string()
          .pattern(/^[1-9]\d*[smhdwy]$/)
          .required(),
        AUTH_ARGON2_MEMORY_COST: Joi.number()
          .integer()
          .min(
            Joi.ref('AUTH_ARGON2_PARALLELISM', {
              adjust: (parallelism: number) => parallelism * 8,
            }),
          )
          .required(),
        AUTH_ARGON2_TIME_COST: Joi.number().integer().positive().required(),
        AUTH_ARGON2_PARALLELISM: Joi.number().integer().positive().required(),
        AUTH_ARGON2_MAX_CONCURRENCY: Joi.number().integer().positive().required(),
        AUTH_ARGON2_QUEUE_TIMEOUT_MS: Joi.number().integer().positive().required(),

        HTTP_TRUST_PROXY_HOPS: Joi.number().integer().min(0).required(),
        HTTP_CORS_ORIGINS: Joi.string()
          .allow('')
          .pattern(/^https?:\/\/[^\s,/]+(,https?:\/\/[^\s,/]+)*$/)
          .required(),
        THROTTLE_TTL_MS: Joi.number().integer().positive().required(),
        THROTTLE_LIMIT: Joi.number().integer().positive().required(),
        THROTTLE_AUTH_TTL_MS: Joi.number().integer().positive().required(),
        THROTTLE_AUTH_LIMIT: Joi.number().integer().positive().required(),

        LOG_LEVEL: Joi.string()
          .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
          .required(),

        OTEL_SDK_DISABLED: Joi.boolean().required(),
        OTEL_SERVICE_NAME: Joi.string().required(),
        OTEL_EXPORTER_OTLP_ENDPOINT: Joi.string()
          .uri({ scheme: ['http', 'https'] })
          .required(),
        OTEL_RESOURCE_ATTRIBUTES: Joi.string()
          .pattern(/^[^=,\s]+=[^=,\s]+(,[^=,\s]+=[^=,\s]+)*$/)
          .required(),
      }),
    };

    return await ConfigModule.forRoot(options);
  }
}
