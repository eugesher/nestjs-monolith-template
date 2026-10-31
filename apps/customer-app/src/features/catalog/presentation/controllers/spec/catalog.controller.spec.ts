import { CatalogGetManyUseCase } from '../../../application';
import { CatalogController } from '../catalog.controller';

describe('CatalogController', () => {
  let list: jest.Mock;
  let read: jest.Mock;
  let controller: CatalogController;

  beforeEach(() => {
    list = jest.fn();
    read = jest.fn((query: { compute: () => Promise<unknown> }) => query.compute());
    controller = new CatalogController(new CatalogGetManyUseCase({ list }, { read }));
  });

  describe('handleGetMany', () => {
    it('answers the page for the window of the query string', async () => {
      list.mockResolvedValue({
        items: [{ id: '12', sku: 'SKU-0001', name: 'Lamp', quantity: 7 }],
        total: 1,
        page: 2,
        size: 10,
      });

      const response = await controller.handleGetMany({ page: 2, size: 10 });

      expect(response).toEqual({
        items: [{ id: '12', sku: 'SKU-0001', name: 'Lamp', quantity: 7 }],
        total: 1,
        page: 2,
        size: 10,
      });
      expect(list).toHaveBeenCalledWith({ page: 2, size: 10 });
    });
  });
});
