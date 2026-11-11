import { CacheLibDelUseCase } from '../cache-lib-del.use-case';
import type { ICacheLibTracerPort, ICacheLibTracerSpanCommand } from '../../../outbound';

describe('CacheLibDelUseCase', () => {
  let del: jest.Mock;
  let spans: { name: string; attributes: ICacheLibTracerSpanCommand<unknown>['attributes'] }[];
  let useCase: CacheLibDelUseCase;

  beforeEach(() => {
    del = jest.fn().mockResolvedValue(undefined);
    spans = [];
    useCase = new CacheLibDelUseCase(
      { get: jest.fn(), set: jest.fn(), del, unlinkByPrefix: jest.fn() },
      {
        span: async (command: ICacheLibTracerSpanCommand<unknown>) => {
          const attributes = { ...command.attributes };

          spans.push({ name: command.name, attributes });

          return await command.work(attributes);
        },
      } as ICacheLibTracerPort,
    );
  });

  it('removes the key under a cache.del span', async () => {
    await useCase.execute('k');

    expect(del).toHaveBeenCalledWith('k');
    expect(spans).toEqual([{ name: 'cache.del', attributes: { 'cache.key': 'k' } }]);
  });
});
