import { CacheLibSetUseCase } from '../cache-lib-set.use-case';
import type { ICacheLibTracerPort, ICacheLibTracerSpanCommand } from '../../../outbound';

describe('CacheLibSetUseCase', () => {
  let set: jest.Mock;
  let spans: { name: string; attributes: ICacheLibTracerSpanCommand<unknown>['attributes'] }[];
  let useCase: CacheLibSetUseCase;

  beforeEach(() => {
    set = jest.fn().mockResolvedValue(undefined);
    spans = [];
    useCase = new CacheLibSetUseCase(
      { get: jest.fn(), set, del: jest.fn(), unlinkByPrefix: jest.fn() },
      {
        span: async (command: ICacheLibTracerSpanCommand<unknown>) => {
          const attributes = { ...command.attributes };

          spans.push({ name: command.name, attributes });

          return await command.work(attributes);
        },
      } as ICacheLibTracerPort,
    );
  });

  it('stores the value with the TTL in milliseconds under a cache.set span', async () => {
    await useCase.execute({ key: 'k', value: { a: 1 }, ttlMs: 60_000 });

    expect(set).toHaveBeenCalledWith({ key: 'k', value: { a: 1 }, ttlMs: 60_000 });
    expect(spans).toEqual([
      { name: 'cache.set', attributes: { 'cache.key': 'k', 'cache.ttl_ms': 60_000 } },
    ]);
  });
});
