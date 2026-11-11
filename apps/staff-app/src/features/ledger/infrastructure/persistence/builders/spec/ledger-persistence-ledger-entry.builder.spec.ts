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

  describe('forList', () => {
    it('selects every entry newest first inside the page window', () => {
      const builder = new LedgerPersistenceLedgerEntryBuilder(baseBuilder);

      builder.forList({
        page: 3,
        limit: 20,
        offset: 40,
        subjectType: undefined,
        subjectId: undefined,
        correlationId: undefined,
      });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `LedgerEntry`.`id` AS `LedgerEntry_id`, ' +
          '`LedgerEntry`.`operationKey` AS `LedgerEntry_operationKey`, ' +
          '`LedgerEntry`.`subjectType` AS `LedgerEntry_subjectType`, ' +
          '`LedgerEntry`.`subjectId` AS `LedgerEntry_subjectId`, ' +
          '`LedgerEntry`.`action` AS `LedgerEntry_action`, ' +
          '`LedgerEntry`.`payload` AS `LedgerEntry_payload`, ' +
          '`LedgerEntry`.`correlationId` AS `LedgerEntry_correlationId`, ' +
          '`LedgerEntry`.`occurredAt` AS `LedgerEntry_occurredAt`, ' +
          '`LedgerEntry`.`recordedAt` AS `LedgerEntry_recordedAt` ' +
          'FROM `ledger_entry` `LedgerEntry` ' +
          'ORDER BY `LedgerEntry_id` DESC ' +
          'LIMIT 20 OFFSET 40',
        [],
      ]);
    });

    it('keeps only the entries of the subject and the correlation id', () => {
      const builder = new LedgerPersistenceLedgerEntryBuilder(baseBuilder);

      builder.forList({
        page: 1,
        limit: 20,
        offset: 0,
        subjectType: 'order',
        subjectId: '600',
        correlationId: 'corr-1',
      });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `LedgerEntry`.`id` AS `LedgerEntry_id`, ' +
          '`LedgerEntry`.`operationKey` AS `LedgerEntry_operationKey`, ' +
          '`LedgerEntry`.`subjectType` AS `LedgerEntry_subjectType`, ' +
          '`LedgerEntry`.`subjectId` AS `LedgerEntry_subjectId`, ' +
          '`LedgerEntry`.`action` AS `LedgerEntry_action`, ' +
          '`LedgerEntry`.`payload` AS `LedgerEntry_payload`, ' +
          '`LedgerEntry`.`correlationId` AS `LedgerEntry_correlationId`, ' +
          '`LedgerEntry`.`occurredAt` AS `LedgerEntry_occurredAt`, ' +
          '`LedgerEntry`.`recordedAt` AS `LedgerEntry_recordedAt` ' +
          'FROM `ledger_entry` `LedgerEntry` ' +
          'WHERE `LedgerEntry`.`subjectType` = ? AND `LedgerEntry`.`subjectId` = ? ' +
          'AND `LedgerEntry`.`correlationId` = ? ' +
          'ORDER BY `LedgerEntry_id` DESC ' +
          'LIMIT 20 OFFSET 0',
        ['order', '600', 'corr-1'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new LedgerPersistenceLedgerEntryBuilder(baseBuilder);
      const chained = builder.forList({
        page: 3,
        limit: 20,
        offset: 40,
        subjectType: undefined,
        subjectId: undefined,
        correlationId: undefined,
      });

      expect(chained).toBe(builder);
    });
  });
});
