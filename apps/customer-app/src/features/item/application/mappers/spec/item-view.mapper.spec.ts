import { ItemStatusEnum } from '@acme-libs/kernel';
import { ItemModel } from '../../../domain';
import { ItemViewMapper } from '../item-view.mapper';

describe('ItemViewMapper', () => {
  describe('toView', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('answers a stored item with ISO instants', () => {
      const item = ItemModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        status: ItemStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });

      const view = ItemViewMapper.toView(item);

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

    it('answers an item not stored yet with an empty id and the current instant', () => {
      jest.useFakeTimers({ now: new Date('2026-03-01T10:00:00.000Z') });

      const item = ItemModel.create({ sku: 'SKU-0001', name: 'Lamp', ownerId: 'owner-1' });

      const view = ItemViewMapper.toView(item);

      expect(view).toEqual({
        id: '',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: 'draft',
        version: 1,
        createdAt: '2026-03-01T10:00:00.000Z',
        updatedAt: '2026-03-01T10:00:00.000Z',
      });
    });
  });
});
