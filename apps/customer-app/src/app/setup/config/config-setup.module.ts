import { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import Joi from 'joi';

import { EnvHelper } from '@acme-libs/config';
import { AppNameEnum } from '@acme-libs/kernel';

export class ConfigSetupModule {
  public static forRoot(): Promise<DynamicModule> {
    const development = !EnvHelper.isProduction();
    const envFilePath = EnvHelper.appEnvFilePaths(AppNameEnum.CUSTOMER_APP);
    const options: ConfigModuleOptions = {
      isGlobal: true,
      envFilePath,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),

        PORT: Joi.number().port().required(),
        API_PREFIX: Joi.string().default('api'),
        API_USE_API_REFERENCE: Joi.boolean().default(development),

        DATABASE_URL: Joi.string().uri({ scheme: 'mysql' }).required(),
        DATABASE_LOGGING: Joi.boolean().default(development),

        REDIS_URL: Joi.string().uri({ scheme: 'redis' }).required(),
        REDIS_COMMAND_TIMEOUT_MS: Joi.number().integer().positive().default(500),
        CACHE_TTL_MS_DEFAULT: Joi.number().integer().positive().default(60_000),

        OCC_RETRY_ATTEMPTS: Joi.number().integer().min(1).default(5),
        IDEMPOTENCY_KEY_TTL_HOURS: Joi.number().integer().min(1).default(24),

        JWT_ACCESS_SECRET: Joi.string().min(32).required(),
        JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_SECRET: Joi.string()
          .min(32)
          .required()
          .invalid(Joi.ref('JWT_ACCESS_SECRET'))
          .messages({ 'any.invalid': 'JWT_REFRESH_SECRET must differ from JWT_ACCESS_SECRET' }),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        AUTH_ARGON2_MEMORY_COST: Joi.number().integer().positive().default(19_456),
        AUTH_ARGON2_TIME_COST: Joi.number().integer().positive().default(2),
        AUTH_ARGON2_PARALLELISM: Joi.number().integer().positive().default(1),

        LOG_LEVEL: Joi.string()
          .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
          .optional(),

        OTEL_SDK_DISABLED: Joi.boolean().default(true),
        OTEL_SERVICE_NAME: Joi.string().default(AppNameEnum.CUSTOMER_APP),
        OTEL_EXPORTER_OTLP_ENDPOINT: Joi.string()
          .uri({ scheme: ['http', 'https'] })
          .default('http://localhost:4318/v1/traces'),
        OTEL_RESOURCE_ATTRIBUTES: Joi.string().optional(),
      }),
    };

    return ConfigModule.forRoot(options);
  }
}
