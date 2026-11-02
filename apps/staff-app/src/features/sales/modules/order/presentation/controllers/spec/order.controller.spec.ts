import { OrderGetManyUseCase, OrderGetOneUseCase } from '../../../application';
import { OrderController } from '../order.controller';

describe('OrderController', () => {
  let getMany: jest.Mock;
  let getOne: jest.Mock;
  let controller: OrderController;

  beforeEach(() => {
    getMany = jest.fn();
    getOne = jest.fn();

    controller = new OrderController(
      { execute: getMany } as unknown as OrderGetManyUseCase,
      { execute: getOne } as unknown as OrderGetOneUseCase,
    );
  });

  describe('handleGetMany', () => {
    it('lists the orders for the page window', async () => {
      getMany.mockResolvedValue({ page: 2, count: 0, pageCount: 0, total: 0, data: [] });

      const response = await controller.handleGetMany({ page: 2, size: 5 });

      expect(response).toEqual({ page: 2, count: 0, pageCount: 0, total: 0, data: [] });
      expect(getMany).toHaveBeenCalledWith({ page: 2, size: 5 });
    });
  });

  describe('handleGetOne', () => {
    it('reads the order of the path', async () => {
      getOne.mockResolvedValue({ id: '600', products: [] });

      const response = await controller.handleGetOne({ orderId: '600' });

      expect(response).toEqual({ id: '600', products: [] });
      expect(getOne).toHaveBeenCalledWith({ orderId: '600' });
    });
  });
});
