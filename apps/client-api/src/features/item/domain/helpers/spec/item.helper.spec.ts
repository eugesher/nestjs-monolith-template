import { ItemStatusEnum } from '@acme-libs/kernel';
import { ItemModel } from '../../models/item.model';
import { ItemHelper } from '../item.helper';

describe('ItemHelper', () => {
  describe('assertExpectedVersion', () => {
    let item: ItemModel;

    beforeEach(() => {
      item = ItemModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        status: ItemStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });
    });

    it.each([
      ['no If-Match', undefined],
      ['the current version', 3],
    ])('accepts %s', (_, expectedVersion) => {
      expect(() => ItemHelper.assertExpectedVersion(item, expectedVersion)).not.toThrow();
    });

    it('refuses another version with VERSION_MISMATCH and the current version', () => {
      expect(() => ItemHelper.assertExpectedVersion(item, 2)).toThrow(
        expect.objectContaining({
          code: 'VERSION_MISMATCH',
          message: 'Item 12: If-Match version 2 does not match the current version 3',
          details: { currentVersion: 3 },
        }) as Error,
      );
    });
  });
});
