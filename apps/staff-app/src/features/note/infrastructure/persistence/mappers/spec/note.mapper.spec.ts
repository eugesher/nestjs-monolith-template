import { Note } from '@acme-core/entities';
import { NoteMapper } from '../note.mapper';

describe('NoteMapper', () => {
  describe('toModel', () => {
    it('restores the row as a note with its string id and stored times', () => {
      const row = Object.assign(new Note(), {
        id: '17',
        subjectType: 'item',
        subjectId: '42',
        body: 'Customer called about this',
        authorId: '7d3f0e2a-5b1c-4c8e-9a4f-2b6d8e1f3a5c',
        resolved: true,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        deletedAt: null,
      });

      const note = NoteMapper.toModel(row);

      expect({
        id: note.id,
        subjectType: note.subjectType,
        subjectId: note.subjectId,
        body: note.body,
        authorId: note.authorId,
        resolved: note.resolved,
        version: note.version,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }).toEqual({
        id: '17',
        subjectType: 'item',
        subjectId: '42',
        body: 'Customer called about this',
        authorId: '7d3f0e2a-5b1c-4c8e-9a4f-2b6d8e1f3a5c',
        resolved: true,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });
    });
  });
});
