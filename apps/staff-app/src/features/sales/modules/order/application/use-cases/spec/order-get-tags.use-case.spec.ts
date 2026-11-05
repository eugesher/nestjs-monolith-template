import { OrderNotFoundException } from '../../../domain';
import { OrderGetTagsUseCase } from '../order-get-tags.use-case';

describe('OrderGetTagsUseCase', () => {
  let findById: jest.Mock;
  let find: jest.Mock;
  let useCase: OrderGetTagsUseCase;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue({ id: '600' });
    find = jest.fn().mockResolvedValue([{ id: '302', name: 'vip' }]);
    useCase = new OrderGetTagsUseCase(
      { findById },
      { find, replace: jest.fn(), findOrderIds: jest.fn() },
    );
  });

  describe('execute', () => {
    it('answers the tags of an existing order', async () => {
      const view = await useCase.execute({ orderId: '600' });

      expect(findById).toHaveBeenCalledWith('600');
      expect(find).toHaveBeenCalledWith({ orderId: '600' });
      expect(view).toEqual({ tags: [{ id: '302', name: 'vip' }] });
    });

    it('throws OrderNotFoundException and reads no tags for an unknown order', async () => {
      findById.mockResolvedValue(null);

      await expect(useCase.execute({ orderId: '999' })).rejects.toThrow(OrderNotFoundException);
      expect(find).not.toHaveBeenCalled();
    });
  });
});
