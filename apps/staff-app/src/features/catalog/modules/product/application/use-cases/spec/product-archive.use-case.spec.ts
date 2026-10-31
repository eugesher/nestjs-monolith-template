import { ProductStatusEnum } from '@acme-libs/kernel';
import { ProductModel } from '../../../domain';
import { ProductAccessService } from '../../services/product-access.service';
import { ProductArchiveUseCase } from '../product-archive.use-case';

describe('ProductArchiveUseCase', () => {
  let load: jest.Mock;
  let archive: jest.Mock;
  let useCase: ProductArchiveUseCase;

  beforeEach(() => {
    load = jest.fn().mockResolvedValue(
      ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ARCHIVED,
        version: 4,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      }),
    );
    archive = jest.fn().mockResolvedValue({ outcome: 'archived', currentVersion: 4 });
    useCase = new ProductArchiveUseCase({ load } as unknown as ProductAccessService, { archive });
  });

  describe('execute', () => {
    it('archives through the status port and answers the product as stored', async () => {
      const view = await useCase.execute({ productId: '12', expectedVersion: 3 });

      expect(archive).toHaveBeenCalledWith({ productId: '12', expectedVersion: 3 });
      expect(load).toHaveBeenCalledWith({ productId: '12' });
      expect(archive.mock.invocationCallOrder[0]).toBeLessThan(load.mock.invocationCallOrder[0]);
      expect(view).toEqual({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: 'archived',
        version: 4,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      });
    });

    it('refuses an unknown product with PRODUCT_NOT_FOUND', async () => {
      archive.mockResolvedValue({ outcome: 'not-found', currentVersion: undefined });

      await expect(
        useCase.execute({ productId: '99', expectedVersion: undefined }),
      ).rejects.toMatchObject({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product 99 was not found',
      });
      expect(load).not.toHaveBeenCalled();
    });

    it('refuses a stale If-Match with PRODUCT_VERSION_MISMATCH and the current version', async () => {
      archive.mockResolvedValue({ outcome: 'version-mismatch', currentVersion: 3 });

      await expect(useCase.execute({ productId: '12', expectedVersion: 2 })).rejects.toMatchObject({
        code: 'VERSION_MISMATCH',
        message: 'Product 12: If-Match version 2 does not match the current version 3',
        details: { currentVersion: 3 },
      });
    });

    it('refuses an archived product with PRODUCT_ALREADY_ARCHIVED', async () => {
      archive.mockResolvedValue({ outcome: 'already-archived', currentVersion: 5 });

      await expect(
        useCase.execute({ productId: '12', expectedVersion: undefined }),
      ).rejects.toMatchObject({
        code: 'PRODUCT_ALREADY_ARCHIVED',
        message: 'Product 12 is already archived',
      });
    });
  });
});
