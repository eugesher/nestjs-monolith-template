import { NoteModel } from '../../../domain';
import { NoteViewMapper } from '../note-view.mapper';

describe('NoteViewMapper', () => {
  describe('toView', () => {
    it('maps a stored note with its instants as ISO strings', () => {
      const note = NoteModel.reconstitute({
        id: '7',
        subjectType: 'item',
        subjectId: '42',
        body: 'Check the supplier',
        authorId: 'admin-1',
        resolved: false,
        version: 2,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });

      expect(NoteViewMapper.toView(note)).toEqual({
        id: '7',
        subjectType: 'item',
        subjectId: '42',
        body: 'Check the supplier',
        authorId: 'admin-1',
        resolved: false,
        version: 2,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });
    });

    it('answers an empty id and the current instant for a note that was never stored', () => {
      jest.useFakeTimers({ now: new Date('2026-03-01T10:00:00.000Z') });

      const note = NoteModel.create({
        subjectType: 'item',
        subjectId: '42',
        body: 'Check the supplier',
        authorId: 'admin-1',
      });
      const view = NoteViewMapper.toView(note);

      jest.useRealTimers();

      expect(view.id).toBe('');
      expect(view.createdAt).toBe('2026-03-01T10:00:00.000Z');
      expect(view.updatedAt).toBe('2026-03-01T10:00:00.000Z');
    });
  });
});
