import { DataSource, type SelectQueryBuilder } from 'typeorm';

import { Note, NoteRevision } from '@acme-staff/common/entities';

import { NotePersistenceNoteRevisionBuilder } from '../note-persistence-note-revision.builder';

describe('NotePersistenceNoteRevisionBuilder', () => {
  let dataSource: DataSource;
  let baseBuilder: SelectQueryBuilder<NoteRevision>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'mysql',
      database: 'acme',
      entities: [Note, NoteRevision],
    });
    jest.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    jest.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    await dataSource.initialize();
  });

  beforeEach(() => {
    baseBuilder = dataSource.getRepository(NoteRevision).createQueryBuilder(NoteRevision.name);
  });

  describe('forListForNote', () => {
    it('selects the revisions of the note newest version first inside the page window', () => {
      const builder = new NotePersistenceNoteRevisionBuilder(baseBuilder);

      builder.forListForNote({ limit: 20, offset: 40, noteId: '1' });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `NoteRevision`.`id` AS `NoteRevision_id`, `NoteRevision`.`noteId` AS `NoteRevision_noteId`, `NoteRevision`.`noteVersion` AS `NoteRevision_noteVersion`, `NoteRevision`.`bodyBefore` AS `NoteRevision_bodyBefore`, `NoteRevision`.`bodyAfter` AS `NoteRevision_bodyAfter`, `NoteRevision`.`editorId` AS `NoteRevision_editorId`, `NoteRevision`.`correlationId` AS `NoteRevision_correlationId`, `NoteRevision`.`recordedAt` AS `NoteRevision_recordedAt` FROM `note_revision` `NoteRevision` WHERE `NoteRevision`.`noteId` = ? ORDER BY `NoteRevision_noteVersion` DESC LIMIT 20 OFFSET 40',
        ['1'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new NotePersistenceNoteRevisionBuilder(baseBuilder);
      const chained = builder.forListForNote({ limit: 20, offset: 40, noteId: '1' });

      expect(chained).toBe(builder);
    });
  });
});
