import { ProductStatusEnum } from '@acme-libs/kernel';

import { ProductModel } from '../../../domain';
import { ProductGetTagsUseCase } from '../product-get-tags.use-case';
import type { ProductAccessService } from '../../services/product-access.service';

describe('ProductGetTagsUseCase', () => {
  let load: jest.Mock;
  let find: jest.Mock;
  let useCase: ProductGetTagsUseCase;

  beforeEach(() => {
    load = jest.fn().mockResolvedValue(
      ProductModel.reconstitute({
        id: '100',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 1,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );
    find = jest.fn().mockResolvedValue([{ id: '300', name: 'fragile' }]);
    useCase = new ProductGetTagsUseCase({ load } as unknown as ProductAccessService, {
      find,
      replace: jest.fn(),
      findProductIds: jest.fn(),
    });
  });

  describe('execute', () => {
    it('answers the tags of an existing product', async () => {
      const view = await useCase.execute({ productId: '100' });

      expect(load).toHaveBeenCalledWith({ productId: '100' });
      expect(find).toHaveBeenCalledWith({ productId: '100' });
      expect(view).toEqual({ tags: [{ id: '300', name: 'fragile' }] });
    });

    it('reads no tags when the product does not exist', async () => {
      load.mockRejectedValue(new Error('not found'));

      await expect(useCase.execute({ productId: '999' })).rejects.toThrow('not found');
      expect(find).not.toHaveBeenCalled();
    });
  });
});
