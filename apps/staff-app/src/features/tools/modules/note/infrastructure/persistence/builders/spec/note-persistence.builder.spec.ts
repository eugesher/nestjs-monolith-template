import { DataSource, SelectQueryBuilder } from 'typeorm';

import { Note } from '@acme-staff/common/entities';

import { NotePersistenceBuilder } from '../note-persistence.builder';

describe('NotePersistenceBuilder', () => {
  let dataSource: DataSource;
  let baseBuilder: SelectQueryBuilder<Note>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'mysql',
      database: 'acme',
      entities: [Note],
    });
    jest.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    jest.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    await dataSource.initialize();
  });

  beforeEach(() => {
    baseBuilder = dataSource.getRepository(Note).createQueryBuilder(Note.name);
  });

  describe('forOwned', () => {
    it('selects the note of the author', () => {
      const builder = new NotePersistenceBuilder(baseBuilder);

      builder.forOwned({ noteId: '1', authorId: '2' });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Note`.`id` AS `Note_id`, `Note`.`subjectType` AS `Note_subjectType`, `Note`.`subjectId` AS `Note_subjectId`, `Note`.`body` AS `Note_body`, `Note`.`authorId` AS `Note_authorId`, `Note`.`resolved` AS `Note_resolved`, `Note`.`version` AS `Note_version`, `Note`.`createdAt` AS `Note_createdAt`, `Note`.`updatedAt` AS `Note_updatedAt` ' +
          'FROM `note` `Note` ' +
          'WHERE ( `Note`.`id` = ? AND `Note`.`authorId` = ? ) AND ( `Note`.`deletedAt` IS NULL )',
        ['1', '2'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new NotePersistenceBuilder(baseBuilder);
      const chained = builder.forOwned({ noteId: '1', authorId: '2' });

      expect(chained).toBe(builder);
    });
  });

  describe('forInserted', () => {
    it('selects the inserted note by id', () => {
      const builder = new NotePersistenceBuilder(baseBuilder);

      builder.forInserted('1');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Note`.`id` AS `Note_id`, `Note`.`subjectType` AS `Note_subjectType`, `Note`.`subjectId` AS `Note_subjectId`, `Note`.`body` AS `Note_body`, `Note`.`authorId` AS `Note_authorId`, `Note`.`resolved` AS `Note_resolved`, `Note`.`version` AS `Note_version`, `Note`.`createdAt` AS `Note_createdAt`, `Note`.`updatedAt` AS `Note_updatedAt` ' +
          'FROM `note` `Note` ' +
          'WHERE ( `Note`.`id` = ? ) AND ( `Note`.`deletedAt` IS NULL )',
        ['1'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new NotePersistenceBuilder(baseBuilder);
      const chained = builder.forInserted('1');

      expect(chained).toBe(builder);
    });
  });

  describe('forList', () => {
    it('selects the notes of the author newest first inside the page window', () => {
      const builder = new NotePersistenceBuilder(baseBuilder);

      builder.forList({
        page: 3,
        limit: 20,
        offset: 40,
        authorId: '2',
        subjectType: undefined,
        subjectId: undefined,
        resolved: undefined,
      });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Note`.`id` AS `Note_id`, `Note`.`subjectType` AS `Note_subjectType`, `Note`.`subjectId` AS `Note_subjectId`, `Note`.`body` AS `Note_body`, `Note`.`authorId` AS `Note_authorId`, `Note`.`resolved` AS `Note_resolved`, `Note`.`version` AS `Note_version`, `Note`.`createdAt` AS `Note_createdAt`, `Note`.`updatedAt` AS `Note_updatedAt` ' +
          'FROM `note` `Note` ' +
          'WHERE ( `Note`.`authorId` = ? ) AND ( `Note`.`deletedAt` IS NULL ) ' +
          'ORDER BY `Note_id` DESC ' +
          'LIMIT 20 OFFSET 40',
        ['2'],
      ]);
    });

    it('keeps only the notes of the subject in the resolution state', () => {
      const builder = new NotePersistenceBuilder(baseBuilder);

      builder.forList({
        page: 1,
        limit: 20,
        offset: 0,
        authorId: '2',
        subjectType: 'order',
        subjectId: '600',
        resolved: false,
      });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Note`.`id` AS `Note_id`, `Note`.`subjectType` AS `Note_subjectType`, `Note`.`subjectId` AS `Note_subjectId`, `Note`.`body` AS `Note_body`, `Note`.`authorId` AS `Note_authorId`, `Note`.`resolved` AS `Note_resolved`, `Note`.`version` AS `Note_version`, `Note`.`createdAt` AS `Note_createdAt`, `Note`.`updatedAt` AS `Note_updatedAt` ' +
          'FROM `note` `Note` ' +
          'WHERE ( `Note`.`authorId` = ? AND `Note`.`subjectType` = ? AND `Note`.`subjectId` = ? AND `Note`.`resolved` = ? ) AND ( `Note`.`deletedAt` IS NULL ) ' +
          'ORDER BY `Note_id` DESC ' +
          'LIMIT 20 OFFSET 0',
        ['2', 'order', '600', false],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new NotePersistenceBuilder(baseBuilder);
      const chained = builder.forList({
        page: 3,
        limit: 20,
        offset: 40,
        authorId: '2',
        subjectType: undefined,
        subjectId: undefined,
        resolved: undefined,
      });

      expect(chained).toBe(builder);
    });
  });
});
