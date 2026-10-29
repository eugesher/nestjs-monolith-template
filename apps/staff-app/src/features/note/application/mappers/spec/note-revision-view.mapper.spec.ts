import { NoteRevisionModel } from '../../../domain';
import { NoteRevisionViewMapper } from '../note-revision-view.mapper';

describe('NoteRevisionViewMapper', () => {
  describe('toView', () => {
    it('maps a stored revision with its instant as an ISO string', () => {
      const revision = NoteRevisionModel.reconstitute({
        id: '11',
        noteId: '7',
        noteVersion: 3,
        bodyBefore: 'Check the supplier',
        bodyAfter: 'Supplier confirmed',
        editorId: 'admin-2',
        correlationId: 'corr-1',
        recordedAt: new Date('2026-01-02T00:00:00.123Z'),
      });

      expect(NoteRevisionViewMapper.toView(revision)).toEqual({
        id: '11',
        noteId: '7',
        noteVersion: 3,
        bodyBefore: 'Check the supplier',
        bodyAfter: 'Supplier confirmed',
        editorId: 'admin-2',
        correlationId: 'corr-1',
        recordedAt: '2026-01-02T00:00:00.123Z',
      });
    });

    it('answers an empty id and the current instant for a revision that was never stored', () => {
      jest.useFakeTimers({ now: new Date('2026-03-01T10:00:00.000Z') });

      const revision = NoteRevisionModel.create({
        noteId: '7',
        noteVersion: 2,
        bodyBefore: 'Check the supplier',
        bodyAfter: 'Supplier confirmed',
        editorId: 'admin-2',
        correlationId: 'corr-1',
      });
      const view = NoteRevisionViewMapper.toView(revision);

      jest.useRealTimers();

      expect(view.id).toBe('');
      expect(view.recordedAt).toBe('2026-03-01T10:00:00.000Z');
    });
  });
});
