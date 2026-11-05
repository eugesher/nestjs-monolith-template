import {
  OrderGetManyUseCase,
  OrderGetOneUseCase,
  OrderGetTagsUseCase,
  OrderReplaceTagsUseCase,
} from '../../../application';
import { OrderController } from '../order.controller';

describe('OrderController', () => {
  let getMany: jest.Mock;
  let getOne: jest.Mock;
  let getTags: jest.Mock;
  let replaceTags: jest.Mock;
  let controller: OrderController;

  beforeEach(() => {
    getMany = jest.fn();
    getOne = jest.fn();
    getTags = jest.fn();
    replaceTags = jest.fn();

    controller = new OrderController(
      { execute: getMany } as unknown as OrderGetManyUseCase,
      { execute: getOne } as unknown as OrderGetOneUseCase,
      { execute: getTags } as unknown as OrderGetTagsUseCase,
      { execute: replaceTags } as unknown as OrderReplaceTagsUseCase,
    );
  });

  describe('handleGetMany', () => {
    it('lists the orders for the page window and the tag', async () => {
      getMany.mockResolvedValue({ page: 2, count: 0, pageCount: 0, total: 0, data: [] });

      const response = await controller.handleGetMany({ page: 2, limit: 5, tagId: '302' });

      expect(response).toEqual({ page: 2, count: 0, pageCount: 0, total: 0, data: [] });
      expect(getMany).toHaveBeenCalledWith({ page: 2, limit: 5, tagId: '302' });
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

  describe('handleGetTags', () => {
    it('reads the tags of the order of the path', async () => {
      getTags.mockResolvedValue({ tags: [{ id: '302', name: 'vip' }] });

      const response = await controller.handleGetTags({ orderId: '600' });

      expect(response).toEqual({ tags: [{ id: '302', name: 'vip' }] });
      expect(getTags).toHaveBeenCalledWith({ orderId: '600' });
    });
  });

  describe('handleReplaceTags', () => {
    it('replaces the tags of the order of the path with the tags of the body', async () => {
      replaceTags.mockResolvedValue({ tags: [{ id: '302', name: 'vip' }] });

      const response = await controller.handleReplaceTags({ orderId: '600' }, { tagIds: ['302'] });

      expect(response).toEqual({ tags: [{ id: '302', name: 'vip' }] });
      expect(replaceTags).toHaveBeenCalledWith({ orderId: '600', tagIds: ['302'] });
    });
  });
});
