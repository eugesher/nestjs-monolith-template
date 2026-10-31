import { IdempotencyCoreClaimOutcomeEnum } from '@acme-core/contracts/idempotency';
import { ProductIdempotencyCoreAdapter } from '../product-idempotency-core.adapter';

describe('ProductIdempotencyCoreAdapter', () => {
  let claim: jest.Mock;
  let complete: jest.Mock;
  let release: jest.Mock;
  let adapter: ProductIdempotencyCoreAdapter;

  beforeEach(() => {
    claim = jest.fn();
    complete = jest.fn();
    release = jest.fn();
    adapter = new ProductIdempotencyCoreAdapter({ claim, complete, release });
  });

  describe('claim', () => {
    it('claims the key on the logical body', async () => {
      claim.mockResolvedValue({
        outcome: IdempotencyCoreClaimOutcomeEnum.CLAIMED,
        storedResponse: undefined,
      });

      const outcome = await adapter.claim({ key: 'key-1', body: { sku: 'SKU-0001' } });

      expect(outcome).toEqual({ outcome: 'claimed' });
      expect(claim).toHaveBeenCalledWith({ key: 'key-1', body: { sku: 'SKU-0001' } });
    });

    it.each([
      [IdempotencyCoreClaimOutcomeEnum.IN_FLIGHT, 'in-flight'],
      [IdempotencyCoreClaimOutcomeEnum.MISMATCH, 'mismatch'],
    ])('answers %s as %s without a stored response', async (core, outcome) => {
      claim.mockResolvedValue({ outcome: core, storedResponse: undefined });

      const result = await adapter.claim({ key: 'key-1', body: {} });

      expect(result).toEqual({ outcome });
    });

    it('answers a replay with the stored response', async () => {
      claim.mockResolvedValue({
        outcome: IdempotencyCoreClaimOutcomeEnum.REPLAY,
        storedResponse: { id: '12', sku: 'SKU-0001' },
      });

      const result = await adapter.claim({ key: 'key-1', body: {} });

      expect(result).toEqual({ outcome: 'replay', storedResponse: { id: '12', sku: 'SKU-0001' } });
    });
  });

  describe('complete', () => {
    it('stores the response under the key', async () => {
      complete.mockResolvedValue(undefined);

      await adapter.complete({ key: 'key-1', response: { id: '12' } });

      expect(complete).toHaveBeenCalledWith({ key: 'key-1', response: { id: '12' } });
    });
  });

  describe('release', () => {
    it('releases the key', async () => {
      release.mockResolvedValue(undefined);

      await adapter.release({ key: 'key-1' });

      expect(release).toHaveBeenCalledWith({ key: 'key-1' });
    });
  });
});
