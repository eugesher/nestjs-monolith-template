import { ProductStatusEnum } from '@acme-libs/kernel';
import { ProductModel } from '../../../domain';
import { ProductAccessService } from '../product-access.service';

describe('ProductAccessService', () => {
  let findById: jest.Mock;
  let service: ProductAccessService;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue(
      ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );
    service = new ProductAccessService({ findById });
  });

  describe('load', () => {
    it('answers the product of the id', async () => {
      const product = await service.load({ productId: '12' });

      expect(product.id).toBe('12');
      expect(findById).toHaveBeenCalledWith('12');
    });

    it('refuses a missing product with PRODUCT_NOT_FOUND', async () => {
      findById.mockResolvedValue(null);

      await expect(service.load({ productId: '12' })).rejects.toMatchObject({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product 12 was not found',
      });
    });
  });
});
