import { CacheLibGetUseCase } from '../cache-lib-get.use-case';
import type { ICacheLibTracerPort, ICacheLibTracerSpanCommand } from '../../../outbound';

describe('CacheLibGetUseCase', () => {
  let get: jest.Mock;
  let spans: { name: string; attributes: ICacheLibTracerSpanCommand<unknown>['attributes'] }[];
  let useCase: CacheLibGetUseCase;

  beforeEach(() => {
    get = jest.fn().mockResolvedValue(undefined);
    spans = [];
    useCase = new CacheLibGetUseCase(
      { get, set: jest.fn(), del: jest.fn(), unlinkByPrefix: jest.fn() },
      {
        span: async (command: ICacheLibTracerSpanCommand<unknown>) => {
          const attributes = { ...command.attributes };

          spans.push({ name: command.name, attributes });

          return await command.work(attributes);
        },
      } as ICacheLibTracerPort,
    );
  });

  it('returns undefined on a miss and marks the span as a miss', async () => {
    const value = await useCase.execute('k');

    expect(value).toBeUndefined();
    expect(get).toHaveBeenCalledWith('k');
    expect(spans).toEqual([
      { name: 'cache.get', attributes: { 'cache.key': 'k', 'cache.hit': false } },
    ]);
  });

  it('returns the stored value on a hit and marks the span as a hit', async () => {
    get.mockResolvedValue({ a: 1 });

    const value = await useCase.execute('k');

    expect(value).toEqual({ a: 1 });
    expect(spans).toEqual([
      { name: 'cache.get', attributes: { 'cache.key': 'k', 'cache.hit': true } },
    ]);
  });

  it('lets a failed read reject', async () => {
    get.mockRejectedValue(new Error('read failed'));

    await expect(useCase.execute('k')).rejects.toThrow('read failed');
  });
});
