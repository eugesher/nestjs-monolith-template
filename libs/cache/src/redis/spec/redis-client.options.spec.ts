import { ConfigService } from '@nestjs/config';

import { RedisClientOptions } from '../redis-client.options';

describe('RedisClientOptions', () => {
  it('fails fast while disconnected instead of queuing commands', () => {
    const config = { getOrThrow: jest.fn().mockReturnValue(500) } as unknown as ConfigService;

    const options = new RedisClientOptions(config);

    expect(options.enableOfflineQueue).toBe(false);
  });

  it('bounds every command with REDIS_COMMAND_TIMEOUT_MS', () => {
    const getOrThrow = jest.fn().mockReturnValue(1200);
    const config = { getOrThrow } as unknown as ConfigService;

    const options = new RedisClientOptions(config);

    expect(options.commandTimeout).toBe(1200);
    expect(getOrThrow).toHaveBeenCalledWith('REDIS_COMMAND_TIMEOUT_MS');
  });
});
