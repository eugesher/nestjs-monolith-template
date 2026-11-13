import { IdempotencyCoreClaimOutcomeEnum } from '@acme-core/contracts/idempotency';

import { ProductIdempotencyCoreAdapter } from '../product-idempotency-core.adapter';

describe('ProductIdempotencyCoreAdapter', () => {
  let handleClaim: jest.Mock;
  let handleComplete: jest.Mock;
  let handleRelease: jest.Mock;
  let adapter: ProductIdempotencyCoreAdapter;

  beforeEach(() => {
    handleClaim = jest.fn();
    handleComplete = jest.fn();
    handleRelease = jest.fn();
    adapter = new ProductIdempotencyCoreAdapter({ handleClaim, handleComplete, handleRelease });
  });

  describe('claim', () => {
    it('claims the key in the scope of the owner on the logical body', async () => {
      handleClaim.mockResolvedValue({
        outcome: IdempotencyCoreClaimOutcomeEnum.CLAIMED,
        storedResponse: undefined,
      });

      const outcome = await adapter.claim({
        staffUserId: 'staff-1',
        key: 'key-1',
        body: { sku: 'SKU-0001' },
      });

      expect(outcome).toEqual({ outcome: 'claimed' });
      expect(handleClaim).toHaveBeenCalledWith({
        scope: 'staff:staff-1',
        key: 'key-1',
        body: { sku: 'SKU-0001' },
      });
    });

    it.each([
      [IdempotencyCoreClaimOutcomeEnum.IN_FLIGHT, 'in-flight'],
      [IdempotencyCoreClaimOutcomeEnum.MISMATCH, 'mismatch'],
    ])('answers %s as %s without a stored response', async (core, outcome) => {
      handleClaim.mockResolvedValue({ outcome: core, storedResponse: undefined });

      const result = await adapter.claim({ staffUserId: 'staff-1', key: 'key-1', body: {} });

      expect(result).toEqual({ outcome });
    });

    it('answers a replay with the stored response', async () => {
      handleClaim.mockResolvedValue({
        outcome: IdempotencyCoreClaimOutcomeEnum.REPLAY,
        storedResponse: { id: '12', sku: 'SKU-0001' },
      });

      const result = await adapter.claim({ staffUserId: 'staff-1', key: 'key-1', body: {} });

      expect(result).toEqual({ outcome: 'replay', storedResponse: { id: '12', sku: 'SKU-0001' } });
    });
  });

  describe('complete', () => {
    it('stores the response under the key in the scope of the owner', async () => {
      handleComplete.mockResolvedValue(undefined);

      await adapter.complete({ staffUserId: 'staff-1', key: 'key-1', response: { id: '12' } });

      expect(handleComplete).toHaveBeenCalledWith({
        scope: 'staff:staff-1',
        key: 'key-1',
        response: { id: '12' },
      });
    });

    it('lets a failed write reject', async () => {
      handleComplete.mockRejectedValue(new Error('connection lost'));

      const complete = adapter.complete({ staffUserId: 'staff-1', key: 'key-1', response: {} });

      await expect(complete).rejects.toThrow('connection lost');
    });
  });

  describe('release', () => {
    it('releases the key in the scope of the owner', async () => {
      handleRelease.mockResolvedValue(undefined);

      await adapter.release({ staffUserId: 'staff-1', key: 'key-1' });

      expect(handleRelease).toHaveBeenCalledWith({ scope: 'staff:staff-1', key: 'key-1' });
    });
  });
});
