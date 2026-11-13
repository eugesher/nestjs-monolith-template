import { Redis } from 'ioredis';
import type { ConfigService } from '@nestjs/config';
import type { PinoLogger } from 'nestjs-pino';

import { TlsHelper } from '@acme-libs/config';
import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing';

import { ThrottleRedisStorage } from '../throttle-redis.storage';

jest.mock('ioredis', () => ({ Redis: jest.fn() }));

describe('ThrottleRedisStorage', () => {
  let redis: {
    status: string;
    on: jest.Mock;
    eval: jest.Mock;
    quit: jest.Mock;
    disconnect: jest.Mock;
  };
  let logger: PinoLoggerMock;
  let storage: ThrottleRedisStorage;

  beforeEach(() => {
    redis = {
      status: 'ready',
      on: jest.fn(),
      eval: jest.fn().mockResolvedValue([1, 60000]),
      quit: jest.fn().mockResolvedValue('OK'),
      disconnect: jest.fn(),
    };
    jest.mocked(Redis).mockImplementation(() => redis as unknown as Redis);
    logger = makePinoLoggerMock();

    const values: Record<string, string | number> = {
      REDIS_HOST: '127.0.0.1',
      REDIS_PORT: 6380,
      REDIS_PASSWORD: 'password',
      REDIS_COMMAND_TIMEOUT_MS: 500,
      REDIS_TLS_CA: '',
    };
    const config = {
      getOrThrow: jest.fn((key: string) => values[key]),
    } as unknown as ConfigService;

    storage = new ThrottleRedisStorage(config, logger as unknown as PinoLogger);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('connects with REDIS_*, fails fast while disconnected and bounds every command', () => {
    expect(Redis).toHaveBeenCalledWith({
      host: '127.0.0.1',
      port: 6380,
      password: 'password',
      enableOfflineQueue: false,
      commandTimeout: 500,
    });
  });

  it('connects over TLS with the certificate authority of REDIS_TLS_CA', () => {
    const options = jest
      .spyOn(TlsHelper, 'options')
      .mockReturnValue({ ca: '-----BEGIN CERTIFICATE-----' });

    const values: Record<string, string | number> = {
      REDIS_HOST: 'redis.example.com',
      REDIS_PORT: 6380,
      REDIS_PASSWORD: 'password',
      REDIS_COMMAND_TIMEOUT_MS: 500,
      REDIS_TLS_CA: '/run/secrets/redis-ca.pem',
    };
    const config = {
      getOrThrow: jest.fn((key: string) => values[key]),
    } as unknown as ConfigService;

    storage = new ThrottleRedisStorage(config, logger as unknown as PinoLogger);

    expect(options).toHaveBeenCalledWith('/run/secrets/redis-ca.pem');
    expect(Redis).toHaveBeenLastCalledWith(
      expect.objectContaining({ tls: { ca: '-----BEGIN CERTIFICATE-----' } }),
    );
  });

  it('logs a Redis connection error as a warning', () => {
    const [[event, onError]] = redis.on.mock.calls as [[string, (error: Error) => void]];
    const error = new Error('connect ECONNREFUSED');

    onError(error);

    expect({ event, warn: logger.warn.mock.calls }).toEqual({
      event: 'error',
      warn: [
        [{ err: error }, 'Redis connection error, requests pass unlimited until it reconnects'],
      ],
    });
  });

  describe('increment', () => {
    it('counts the hit under the prefixed key with the TTL of the throttler in milliseconds', async () => {
      redis.eval.mockResolvedValue([3, 59001]);

      const record = await storage.increment('key-hash', 60000, 10);

      expect(redis.eval).toHaveBeenCalledWith(
        expect.stringContaining("redis.call('INCR', KEYS[1])"),
        1,
        'throttle:key-hash',
        60000,
      );
      expect(record).toEqual({
        totalHits: 3,
        timeToExpire: 60,
        isBlocked: false,
        timeToBlockExpire: 0,
      });
    });

    it('allows the hit that reaches the limit', async () => {
      redis.eval.mockResolvedValue([10, 30000]);

      const record = await storage.increment('key-hash', 60000, 10);

      expect(record.isBlocked).toBe(false);
    });

    it('blocks a hit beyond the limit until the window expires', async () => {
      redis.eval.mockResolvedValue([11, 30000]);

      const record = await storage.increment('key-hash', 60000, 10);

      expect(record).toEqual({
        totalHits: 11,
        timeToExpire: 30,
        isBlocked: true,
        timeToBlockExpire: 30,
      });
    });

    it('lets the request pass with a warning when Redis fails', async () => {
      const error = new Error("Stream isn't writeable and enableOfflineQueue options is false");

      redis.eval.mockRejectedValue(error);

      const record = await storage.increment('key-hash', 60000, 10);

      expect({ record, warn: logger.warn.mock.calls }).toEqual({
        record: { totalHits: 0, timeToExpire: 0, isBlocked: false, timeToBlockExpire: 0 },
        warn: [[{ err: error }, 'Throttle counter is unavailable, the request passes unlimited']],
      });
    });
  });

  describe('onApplicationShutdown', () => {
    it('quits a ready connection', async () => {
      await storage.onApplicationShutdown();

      expect({
        quit: redis.quit.mock.calls.length,
        disconnect: redis.disconnect.mock.calls.length,
      }).toEqual({
        quit: 1,
        disconnect: 0,
      });
    });

    it('lets a failed quit reject', async () => {
      redis.quit.mockRejectedValue(new Error('quit failed'));

      await expect(storage.onApplicationShutdown()).rejects.toThrow('quit failed');
    });

    it('drops a connection that is not ready', async () => {
      redis.status = 'reconnecting';

      await storage.onApplicationShutdown();

      expect({
        quit: redis.quit.mock.calls.length,
        disconnect: redis.disconnect.mock.calls.length,
      }).toEqual({
        quit: 0,
        disconnect: 1,
      });
    });
  });
});
