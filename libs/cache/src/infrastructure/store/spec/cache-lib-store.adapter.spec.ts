import { Redis } from 'ioredis';

import { CacheLibStoreAdapter } from '../cache-lib-store.adapter';

describe('CacheLibStoreAdapter', () => {
  let redis: {
    options: { keyPrefix?: string };
    status: string;
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
    scan: jest.Mock;
    unlink: jest.Mock;
    quit: jest.Mock;
    disconnect: jest.Mock;
  };
  let store: CacheLibStoreAdapter;

  beforeEach(() => {
    redis = {
      options: {},
      status: 'ready',
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      scan: jest.fn().mockResolvedValue(['0', []]),
      unlink: jest.fn().mockResolvedValue(0),
      quit: jest.fn().mockResolvedValue('OK'),
      disconnect: jest.fn(),
    };
    store = new CacheLibStoreAdapter(redis as unknown as Redis);
  });

  describe('get', () => {
    it('returns undefined on a miss', async () => {
      const value = await store.get('k');

      expect(value).toBeUndefined();
      expect(redis.get).toHaveBeenCalledWith('k');
    });

    it('returns the parsed value on a hit', async () => {
      redis.get.mockResolvedValue('{"a":1}');

      const value = await store.get('k');

      expect(value).toEqual({ a: 1 });
    });

    it('treats a cached null as a miss', async () => {
      redis.get.mockResolvedValue('null');

      const value = await store.get('k');

      expect(value).toBeUndefined();
    });
  });

  describe('set', () => {
    it('stores the value as JSON with the TTL in milliseconds', async () => {
      await store.set({ key: 'k', value: { a: 1 }, ttlMs: 60_000 });

      expect(redis.set).toHaveBeenCalledWith('k', '{"a":1}', 'PX', 60_000);
    });
  });

  describe('del', () => {
    it('removes the key', async () => {
      await store.del('k');

      expect(redis.del).toHaveBeenCalledWith('k');
    });
  });

  describe('unlinkByPrefix', () => {
    it('scans by the client keyPrefix and unlinks the keys without it', async () => {
      redis.options = { keyPrefix: 'app:' };
      redis.scan.mockResolvedValue(['0', ['app:acme:r:1:a', 'app:acme:r:1:b']]);
      redis.unlink.mockResolvedValue(2);

      const unlinked = await store.unlinkByPrefix('acme:r:1:');

      expect(unlinked).toBe(2);
      expect(redis.scan).toHaveBeenCalledWith('0', 'MATCH', 'app:acme:r:1:*', 'COUNT', 100);
      expect(redis.unlink).toHaveBeenCalledWith('acme:r:1:a', 'acme:r:1:b');
    });

    it('follows the scan cursor until it comes back to 0', async () => {
      redis.scan
        .mockResolvedValueOnce(['7', ['acme:r:1:a']])
        .mockResolvedValueOnce(['0', ['acme:r:1:b']]);
      redis.unlink.mockResolvedValue(1);

      const unlinked = await store.unlinkByPrefix('acme:r:1:');

      expect(unlinked).toBe(2);
      expect(redis.scan).toHaveBeenNthCalledWith(2, '7', 'MATCH', 'acme:r:1:*', 'COUNT', 100);
    });

    it('does not unlink an empty scan page', async () => {
      const unlinked = await store.unlinkByPrefix('acme:r:1:');

      expect(unlinked).toBe(0);
      expect(redis.unlink).not.toHaveBeenCalled();
    });

    it('lets a failed scan reject', async () => {
      redis.scan.mockRejectedValue(new Error('scan failed'));

      await expect(store.unlinkByPrefix('acme:r:1:')).rejects.toThrow('scan failed');
    });
  });

  describe('onApplicationShutdown', () => {
    it('quits gracefully when the connection is ready', async () => {
      await store.onApplicationShutdown();

      expect(redis.quit).toHaveBeenCalledTimes(1);
      expect(redis.disconnect).not.toHaveBeenCalled();
    });

    it.each(['connecting', 'reconnecting', 'wait'])(
      'disconnects at once when the connection is %s, instead of queuing QUIT forever',
      async (status) => {
        redis.status = status;

        await store.onApplicationShutdown();

        expect(redis.disconnect).toHaveBeenCalledTimes(1);
        expect(redis.quit).not.toHaveBeenCalled();
      },
    );
  });
});
