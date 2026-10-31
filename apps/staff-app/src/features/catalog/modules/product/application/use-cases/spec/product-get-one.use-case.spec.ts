import { ProductStatusEnum } from '@acme-libs/kernel';
import { ProductModel } from '../../../domain';
import { ProductAccessService } from '../../services/product-access.service';
import { ProductGetOneUseCase } from '../product-get-one.use-case';

describe('ProductGetOneUseCase', () => {
  let load: jest.Mock;
  let useCase: ProductGetOneUseCase;

  beforeEach(() => {
    load = jest.fn().mockResolvedValue(
      ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      }),
    );
    useCase = new ProductGetOneUseCase({ load } as unknown as ProductAccessService);
  });

  describe('execute', () => {
    it('answers the view of the product the caller owns', async () => {
      const view = await useCase.execute({ productId: '12' });

      expect(load).toHaveBeenCalledWith({ productId: '12' });
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
