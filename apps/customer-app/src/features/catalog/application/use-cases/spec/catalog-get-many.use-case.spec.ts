import { CatalogGetManyUseCase } from '../catalog-get-many.use-case';

describe('CatalogGetManyUseCase', () => {
  let list: jest.Mock;
  let useCase: CatalogGetManyUseCase;

  beforeEach(() => {
    list = jest.fn();
    useCase = new CatalogGetManyUseCase({ list });
  });

  describe('execute', () => {
    it('asks the repository for the page of the query', async () => {
      list.mockResolvedValue({ items: [], total: 0, page: 2, size: 10 });

      await useCase.execute({ page: 2, size: 10 });

      expect(list).toHaveBeenCalledWith({ page: 2, size: 10 });
    });

    it('asks for the first page of 20 when the query has no window', async () => {
      list.mockResolvedValue({ items: [], total: 0, page: 1, size: 20 });

      await useCase.execute({ page: undefined, size: undefined });

      expect(list).toHaveBeenCalledWith({ page: 1, size: 20 });
    });

    it('caps the size at 100', async () => {
      list.mockResolvedValue({ items: [], total: 0, page: 1, size: 100 });

      await useCase.execute({ page: 1, size: 500 });

      expect(list).toHaveBeenCalledWith({ page: 1, size: 100 });
    });

    it('answers the page of the repository', async () => {
      list.mockResolvedValue({
        items: [{ id: '12', sku: 'SKU-0001', name: 'Lamp', quantity: 7 }],
        total: 1,
        page: 1,
        size: 20,
      });

      const page = await useCase.execute({ page: undefined, size: undefined });

      expect(page).toEqual({
        items: [{ id: '12', sku: 'SKU-0001', name: 'Lamp', quantity: 7 }],
        total: 1,
        page: 1,
        size: 20,
      });
    });
  });
});
