import { CatalogProductListUseCase } from '../catalog-product-list.use-case';

describe('CatalogProductListUseCase', () => {
  let list: jest.Mock;
  let read: jest.Mock;
  let useCase: CatalogProductListUseCase;

  beforeEach(() => {
    list = jest.fn();
    read = jest.fn((query: { compute: () => Promise<unknown> }) => query.compute());
    useCase = new CatalogProductListUseCase({ list }, { read }, 60_000);
  });

  describe('execute', () => {
    it('reads the page window of the query through the cache', async () => {
      list.mockResolvedValue([[], 0]);

      await useCase.execute({ page: 2, limit: 10 });

      const [query] = read.mock.calls[0] as [{ page: number; limit: number; ttlMs: number }];

      expect(read).toHaveBeenCalledTimes(1);
      expect(query.page).toBe(2);
      expect(query.limit).toBe(10);
      expect(query.ttlMs).toBe(60_000);
    });

    it('computes a miss with the repository page of the same window', async () => {
      list.mockResolvedValue([[], 0]);

      await useCase.execute({ page: 2, limit: 10 });

      expect(list).toHaveBeenCalledWith({ limit: 10, offset: 10 });
    });

    it('builds the page of a miss from the repository rows and their total', async () => {
      list.mockResolvedValue([[{ id: '12', sku: 'SKU-0001', name: 'Lamp' }], 21]);

      const page = await useCase.execute({ page: 2, limit: 10 });

      expect(page).toEqual({
        page: 2,
        count: 1,
        pageCount: 3,
        total: 21,
        data: [{ id: '12', sku: 'SKU-0001', name: 'Lamp' }],
      });
    });

    it('asks for the first page of 20 when the query has no window', async () => {
      list.mockResolvedValue([[], 0]);

      await useCase.execute({ page: undefined, limit: undefined });

      expect(list).toHaveBeenCalledWith({ limit: 20, offset: 0 });
    });

    it('caps the limit at 100', async () => {
      list.mockResolvedValue([[], 0]);

      await useCase.execute({ page: 1, limit: 500 });

      expect(list).toHaveBeenCalledWith({ limit: 100, offset: 0 });
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
