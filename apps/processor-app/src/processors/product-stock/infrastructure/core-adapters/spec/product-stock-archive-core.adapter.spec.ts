import { ProductCoreArchiveOutcomeEnum } from '@acme-core/contracts/product';

import { ProductStockArchiveCoreAdapter } from '../product-stock-archive-core.adapter';

describe('ProductStockArchiveCoreAdapter', () => {
  let handleArchive: jest.Mock;
  let adapter: ProductStockArchiveCoreAdapter;

  beforeEach(() => {
    handleArchive = jest.fn();
    adapter = new ProductStockArchiveCoreAdapter({ handleArchive });
  });

  describe('archive', () => {
    it('archives the product through the core module without an expected version', async () => {
      handleArchive.mockResolvedValue({
        outcome: ProductCoreArchiveOutcomeEnum.ARCHIVED,
        currentVersion: 2,
      });

      const view = await adapter.archive({ productId: '106' });

      expect(handleArchive).toHaveBeenCalledWith({ productId: '106', expectedVersion: undefined });
      expect(view).toEqual({ archived: true });
    });

    it.each([
      ProductCoreArchiveOutcomeEnum.ALREADY_ARCHIVED,
      ProductCoreArchiveOutcomeEnum.NOT_FOUND,
      ProductCoreArchiveOutcomeEnum.VERSION_MISMATCH,
    ])('answers not archived for %s', async (outcome) => {
      handleArchive.mockResolvedValue({ outcome, currentVersion: 2 });

      const view = await adapter.archive({ productId: '106' });

      expect(view).toEqual({ archived: false });
    });
  });
});
