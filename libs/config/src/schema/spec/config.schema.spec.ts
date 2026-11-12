import Joi from 'joi';

import { ConfigSchema } from '../config.schema';

describe('ConfigSchema', () => {
  describe('APP', () => {
    it('accepts the API reference outside production', () => {
      const { error } = Joi.object(ConfigSchema.APP).validate({
        NODE_ENV: 'development',
        PORT: 3000,
        API_PREFIX: 'api',
        API_USE_API_REFERENCE: true,
      });

      expect(error).toBeUndefined();
    });

    it('refuses the API reference in production', () => {
      const { error } = Joi.object(ConfigSchema.APP).validate({
        NODE_ENV: 'production',
        PORT: 3000,
        API_PREFIX: 'api',
        API_USE_API_REFERENCE: true,
      });

      expect(error?.message).toBe('"API_USE_API_REFERENCE" must be [false]');
    });
  });

  describe('AUTH', () => {
    it('refuses an argon2 memory cost below eight KiB per lane', () => {
      const { error } = Joi.object(ConfigSchema.AUTH).validate({
        JWT_SECRET: 'a-secret-of-at-least-thirty-two-chars',
        JWT_EXPIRES_IN: '15m',
        AUTH_ARGON2_MEMORY_COST: 31,
        AUTH_ARGON2_TIME_COST: 2,
        AUTH_ARGON2_PARALLELISM: 4,
        AUTH_ARGON2_MAX_CONCURRENCY: 4,
        AUTH_ARGON2_QUEUE_TIMEOUT_MS: 5000,
      });

      expect(error?.message).toBe(
        '"AUTH_ARGON2_MEMORY_COST" must be greater than or equal to ref:AUTH_ARGON2_PARALLELISM',
      );
    });
  });

  it('lists every variable once across the fragments', () => {
    const keys = [
      ConfigSchema.APP,
      ConfigSchema.DATABASE,
      ConfigSchema.REDIS,
      ConfigSchema.QUEUE,
      ConfigSchema.AUTH,
      ConfigSchema.HTTP,
      ConfigSchema.OBSERVABILITY,
    ].flatMap((fragment) => Object.keys(fragment));

    expect(new Set(keys).size).toBe(keys.length);
  });
});
