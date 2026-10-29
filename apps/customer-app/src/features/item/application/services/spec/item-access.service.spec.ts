import { ItemStatusEnum } from '@acme-libs/kernel';
import { ItemModel } from '../../../domain';
import { ItemAccessService } from '../item-access.service';

describe('ItemAccessService', () => {
  let findById: jest.Mock;
  let service: ItemAccessService;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue(
      ItemModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        status: ItemStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );
    service = new ItemAccessService({ findById });
  });

  describe('loadOwned', () => {
    it('answers the item of its owner', async () => {
      const item = await service.loadOwned({ itemId: '12', ownerId: 'owner-1' });

      expect(item.id).toBe('12');
      expect(findById).toHaveBeenCalledWith('12');
    });

    it('refuses a missing item with ITEM_NOT_FOUND', async () => {
      findById.mockResolvedValue(null);

      await expect(service.loadOwned({ itemId: '12', ownerId: 'owner-1' })).rejects.toMatchObject({
        code: 'ITEM_NOT_FOUND',
        message: 'Item 12 was not found',
      });
    });

    it('refuses an item of another owner with the same ITEM_NOT_FOUND, hiding that it exists', async () => {
      await expect(service.loadOwned({ itemId: '12', ownerId: 'owner-2' })).rejects.toMatchObject({
        code: 'ITEM_NOT_FOUND',
        message: 'Item 12 was not found',
      });
    });
  });
});
