import { CatalogProductListUseCase } from '../../../application';
import { CatalogController } from '../catalog.controller';

describe('CatalogController', () => {
  let list: jest.Mock;
  let read: jest.Mock;
  let controller: CatalogController;

  beforeEach(() => {
    list = jest.fn();
    read = jest.fn((query: { compute: () => Promise<unknown> }) => query.compute());
    controller = new CatalogController(new CatalogProductListUseCase({ list }, { read }, 60_000));
  });

  describe('handleProductList', () => {
    it('answers the page for the window of the query string', async () => {
      list.mockResolvedValue([[{ id: '12', sku: 'SKU-0001', name: 'Lamp' }], 1]);

      const response = await controller.handleProductList({ page: 2, limit: 10 });

      expect(response).toEqual({
        page: 2,
        count: 1,
        pageCount: 1,
        total: 1,
        data: [{ id: '12', sku: 'SKU-0001', name: 'Lamp' }],
      });
      expect(list).toHaveBeenCalledWith({ limit: 10, offset: 10 });
    });
  });
});
