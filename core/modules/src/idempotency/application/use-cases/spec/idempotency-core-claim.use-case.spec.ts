import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { IdempotencyCoreKeyModel } from '../../../domain';
import { IdempotencyCoreClaimUseCase } from '../idempotency-core-claim.use-case';

describe('IdempotencyCoreClaimUseCase', () => {
  let repository: { insert: jest.Mock; findByKey: jest.Mock };
  let useCase: IdempotencyCoreClaimUseCase;

  beforeEach(() => {
    repository = { insert: jest.fn().mockResolvedValue(true), findByKey: jest.fn() };
    useCase = new IdempotencyCoreClaimUseCase(repository);
  });

  describe('execute', () => {
    it('claims a new key with the fingerprint of the body', async () => {
      const claim = await useCase.execute({ key: 'key-1', body: { sku: 'A-1', name: 'Lamp' } });
      const [draft] = repository.insert.mock.calls[0] as [IdempotencyCoreKeyModel];

      expect(claim).toEqual({ outcome: 'claimed', storedResponse: undefined });
      expect({ ...draft }).toEqual({
        id: undefined,
        key: 'key-1',
        requestFingerprint: '3cb0b58ca4059f9bd12b3a2586f5b6a27ce031d03f37b2031f01bfe8910c8727',
        status: 'in_flight',
        responseBody: null,
        createdAt: undefined,
      });
      expect(repository.findByKey).not.toHaveBeenCalled();
    });

    it('replays the stored response of a completed key with the same body', async () => {
      repository.insert.mockResolvedValue(false);
      repository.findByKey.mockResolvedValue(
        IdempotencyCoreKeyModel.reconstitute({
          id: '7',
          key: 'key-1',
          requestFingerprint: '3cb0b58ca4059f9bd12b3a2586f5b6a27ce031d03f37b2031f01bfe8910c8727',
          status: IdempotencyStatusEnum.COMPLETED,
          responseBody: '{"id":"12","sku":"A-1"}',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      );

      const claim = await useCase.execute({ key: 'key-1', body: { name: 'Lamp', sku: 'A-1' } });

      expect(claim).toEqual({ outcome: 'replay', storedResponse: { id: '12', sku: 'A-1' } });
      expect(repository.findByKey).toHaveBeenCalledWith('key-1');
    });

    it('answers in-flight while the first request with the same body still runs', async () => {
      repository.insert.mockResolvedValue(false);
      repository.findByKey.mockResolvedValue(
        IdempotencyCoreKeyModel.reconstitute({
          id: '7',
          key: 'key-1',
          requestFingerprint: '3cb0b58ca4059f9bd12b3a2586f5b6a27ce031d03f37b2031f01bfe8910c8727',
          status: IdempotencyStatusEnum.IN_FLIGHT,
          responseBody: null,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      );

      const claim = await useCase.execute({ key: 'key-1', body: { sku: 'A-1', name: 'Lamp' } });

      expect(claim).toEqual({ outcome: 'in-flight', storedResponse: undefined });
    });

    it('answers mismatch when the key was used with another body', async () => {
      repository.insert.mockResolvedValue(false);
      repository.findByKey.mockResolvedValue(
        IdempotencyCoreKeyModel.reconstitute({
          id: '7',
          key: 'key-1',
          requestFingerprint: '2c06d97387e13f416a552edbb480d44fed3f91e1ca2133c16b567fee8bffb2f4',
          status: IdempotencyStatusEnum.COMPLETED,
          responseBody: '{"id":"12"}',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      );

      const claim = await useCase.execute({ key: 'key-1', body: { sku: 'A-1', name: 'Lamp' } });

      expect(claim).toEqual({ outcome: 'mismatch', storedResponse: undefined });
    });

    it('answers in-flight when the holder released the key between the insert and the read', async () => {
      repository.insert.mockResolvedValue(false);
      repository.findByKey.mockResolvedValue(undefined);

      const claim = await useCase.execute({ key: 'key-1', body: { sku: 'A-1', name: 'Lamp' } });

      expect(claim).toEqual({ outcome: 'in-flight', storedResponse: undefined });
    });

    it('lets an invalid key escape before touching the store', async () => {
      await expect(useCase.execute({ key: '', body: {} })).rejects.toThrow(
        'IdempotencyKey.key is required',
      );
      expect(repository.insert).not.toHaveBeenCalled();
    });
  });
});
