import { DataSource, type SelectQueryBuilder } from 'typeorm';

import { IdempotencyKey } from '@acme-core/entities';

import { IdempotencyCorePersistenceIdempotencyKeyBuilder } from '../idempotency-core-persistence-idempotency-key.builder';

describe('IdempotencyCorePersistenceIdempotencyKeyBuilder', () => {
  let dataSource: DataSource;
  let baseBuilder: SelectQueryBuilder<IdempotencyKey>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'mysql',
      database: 'acme',
      entities: [IdempotencyKey],
    });
    jest.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    jest.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    await dataSource.initialize();
  });

  beforeEach(() => {
    baseBuilder = dataSource.getRepository(IdempotencyKey).createQueryBuilder(IdempotencyKey.name);
  });

  describe('forByKey', () => {
    it('selects the fingerprint, status and stored response of the key', () => {
      const builder = new IdempotencyCorePersistenceIdempotencyKeyBuilder(baseBuilder);

      builder.forByKey('key-1');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `IdempotencyKey`.`id` AS `IdempotencyKey_id`, ' +
          '`IdempotencyKey`.`requestFingerprint` AS `IdempotencyKey_requestFingerprint`, ' +
          '`IdempotencyKey`.`status` AS `IdempotencyKey_status`, ' +
          '`IdempotencyKey`.`responseBody` AS `IdempotencyKey_responseBody` ' +
          'FROM `idempotency_key` `IdempotencyKey` ' +
          'WHERE `IdempotencyKey`.`idempotencyKey` = ?',
        ['key-1'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new IdempotencyCorePersistenceIdempotencyKeyBuilder(baseBuilder);
      const chained = builder.forByKey('key-1');

      expect(chained).toBe(builder);
    });
  });
});
