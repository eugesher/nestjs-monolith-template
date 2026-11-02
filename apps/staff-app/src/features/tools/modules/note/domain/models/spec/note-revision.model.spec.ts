import { NoteRevisionModel } from '../note-revision.model';

describe('NoteRevisionModel', () => {
  describe('create', () => {
    it('records an edit with no id and no recording time yet', () => {
      const revision = NoteRevisionModel.create({
        noteId: '7',
        noteVersion: 2,
        bodyBefore: 'Check the supplier',
        bodyAfter: 'Supplier confirmed',
        editorId: 'admin-2',
        correlationId: 'corr-1',
      });

      expect(revision).toEqual({
        id: undefined,
        noteId: '7',
        noteVersion: 2,
        bodyBefore: 'Check the supplier',
        bodyAfter: 'Supplier confirmed',
        editorId: 'admin-2',
        correlationId: 'corr-1',
        recordedAt: undefined,
      });
    });

    it('is frozen', () => {
      const revision = NoteRevisionModel.create({
        noteId: '7',
        noteVersion: 2,
        bodyBefore: 'Check the supplier',
        bodyAfter: 'Supplier confirmed',
        editorId: 'admin-2',
        correlationId: 'corr-1',
      });

      expect(Object.isFrozen(revision)).toBe(true);
      expect(() => {
        Object.assign(revision, { bodyAfter: 'Rewritten' });
      }).toThrow(TypeError);
    });

    it.each([1, 2.5])('refuses note version %s with NOTE_VERSION_INVALID', (noteVersion) => {
      expect(() =>
        NoteRevisionModel.create({
          noteId: '7',
          noteVersion,
          bodyBefore: 'Check the supplier',
          bodyAfter: 'Supplier confirmed',
          editorId: 'admin-2',
          correlationId: 'corr-1',
        }),
      ).toThrow(
        expect.objectContaining({
          code: 'NOTE_VERSION_INVALID',
          message: `NoteRevision.noteVersion must be an integer of at least 2, got ${noteVersion}`,
        }) as Error,
      );
    });
  });

  describe('reconstitute', () => {
    it('restores a stored revision, frozen', () => {
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

      expect(revision.id).toBe('11');
      expect(revision.noteVersion).toBe(3);
      expect(revision.recordedAt).toEqual(new Date('2026-01-02T00:00:00.123Z'));
      expect(Object.isFrozen(revision)).toBe(true);
    });

    it('refuses a stored note version below 2 with NOTE_VERSION_INVALID', () => {
      expect(() =>
        NoteRevisionModel.reconstitute({
          id: '11',
          noteId: '7',
          noteVersion: 1,
          bodyBefore: 'Check the supplier',
          bodyAfter: 'Supplier confirmed',
          editorId: 'admin-2',
          correlationId: 'corr-1',
          recordedAt: new Date('2026-01-02T00:00:00.123Z'),
        }),
      ).toThrow(expect.objectContaining({ code: 'NOTE_VERSION_INVALID' }) as Error);
    });
  });

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

      expect(revision.toView()).toEqual({
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
      const view = revision.toView();

      jest.useRealTimers();

      expect(view.id).toBe('');
      expect(view.recordedAt).toBe('2026-03-01T10:00:00.000Z');
    });
  });
});
