import { ProductStatusEnum } from '@acme-libs/kernel';
import { ProductModel } from '../../models/product.model';
import { ProductHelper } from '../product.helper';

describe('ProductHelper', () => {
  describe('assertExpectedVersion', () => {
    let product: ProductModel;

    beforeEach(() => {
      product = ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });
    });

    it.each([
      ['no If-Match', undefined],
      ['the current version', 3],
    ])('accepts %s', (_, expectedVersion) => {
      expect(() => ProductHelper.assertExpectedVersion(product, expectedVersion)).not.toThrow();
    });

    it('refuses another version with VERSION_MISMATCH and the current version', () => {
      expect(() => ProductHelper.assertExpectedVersion(product, 2)).toThrow(
        expect.objectContaining({
          code: 'VERSION_MISMATCH',
          message: 'Product 12: If-Match version 2 does not match the current version 3',
          details: { currentVersion: 3 },
        }) as Error,
      );
    });
  });
});
