import { ProductCoreArchiveOutcomeEnum } from '@acme-core/contracts/product';
import { ProductStockArchiveCoreAdapter } from '../product-stock-archive-core.adapter';

describe('ProductStockArchiveCoreAdapter', () => {
  let archive: jest.Mock;
  let adapter: ProductStockArchiveCoreAdapter;

  beforeEach(() => {
    archive = jest.fn();
    adapter = new ProductStockArchiveCoreAdapter({ archive });
  });

  describe('archive', () => {
    it('archives the product through the core module without an expected version', async () => {
      archive.mockResolvedValue({
        outcome: ProductCoreArchiveOutcomeEnum.ARCHIVED,
        currentVersion: 2,
      });

      const view = await adapter.archive({ productId: '106' });

      expect(archive).toHaveBeenCalledWith({ productId: '106', expectedVersion: undefined });
      expect(view).toEqual({ archived: true });
    });

    it.each([
      ProductCoreArchiveOutcomeEnum.ALREADY_ARCHIVED,
      ProductCoreArchiveOutcomeEnum.NOT_FOUND,
      ProductCoreArchiveOutcomeEnum.VERSION_MISMATCH,
    ])('answers not archived for %s', async (outcome) => {
      archive.mockResolvedValue({ outcome, currentVersion: 2 });

      const view = await adapter.archive({ productId: '106' });

      expect(view).toEqual({ archived: false });
    });
  });
});
