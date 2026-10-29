import { Item } from '@acme-core/entities';
import { ItemStatusEnum } from '@acme-libs/kernel';
import { ItemMapper } from '../item.mapper';

describe('ItemMapper', () => {
  describe('toModel', () => {
    it('restores the row as an item with its string id and stored times', () => {
      const row = Object.assign(new Item(), {
        id: '12',
        sku: 'SKU-0001',
        name: 'Reference item',
        ownerId: '7d3f0e2a-5b1c-4c8e-9a4f-2b6d8e1f3a5c',
        status: ItemStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        deletedAt: null,
      });

      const item = ItemMapper.toModel(row);

      expect({
        id: item.id,
        sku: item.sku,
        name: item.name,
        ownerId: item.ownerId,
        status: item.status,
        version: item.version,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }).toEqual({
        id: '12',
        sku: 'SKU-0001',
        name: 'Reference item',
        ownerId: '7d3f0e2a-5b1c-4c8e-9a4f-2b6d8e1f3a5c',
        status: ItemStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });
      expect(item.pullDomainEvents()).toEqual([]);
    });
  });
});
