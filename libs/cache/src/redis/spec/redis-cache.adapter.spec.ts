import { Span, trace, Tracer } from '@opentelemetry/api';
import { Redis } from 'ioredis';
import { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { RedisCacheAdapter } from '../redis-cache.adapter';

describe('RedisCacheAdapter', () => {
  let redis: {
    options: { keyPrefix?: string };
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
    scan: jest.Mock;
    unlink: jest.Mock;
  };
  let logger: PinoLoggerMock;
  let spans: { name: string; setAttributes: jest.Mock; end: jest.Mock }[];
  let cache: RedisCacheAdapter;

  beforeEach(() => {
    redis = {
      options: {},
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      scan: jest.fn().mockResolvedValue(['0', []]),
      unlink: jest.fn().mockResolvedValue(0),
    };
    logger = makePinoLoggerMock();
    spans = [];
    jest.spyOn(trace, 'getTracer').mockReturnValue({
      startActiveSpan: (name: string, callback: (span: Span) => unknown) => {
        const span = { name, setAttributes: jest.fn(), end: jest.fn() };

        spans.push(span);

        return callback(span as unknown as Span);
      },
    } as unknown as Tracer);
    cache = new RedisCacheAdapter(redis as unknown as Redis, logger as unknown as PinoLogger);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('get', () => {
    it('returns undefined on a miss and marks the span as a miss', async () => {
      const value = await cache.get('k');

      expect(value).toBeUndefined();
      expect(redis.get).toHaveBeenCalledWith('k');
      expect(spans[0].name).toBe('cache.get');
      expect(spans[0].setAttributes).toHaveBeenCalledWith({ 'cache.key': 'k', 'cache.hit': false });
      expect(spans[0].end).toHaveBeenCalledTimes(1);
    });

    it('returns the parsed value on a hit and marks the span as a hit', async () => {
      redis.get.mockResolvedValue('{"a":1}');

      const value = await cache.get('k');

      expect(value).toEqual({ a: 1 });
      expect(spans[0].setAttributes).toHaveBeenCalledWith({ 'cache.key': 'k', 'cache.hit': true });
    });

    it('treats a cached null as a miss', async () => {
      redis.get.mockResolvedValue('null');

      const value = await cache.get('k');

      expect(value).toBeUndefined();
    });

    it('ends the span when Redis fails', async () => {
      redis.get.mockRejectedValue(new Error('read failed'));

      await expect(cache.get('k')).rejects.toThrow('read failed');
      expect(spans[0].end).toHaveBeenCalledTimes(1);
    });
  });

  describe('set', () => {
    it('stores the value as JSON with the TTL in milliseconds', async () => {
      await cache.set('k', { a: 1 }, 60_000);

      expect(redis.set).toHaveBeenCalledWith('k', '{"a":1}', 'PX', 60_000);
      expect(spans[0].name).toBe('cache.set');
      expect(spans[0].setAttributes).toHaveBeenCalledWith({
        'cache.key': 'k',
        'cache.ttl_ms': 60_000,
      });
    });
  });

  describe('del', () => {
    it('removes the key', async () => {
      await cache.del('k');

      expect(redis.del).toHaveBeenCalledWith('k');
      expect(spans[0].name).toBe('cache.del');
    });
  });

  describe('wrap', () => {
    it('computes on a miss and stores the value with the TTL', async () => {
      const compute = jest.fn().mockResolvedValue('30d');

      const value = await cache.wrap('k', 600_000, compute);

      expect(value).toBe('30d');
      expect(compute).toHaveBeenCalledTimes(1);
      expect(redis.set).toHaveBeenCalledWith('k', '"30d"', 'PX', 600_000);
      expect(spans[0].name).toBe('cache.wrap');
      expect(spans[0].setAttributes).toHaveBeenCalledWith({ 'cache.key': 'k', 'cache.hit': false });
    });

    it('serves a hit from the cache without computing', async () => {
      redis.get.mockResolvedValue('"30d"');
      const compute = jest.fn().mockResolvedValue('other');

      const value = await cache.wrap('k', 600_000, compute);

      expect(value).toBe('30d');
      expect(compute).not.toHaveBeenCalled();
      expect(redis.set).not.toHaveBeenCalled();
      expect(spans[0].setAttributes).toHaveBeenCalledWith({ 'cache.key': 'k', 'cache.hit': true });
    });

    it('caches null but treats a cached null as a miss, recomputing and rewriting it', async () => {
      redis.get.mockResolvedValue('null');
      const compute = jest.fn().mockResolvedValue(null);

      const value = await cache.wrap('k', 600_000, compute);

      expect(value).toBeNull();
      expect(compute).toHaveBeenCalledTimes(1);
      expect(redis.set).toHaveBeenCalledWith('k', 'null', 'PX', 600_000);
    });

    it('does not cache undefined', async () => {
      const compute = jest.fn().mockResolvedValue(undefined);

      const value = await cache.wrap('k', 600_000, compute);

      expect(value).toBeUndefined();
      expect(redis.set).not.toHaveBeenCalled();
    });

    it('collapses concurrent calls for one key into one computation', async () => {
      let release: (value: string) => void = () => undefined;
      const compute = jest.fn(() => new Promise<string>((resolve) => (release = resolve)));

      const first = cache.wrap('k', 600_000, compute);
      const second = cache.wrap('k', 600_000, compute);

      await new Promise(setImmediate);
      release('v');

      const values = await Promise.all([first, second]);

      expect(values).toEqual(['v', 'v']);
      expect(compute).toHaveBeenCalledTimes(1);
    });

    it('computes again once the previous computation has settled', async () => {
      const compute = jest.fn().mockResolvedValue('v');

      await cache.wrap('k', 600_000, compute);
      await cache.wrap('k', 600_000, compute);

      expect(compute).toHaveBeenCalledTimes(2);
    });

    it('computes without writing when the cache cannot be read, so a stalled Redis costs one timeout', async () => {
      redis.get.mockRejectedValue(new Error('read failed'));

      const value = await cache.wrap('k', 600_000, () => Promise.resolve('v'));

      expect(value).toBe('v');
      expect(redis.set).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        { err: new Error('read failed'), key: 'k' },
        'Cache read failed, computing the value without caching it',
      );
      expect(spans[0].setAttributes).toHaveBeenCalledWith({ 'cache.key': 'k', 'cache.hit': false });
    });

    it('returns the computed value when the cache cannot be written', async () => {
      redis.set.mockRejectedValue(new Error('write failed'));

      const value = await cache.wrap('k', 600_000, () => Promise.resolve('v'));

      expect(value).toBe('v');
      expect(logger.warn).toHaveBeenCalledWith(
        { err: new Error('write failed'), key: 'k' },
        'Cache write failed',
      );
    });

    it('lets a failed computation reject every waiting caller', async () => {
      const compute = jest.fn().mockRejectedValue(new Error('compute failed'));

      const first = cache.wrap('k', 600_000, compute);
      const second = cache.wrap('k', 600_000, compute);

      await expect(first).rejects.toThrow('compute failed');
      await expect(second).rejects.toThrow('compute failed');
      expect(compute).toHaveBeenCalledTimes(1);
    });
  });

  describe('delByPrefix', () => {
    it('scans by the client keyPrefix and unlinks the keys without it', async () => {
      redis.options = { keyPrefix: 'app:' };
      redis.scan.mockResolvedValue(['0', ['app:acme:r:1:a', 'app:acme:r:1:b']]);
      redis.unlink.mockResolvedValue(2);

      const unlinked = await cache.delByPrefix('acme:r:1:');

      expect(unlinked).toBe(2);
      expect(redis.scan).toHaveBeenCalledWith('0', 'MATCH', 'app:acme:r:1:*', 'COUNT', 100);
      expect(redis.unlink).toHaveBeenCalledWith('acme:r:1:a', 'acme:r:1:b');
      expect(spans[0].name).toBe('cache.delByPrefix');
      expect(spans[0].setAttributes).toHaveBeenCalledWith({
        'cache.prefix': 'acme:r:1:',
        'cache.keys_unlinked': 2,
      });
    });

    it('follows the scan cursor until it comes back to 0', async () => {
      redis.scan
        .mockResolvedValueOnce(['7', ['acme:r:1:a']])
        .mockResolvedValueOnce(['0', ['acme:r:1:b']]);
      redis.unlink.mockResolvedValue(1);

      const unlinked = await cache.delByPrefix('acme:r:1:');

      expect(unlinked).toBe(2);
      expect(redis.scan).toHaveBeenNthCalledWith(2, '7', 'MATCH', 'acme:r:1:*', 'COUNT', 100);
    });

    it('does not unlink an empty scan page', async () => {
      const unlinked = await cache.delByPrefix('acme:r:1:');

      expect(unlinked).toBe(0);
      expect(redis.unlink).not.toHaveBeenCalled();
    });

    it('logs a failed invalidation and returns 0 instead of failing the caller', async () => {
      redis.scan.mockRejectedValue(new Error('scan failed'));

      const unlinked = await cache.delByPrefix('acme:r:1:');

      expect(unlinked).toBe(0);
      expect(logger.warn).toHaveBeenCalledWith(
        { err: new Error('scan failed'), prefix: 'acme:r:1:' },
        'Cache invalidation failed, entries expire on TTL',
      );
    });
  });
});
