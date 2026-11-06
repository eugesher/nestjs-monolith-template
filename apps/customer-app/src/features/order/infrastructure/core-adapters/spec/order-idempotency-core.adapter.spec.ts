import { IdempotencyCoreClaimOutcomeEnum } from '@acme-core/contracts/idempotency';

import { OrderIdempotencyCoreAdapter } from '../order-idempotency-core.adapter';

describe('OrderIdempotencyCoreAdapter', () => {
  let handleClaim: jest.Mock;
  let handleComplete: jest.Mock;
  let handleRelease: jest.Mock;
  let adapter: OrderIdempotencyCoreAdapter;

  beforeEach(() => {
    handleClaim = jest.fn();
    handleComplete = jest.fn();
    handleRelease = jest.fn();
    adapter = new OrderIdempotencyCoreAdapter({ handleClaim, handleComplete, handleRelease });
  });

  describe('claim', () => {
    it('claims the key on the logical body', async () => {
      handleClaim.mockResolvedValue({
        outcome: IdempotencyCoreClaimOutcomeEnum.CLAIMED,
        storedResponse: undefined,
      });

      const outcome = await adapter.claim({
        key: 'key-1',
        body: { customerId: 'customer-1', productIds: ['100'] },
      });

      expect(outcome).toEqual({ outcome: 'claimed' });
      expect(handleClaim).toHaveBeenCalledWith({
        key: 'key-1',
        body: { customerId: 'customer-1', productIds: ['100'] },
      });
    });

    it.each([
      [IdempotencyCoreClaimOutcomeEnum.IN_FLIGHT, 'in-flight'],
      [IdempotencyCoreClaimOutcomeEnum.MISMATCH, 'mismatch'],
    ])('answers %s as %s without a stored response', async (core, outcome) => {
      handleClaim.mockResolvedValue({ outcome: core, storedResponse: undefined });

      const result = await adapter.claim({ key: 'key-1', body: {} });

      expect(result).toEqual({ outcome });
    });

    it('answers a replay with the stored response', async () => {
      handleClaim.mockResolvedValue({
        outcome: IdempotencyCoreClaimOutcomeEnum.REPLAY,
        storedResponse: { id: '600', products: [] },
      });

      const result = await adapter.claim({ key: 'key-1', body: {} });

      expect(result).toEqual({ outcome: 'replay', storedResponse: { id: '600', products: [] } });
    });
  });

  describe('complete', () => {
    it('stores the response under the key', async () => {
      handleComplete.mockResolvedValue(undefined);

      await adapter.complete({ key: 'key-1', response: { id: '600' } });

      expect(handleComplete).toHaveBeenCalledWith({ key: 'key-1', response: { id: '600' } });
    });
  });

  describe('release', () => {
    it('releases the key', async () => {
      handleRelease.mockResolvedValue(undefined);

      await adapter.release({ key: 'key-1' });

      expect(handleRelease).toHaveBeenCalledWith({ key: 'key-1' });
    });
  });
});
