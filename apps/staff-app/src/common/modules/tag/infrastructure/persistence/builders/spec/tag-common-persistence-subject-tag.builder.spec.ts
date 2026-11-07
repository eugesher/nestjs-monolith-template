import { DataSource, SelectQueryBuilder } from 'typeorm';

import { SubjectTag, Tag } from '@acme-staff/common/entities';

import { TagCommonPersistenceSubjectTagBuilder } from '../tag-common-persistence-subject-tag.builder';

describe('TagCommonPersistenceSubjectTagBuilder', () => {
  let dataSource: DataSource;
  let baseBuilder: SelectQueryBuilder<SubjectTag>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'mysql',
      database: 'acme',
      entities: [SubjectTag, Tag],
    });
    jest.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    jest.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    await dataSource.initialize();
  });

  beforeEach(() => {
    baseBuilder = dataSource.getRepository(SubjectTag).createQueryBuilder(SubjectTag.name);
  });

  describe('forList', () => {
    it('selects the subjects of the type that carry the tag', () => {
      const builder = new TagCommonPersistenceSubjectTagBuilder(baseBuilder);

      builder.forList({ subjectType: 'product', tagId: '300' });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `SubjectTag`.`id` AS `SubjectTag_id`, ' +
          '`SubjectTag`.`subjectId` AS `SubjectTag_subjectId` ' +
          'FROM `subject_tag` `SubjectTag` ' +
          'WHERE `SubjectTag`.`tagId` = ? AND `SubjectTag`.`subjectType` = ?',
        ['300', 'product'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new TagCommonPersistenceSubjectTagBuilder(baseBuilder);
      const chained = builder.forList({ subjectType: 'product', tagId: '300' });

      expect(chained).toBe(builder);
    });
  });

  describe('forLinked', () => {
    it('selects the tag links of the subject', () => {
      const builder = new TagCommonPersistenceSubjectTagBuilder(baseBuilder);

      builder.forLinked({ subjectType: 'product', subjectId: '100' });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `SubjectTag`.`id` AS `SubjectTag_id`, `SubjectTag`.`tagId` AS `SubjectTag_tagId` ' +
          'FROM `subject_tag` `SubjectTag` ' +
          'WHERE `SubjectTag`.`subjectType` = ? AND `SubjectTag`.`subjectId` = ?',
        ['product', '100'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new TagCommonPersistenceSubjectTagBuilder(baseBuilder);
      const chained = builder.forLinked({ subjectType: 'product', subjectId: '100' });

      expect(chained).toBe(builder);
    });
  });
});
