import { OrderGetManyUseCase, OrderGetOneUseCase, OrderPlaceUseCase } from '../../../application';
import { OrderController } from '../order.controller';

describe('OrderController', () => {
  let place: jest.Mock;
  let getMany: jest.Mock;
  let getOne: jest.Mock;
  let controller: OrderController;

  beforeEach(() => {
    place = jest.fn();
    getMany = jest.fn();
    getOne = jest.fn();

    controller = new OrderController(
      { execute: place } as unknown as OrderPlaceUseCase,
      { execute: getMany } as unknown as OrderGetManyUseCase,
      { execute: getOne } as unknown as OrderGetOneUseCase,
    );
  });

  describe('handlePlace', () => {
    it('places the order of the body for the caller under the idempotency key', async () => {
      place.mockResolvedValue({ id: '610', products: [] });

      const response = await controller.handlePlace(
        { id: 'customer-1', email: 'ann@example.com' },
        { productIds: ['100', '100'] },
        'key-1',
      );

      expect(response).toEqual({ id: '610', products: [] });
      expect(place).toHaveBeenCalledWith({
        customerId: 'customer-1',
        productIds: ['100', '100'],
        idempotencyKey: 'key-1',
      });
    });
  });

  describe('handleGetMany', () => {
    it('lists the orders of the caller for the page window', async () => {
      getMany.mockResolvedValue({ items: [], total: 0, page: 2, size: 5 });

      const response = await controller.handleGetMany(
        { id: 'customer-1', email: 'ann@example.com' },
        { page: 2, size: 5 },
      );

      expect(response).toEqual({ items: [], total: 0, page: 2, size: 5 });
      expect(getMany).toHaveBeenCalledWith({ customerId: 'customer-1', page: 2, size: 5 });
    });
  });

  describe('handleGetOne', () => {
    it('reads the order of the path for the caller', async () => {
      getOne.mockResolvedValue({ id: '600', products: [] });

      const response = await controller.handleGetOne(
        { id: 'customer-1', email: 'ann@example.com' },
        { orderId: '600' },
      );

      expect(response).toEqual({ id: '600', products: [] });
      expect(getOne).toHaveBeenCalledWith({ customerId: 'customer-1', orderId: '600' });
    });
  });
});
