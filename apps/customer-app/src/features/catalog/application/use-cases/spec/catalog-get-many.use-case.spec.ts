import { CatalogGetManyUseCase } from '../catalog-get-many.use-case';

describe('CatalogGetManyUseCase', () => {
  let list: jest.Mock;
  let read: jest.Mock;
  let useCase: CatalogGetManyUseCase;

  beforeEach(() => {
    list = jest.fn();
    read = jest.fn((query: { compute: () => Promise<unknown> }) => query.compute());
    useCase = new CatalogGetManyUseCase({ list }, { read });
  });

  describe('execute', () => {
    it('reads the page window of the query through the cache', async () => {
      list.mockResolvedValue({ page: 2, count: 0, pageCount: 0, total: 0, data: [] });

      await useCase.execute({ page: 2, limit: 10 });

      const [query] = read.mock.calls[0] as [{ page: number; limit: number }];

      expect(read).toHaveBeenCalledTimes(1);
      expect(query.page).toBe(2);
      expect(query.limit).toBe(10);
    });

    it('computes a miss with the repository page of the same window', async () => {
      list.mockResolvedValue({ page: 2, count: 0, pageCount: 0, total: 0, data: [] });

      await useCase.execute({ page: 2, limit: 10 });

      expect(list).toHaveBeenCalledWith({ page: 2, limit: 10, offset: 10 });
    });

    it('asks for the first page of 20 when the query has no window', async () => {
      list.mockResolvedValue({ page: 1, count: 0, pageCount: 0, total: 0, data: [] });

      await useCase.execute({ page: undefined, limit: undefined });

      expect(list).toHaveBeenCalledWith({ page: 1, limit: 20, offset: 0 });
    });

    it('caps the limit at 100', async () => {
      list.mockResolvedValue({ page: 1, count: 0, pageCount: 0, total: 0, data: [] });

      await useCase.execute({ page: 1, limit: 500 });

      expect(list).toHaveBeenCalledWith({ page: 1, limit: 100, offset: 0 });
    });

    it('answers a cached page without asking the repository', async () => {
      read.mockResolvedValue({
        page: 1,
        count: 1,
        pageCount: 1,
        total: 1,
        data: [{ id: '12', sku: 'SKU-0001', name: 'Lamp' }],
      });

      const page = await useCase.execute({ page: undefined, limit: undefined });

      expect(page).toEqual({
        page: 1,
        count: 1,
        pageCount: 1,
        total: 1,
        data: [{ id: '12', sku: 'SKU-0001', name: 'Lamp' }],
      });
      expect(list).not.toHaveBeenCalled();
    });
  });
});
