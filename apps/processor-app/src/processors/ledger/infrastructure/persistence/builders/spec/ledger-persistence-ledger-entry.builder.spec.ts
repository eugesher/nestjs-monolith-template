import { DataSource, type SelectQueryBuilder } from 'typeorm';

import { LedgerEntry } from '@acme-core/entities';

import { LedgerPersistenceLedgerEntryBuilder } from '../ledger-persistence-ledger-entry.builder';

describe('LedgerPersistenceLedgerEntryBuilder', () => {
  let dataSource: DataSource;
  let baseBuilder: SelectQueryBuilder<LedgerEntry>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'mysql',
      database: 'acme',
      entities: [LedgerEntry],
    });
    jest.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    jest.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    await dataSource.initialize();
  });

  beforeEach(() => {
    baseBuilder = dataSource.getRepository(LedgerEntry).createQueryBuilder(LedgerEntry.name);
  });

  describe('forByOperationKey', () => {
    it('selects the id of the entry with the operation key', () => {
      const builder = new LedgerPersistenceLedgerEntryBuilder(baseBuilder);

      builder.forByOperationKey('op-1');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `LedgerEntry`.`id` AS `LedgerEntry_id` ' +
          'FROM `ledger_entry` `LedgerEntry` ' +
          'WHERE `LedgerEntry`.`operationKey` = ?',
        ['op-1'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new LedgerPersistenceLedgerEntryBuilder(baseBuilder);
      const chained = builder.forByOperationKey('op-1');

      expect(chained).toBe(builder);
    });
  });
});
