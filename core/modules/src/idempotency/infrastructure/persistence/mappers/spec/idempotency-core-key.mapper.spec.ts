import { IdempotencyKey } from '@acme-core/entities';
import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { IdempotencyCoreKeyMapper } from '../idempotency-core-key.mapper';

describe('IdempotencyCoreKeyMapper', () => {
  describe('toModel', () => {
    it('maps every column of the row onto the model', () => {
      const entity = Object.assign(new IdempotencyKey(), {
        id: '7',
        idempotencyKey: 'key-1',
        requestFingerprint: 'abc',
        status: IdempotencyStatusEnum.IN_FLIGHT,
        responseBody: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      const model = IdempotencyCoreKeyMapper.toModel(entity);

      expect({ ...model }).toEqual({
        id: '7',
        key: 'key-1',
        requestFingerprint: 'abc',
        status: 'in_flight',
        responseBody: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      });
    });
  });
});
