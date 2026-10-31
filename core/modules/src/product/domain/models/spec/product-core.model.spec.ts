import { ProductStatusEnum } from '@acme-libs/kernel';
import { ProductCoreModel } from '../product-core.model';

describe('ProductCoreModel', () => {
  describe('archive', () => {
    it.each([ProductStatusEnum.DRAFT, ProductStatusEnum.ACTIVE])(
      'archives a %s product and bumps the version',
      (status) => {
        const product = ProductCoreModel.reconstitute({
          id: '12',
          sku: 'SKU-0001',
          status,
          version: 3,
        });

        product.archive();

        expect(product.status).toBe('archived');
        expect(product.version).toBe(4);
        expect(product.isArchived).toBe(true);
      },
    );

    it('changes nothing on an archived product', () => {
      const product = ProductCoreModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        status: ProductStatusEnum.ARCHIVED,
        version: 5,
      });

      product.archive();

      expect(product.status).toBe('archived');
      expect(product.version).toBe(5);
    });
  });
});
