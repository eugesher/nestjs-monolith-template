import { ItemStatusEnum } from '@acme-libs/kernel';
import { ItemModel } from '../../../domain';
import { ItemAccessService } from '../../services/item-access.service';
import { ItemGetOneUseCase } from '../item-get-one.use-case';

describe('ItemGetOneUseCase', () => {
  let loadOwned: jest.Mock;
  let useCase: ItemGetOneUseCase;

  beforeEach(() => {
    loadOwned = jest.fn().mockResolvedValue(
      ItemModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        status: ItemStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      }),
    );
    useCase = new ItemGetOneUseCase({ loadOwned } as unknown as ItemAccessService);
  });

  describe('execute', () => {
    it('answers the view of the item the caller owns', async () => {
      const view = await useCase.execute({ itemId: '12', ownerId: 'owner-1' });

      expect(loadOwned).toHaveBeenCalledWith({ itemId: '12', ownerId: 'owner-1' });
      expect(view).toEqual({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: 'active',
        version: 3,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });
    });
  });
});
