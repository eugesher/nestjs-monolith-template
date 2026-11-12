import Joi from 'joi';

export class ConfigSchema {
  public static readonly APP: Joi.SchemaMap = {
    NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
    PORT: Joi.number().port().min(1).required(),
    API_PREFIX: Joi.string()
      .pattern(/^[a-z0-9-]+$/)
      .required(),
    API_USE_API_REFERENCE: Joi.boolean()
      .when('NODE_ENV', { is: 'production', then: Joi.valid(false) })
      .required(),
  };
  public static readonly DATABASE: Joi.SchemaMap = {
    DATABASE_HOST: Joi.string().hostname().required(),
    DATABASE_PORT: Joi.number().port().min(1).required(),
    DATABASE_USER: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
    DATABASE_LOGGING: Joi.boolean().required(),
    DATABASE_SSL_CA: Joi.string().allow('').required(),
    DATABASE_POOL_SIZE: Joi.number().integer().positive().required(),
    DATABASE_POOL_QUEUE_LIMIT: Joi.number().integer().min(0).required(),
  };
  public static readonly REDIS: Joi.SchemaMap = {
    REDIS_HOST: Joi.string().hostname().required(),
    REDIS_PORT: Joi.number().port().min(1).required(),
    REDIS_PASSWORD: Joi.string().required(),
    REDIS_TLS_CA: Joi.string().allow('').required(),
    REDIS_COMMAND_TIMEOUT_MS: Joi.number().integer().positive().required(),
  };
  public static readonly QUEUE: Joi.SchemaMap = {
    LEDGER_ENQUEUE_RETRY_ATTEMPTS: Joi.number().integer().min(1).required(),
    ENQUEUE_RETRY_ATTEMPTS: Joi.number().integer().min(1).required(),
  };
  public static readonly AUTH: Joi.SchemaMap = {
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
  };
  public static readonly HTTP: Joi.SchemaMap = {
    HTTP_TRUST_PROXY_HOPS: Joi.number().integer().min(0).required(),
    HTTP_CORS_ORIGINS: Joi.string()
      .allow('')
      .pattern(/^https?:\/\/[^\s,/]+(,https?:\/\/[^\s,/]+)*$/)
      .required(),
    THROTTLE_TTL_MS: Joi.number().integer().positive().required(),
    THROTTLE_LIMIT: Joi.number().integer().positive().required(),
    THROTTLE_AUTH_TTL_MS: Joi.number().integer().positive().required(),
    THROTTLE_AUTH_LIMIT: Joi.number().integer().positive().required(),
  };
  public static readonly OBSERVABILITY: Joi.SchemaMap = {
    LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace').required(),
    OTEL_SDK_DISABLED: Joi.boolean().required(),
    OTEL_SERVICE_NAME: Joi.string().required(),
    OTEL_EXPORTER_OTLP_ENDPOINT: Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .required(),
    OTEL_RESOURCE_ATTRIBUTES: Joi.string()
      .pattern(/^[^=,\s]+=[^=,\s]+(,[^=,\s]+=[^=,\s]+)*$/)
      .required(),
  };
}
