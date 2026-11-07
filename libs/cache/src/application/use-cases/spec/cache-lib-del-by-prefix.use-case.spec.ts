import { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';

import { ICacheLibTracerPort, ICacheLibTracerSpanCommand } from '../../../outbound';
import { CacheLibDelByPrefixUseCase } from '../cache-lib-del-by-prefix.use-case';

describe('CacheLibDelByPrefixUseCase', () => {
  let unlinkByPrefix: jest.Mock;
  let spans: { name: string; attributes: ICacheLibTracerSpanCommand<unknown>['attributes'] }[];
  let logger: PinoLoggerMock;
  let useCase: CacheLibDelByPrefixUseCase;

  beforeEach(() => {
    unlinkByPrefix = jest.fn().mockResolvedValue(2);
    spans = [];
    logger = makePinoLoggerMock();
    useCase = new CacheLibDelByPrefixUseCase(
      { get: jest.fn(), set: jest.fn(), del: jest.fn(), unlinkByPrefix },
      {
        span: async (command: ICacheLibTracerSpanCommand<unknown>) => {
          const attributes = { ...command.attributes };

          spans.push({ name: command.name, attributes });

          return await command.work(attributes);
        },
      } as ICacheLibTracerPort,
      logger as unknown as PinoLogger,
    );
  });

  it('unlinks the keys under the prefix and counts them on the span', async () => {
    const unlinked = await useCase.execute('acme:r:1:');

    expect(unlinked).toBe(2);
    expect(unlinkByPrefix).toHaveBeenCalledWith('acme:r:1:');
    expect(spans).toEqual([
      {
        name: 'cache.delByPrefix',
        attributes: { 'cache.prefix': 'acme:r:1:', 'cache.keys_unlinked': 2 },
      },
    ]);
  });

  it('logs a failed invalidation and returns 0 instead of failing the caller', async () => {
    unlinkByPrefix.mockRejectedValue(new Error('scan failed'));

    const unlinked = await useCase.execute('acme:r:1:');

    expect(unlinked).toBe(0);
    expect(logger.warn).toHaveBeenCalledWith(
      { err: new Error('scan failed'), prefix: 'acme:r:1:' },
      'Cache invalidation failed, entries expire on TTL',
    );
  });
});
