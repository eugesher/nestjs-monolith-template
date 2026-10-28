import { Redis } from 'ioredis';

import { CacheModule } from '../cache.module';

describe('CacheModule', () => {
  describe('onApplicationShutdown', () => {
    it('quits gracefully when the connection is ready', async () => {
      const redis = {
        status: 'ready',
        quit: jest.fn().mockResolvedValue('OK'),
        disconnect: jest.fn(),
      };

      await new CacheModule(redis as unknown as Redis).onApplicationShutdown();

      expect(redis.quit).toHaveBeenCalledTimes(1);
      expect(redis.disconnect).not.toHaveBeenCalled();
    });

    it.each(['connecting', 'reconnecting', 'wait'])(
      'disconnects at once when the connection is %s, instead of queuing QUIT forever',
      async (status) => {
        const redis = { status, quit: jest.fn().mockResolvedValue('OK'), disconnect: jest.fn() };

        await new CacheModule(redis as unknown as Redis).onApplicationShutdown();

        expect(redis.disconnect).toHaveBeenCalledTimes(1);
        expect(redis.quit).not.toHaveBeenCalled();
      },
    );
  });
});
