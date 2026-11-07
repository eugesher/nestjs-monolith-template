import { DataSource, SelectQueryBuilder } from 'typeorm';

import { ReminderStatusEnum } from '@acme-libs/kernel';
import { Reminder } from '@acme-staff/common/entities';

import { ReminderPersistenceBuilder } from '../reminder-persistence.builder';

describe('ReminderPersistenceBuilder', () => {
  let dataSource: DataSource;
  let baseBuilder: SelectQueryBuilder<Reminder>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'mysql',
      database: 'acme',
      entities: [Reminder],
    });
    jest.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    jest.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    await dataSource.initialize();
  });

  beforeEach(() => {
    baseBuilder = dataSource.getRepository(Reminder).createQueryBuilder(Reminder.name);
  });

  describe('forOwned', () => {
    it('selects the reminder of the owner', () => {
      const builder = new ReminderPersistenceBuilder(baseBuilder);

      builder.forOwned({ reminderId: '1', ownerId: '2' });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Reminder`.`id` AS `Reminder_id`, ' +
          '`Reminder`.`ownerId` AS `Reminder_ownerId`, ' +
          '`Reminder`.`title` AS `Reminder_title`, `Reminder`.`body` AS `Reminder_body`, ' +
          '`Reminder`.`dueOn` AS `Reminder_dueOn`, `Reminder`.`status` AS `Reminder_status`, ' +
          '`Reminder`.`version` AS `Reminder_version`, ' +
          '`Reminder`.`createdAt` AS `Reminder_createdAt`, ' +
          '`Reminder`.`updatedAt` AS `Reminder_updatedAt` ' +
          'FROM `reminder` `Reminder` ' +
          'WHERE ( `Reminder`.`id` = ? AND `Reminder`.`ownerId` = ? ) ' +
          'AND ( `Reminder`.`deletedAt` IS NULL )',
        ['1', '2'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new ReminderPersistenceBuilder(baseBuilder);
      const chained = builder.forOwned({ reminderId: '1', ownerId: '2' });

      expect(chained).toBe(builder);
    });
  });

  describe('forInserted', () => {
    it('selects the inserted reminder by id', () => {
      const builder = new ReminderPersistenceBuilder(baseBuilder);

      builder.forInserted('1');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Reminder`.`id` AS `Reminder_id`, ' +
          '`Reminder`.`ownerId` AS `Reminder_ownerId`, ' +
          '`Reminder`.`title` AS `Reminder_title`, `Reminder`.`body` AS `Reminder_body`, ' +
          '`Reminder`.`dueOn` AS `Reminder_dueOn`, `Reminder`.`status` AS `Reminder_status`, ' +
          '`Reminder`.`version` AS `Reminder_version`, ' +
          '`Reminder`.`createdAt` AS `Reminder_createdAt`, ' +
          '`Reminder`.`updatedAt` AS `Reminder_updatedAt` ' +
          'FROM `reminder` `Reminder` ' +
          'WHERE ( `Reminder`.`id` = ? ) AND ( `Reminder`.`deletedAt` IS NULL )',
        ['1'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new ReminderPersistenceBuilder(baseBuilder);
      const chained = builder.forInserted('1');

      expect(chained).toBe(builder);
    });
  });

  describe('forList', () => {
    it('selects the reminders of the owner by due date inside the page window', () => {
      const builder = new ReminderPersistenceBuilder(baseBuilder);

      builder.forList({ page: 3, limit: 20, offset: 40, ownerId: '2', status: undefined });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Reminder`.`id` AS `Reminder_id`, ' +
          '`Reminder`.`ownerId` AS `Reminder_ownerId`, ' +
          '`Reminder`.`title` AS `Reminder_title`, `Reminder`.`body` AS `Reminder_body`, ' +
          '`Reminder`.`dueOn` AS `Reminder_dueOn`, `Reminder`.`status` AS `Reminder_status`, ' +
          '`Reminder`.`version` AS `Reminder_version`, ' +
          '`Reminder`.`createdAt` AS `Reminder_createdAt`, ' +
          '`Reminder`.`updatedAt` AS `Reminder_updatedAt` ' +
          'FROM `reminder` `Reminder` ' +
          'WHERE ( `Reminder`.`ownerId` = ? ) AND ( `Reminder`.`deletedAt` IS NULL ) ' +
          'ORDER BY `Reminder_dueOn` ASC, `Reminder_id` ASC ' +
          'LIMIT 20 OFFSET 40',
        ['2'],
      ]);
    });

    it('keeps only the reminders in the status', () => {
      const builder = new ReminderPersistenceBuilder(baseBuilder);

      builder.forList({
        page: 1,
        limit: 20,
        offset: 0,
        ownerId: '2',
        status: ReminderStatusEnum.DONE,
      });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Reminder`.`id` AS `Reminder_id`, ' +
          '`Reminder`.`ownerId` AS `Reminder_ownerId`, ' +
          '`Reminder`.`title` AS `Reminder_title`, `Reminder`.`body` AS `Reminder_body`, ' +
          '`Reminder`.`dueOn` AS `Reminder_dueOn`, `Reminder`.`status` AS `Reminder_status`, ' +
          '`Reminder`.`version` AS `Reminder_version`, ' +
          '`Reminder`.`createdAt` AS `Reminder_createdAt`, ' +
          '`Reminder`.`updatedAt` AS `Reminder_updatedAt` ' +
          'FROM `reminder` `Reminder` ' +
          'WHERE ( `Reminder`.`ownerId` = ? AND `Reminder`.`status` = ? ) ' +
          'AND ( `Reminder`.`deletedAt` IS NULL ) ' +
          'ORDER BY `Reminder_dueOn` ASC, `Reminder_id` ASC ' +
          'LIMIT 20 OFFSET 0',
        ['2', 'done'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new ReminderPersistenceBuilder(baseBuilder);
      const chained = builder.forList({
        page: 3,
        limit: 20,
        offset: 40,
        ownerId: '2',
        status: undefined,
      });

      expect(chained).toBe(builder);
    });
  });

  describe('forSummarize', () => {
    it('counts the pending reminders of the owner and finds the nearest due date', () => {
      const builder = new ReminderPersistenceBuilder(baseBuilder);

      builder.forSummarize('2');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT COUNT(*) AS `pending`, MIN(`Reminder`.`dueOn`) AS `nextDueOn` ' +
          'FROM `reminder` `Reminder` ' +
          'WHERE ( `Reminder`.`ownerId` = ? AND `Reminder`.`status` = ? ) ' +
          'AND ( `Reminder`.`deletedAt` IS NULL )',
        ['2', 'pending'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new ReminderPersistenceBuilder(baseBuilder);
      const chained = builder.forSummarize('2');

      expect(chained).toBe(builder);
    });
  });

  describe('forById', () => {
    it('selects the reminder by id', () => {
      const builder = new ReminderPersistenceBuilder(baseBuilder);

      builder.forById('1');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Reminder`.`id` AS `Reminder_id`, ' +
          '`Reminder`.`ownerId` AS `Reminder_ownerId`, ' +
          '`Reminder`.`title` AS `Reminder_title`, `Reminder`.`body` AS `Reminder_body`, ' +
          '`Reminder`.`dueOn` AS `Reminder_dueOn`, `Reminder`.`status` AS `Reminder_status`, ' +
          '`Reminder`.`version` AS `Reminder_version`, ' +
          '`Reminder`.`createdAt` AS `Reminder_createdAt`, ' +
          '`Reminder`.`updatedAt` AS `Reminder_updatedAt` ' +
          'FROM `reminder` `Reminder` ' +
          'WHERE ( `Reminder`.`id` = ? ) AND ( `Reminder`.`deletedAt` IS NULL )',
        ['1'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new ReminderPersistenceBuilder(baseBuilder);
      const chained = builder.forById('1');

      expect(chained).toBe(builder);
    });
  });
});
