import { NoteRevision } from '@acme-core/entities';
import { NoteRevisionMapper } from '../note-revision.mapper';

describe('NoteRevisionMapper', () => {
  describe('toModel', () => {
    it('restores the row as a revision with its string ids and the time it was recorded', () => {
      const row = Object.assign(new NoteRevision(), {
        id: '4210',
        noteId: '17',
        noteVersion: 2,
        bodyBefore: 'Customer called',
        bodyAfter: 'Customer called twice',
        editorId: '7d3f0e2a-5b1c-4c8e-9a4f-2b6d8e1f3a5c',
        correlationId: 'b1e0c5d2-8f3a-4e6b-9c7d-1a2b3c4d5e6f',
        recordedAt: new Date('2026-01-01T00:00:00.120Z'),
      });

      const revision = NoteRevisionMapper.toModel(row);

      expect({ ...revision }).toEqual({
        id: '4210',
        noteId: '17',
        noteVersion: 2,
        bodyBefore: 'Customer called',
        bodyAfter: 'Customer called twice',
        editorId: '7d3f0e2a-5b1c-4c8e-9a4f-2b6d8e1f3a5c',
        correlationId: 'b1e0c5d2-8f3a-4e6b-9c7d-1a2b3c4d5e6f',
        recordedAt: new Date('2026-01-01T00:00:00.120Z'),
      });
    });
  });
});
