import { NoteRevisionModel } from '../note-revision.model';

describe('NoteRevisionModel', () => {
  describe('reconstitute', () => {
    it('restores a stored revision, frozen', () => {
      const revision = NoteRevisionModel.reconstitute({
        id: '11',
        noteId: '7',
        noteVersion: 3,
        bodyBefore: 'Check the supplier',
        bodyAfter: 'Supplier confirmed',
        editorId: 'admin-2',
        correlationId: 'c0ffee00-0000-4000-8000-000000000001',
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
          correlationId: 'c0ffee00-0000-4000-8000-000000000001',
          recordedAt: new Date('2026-01-02T00:00:00.123Z'),
        }),
      ).toThrow(expect.objectContaining({ code: 'NOTE_VERSION_INVALID' }) as Error);
    });
  });

  describe('createDraft', () => {
    it('drafts an edit of the note', () => {
      const draft = NoteRevisionModel.createDraft({
        noteId: '7',
        noteVersion: 2,
        bodyBefore: 'Check the supplier',
        bodyAfter: 'Supplier confirmed',
        editorId: 'admin-2',
        correlationId: 'c0ffee00-0000-4000-8000-000000000001',
      });

      expect(draft).toEqual({
        noteId: '7',
        noteVersion: 2,
        bodyBefore: 'Check the supplier',
        bodyAfter: 'Supplier confirmed',
        editorId: 'admin-2',
        correlationId: 'c0ffee00-0000-4000-8000-000000000001',
      });
    });

    it.each([1, 2.5])('refuses note version %s with NOTE_VERSION_INVALID', (noteVersion) => {
      expect(() =>
        NoteRevisionModel.createDraft({
          noteId: '7',
          noteVersion,
          bodyBefore: 'Check the supplier',
          bodyAfter: 'Supplier confirmed',
          editorId: 'admin-2',
          correlationId: 'c0ffee00-0000-4000-8000-000000000001',
        }),
      ).toThrow(
        expect.objectContaining({
          code: 'NOTE_VERSION_INVALID',
          message: `NoteRevision.noteVersion must be an integer of at least 2, got ${noteVersion}`,
        }) as Error,
      );
    });
  });

  describe('toSnapshot', () => {
    it('maps a stored revision with its instant as an ISO string', () => {
      const revision = NoteRevisionModel.reconstitute({
        id: '11',
        noteId: '7',
        noteVersion: 3,
        bodyBefore: 'Check the supplier',
        bodyAfter: 'Supplier confirmed',
        editorId: 'admin-2',
        correlationId: 'c0ffee00-0000-4000-8000-000000000001',
        recordedAt: new Date('2026-01-02T00:00:00.123Z'),
      });

      expect(revision.toSnapshot()).toEqual({
        id: '11',
        noteId: '7',
        noteVersion: 3,
        bodyBefore: 'Check the supplier',
        bodyAfter: 'Supplier confirmed',
        editorId: 'admin-2',
        correlationId: 'c0ffee00-0000-4000-8000-000000000001',
        recordedAt: '2026-01-02T00:00:00.123Z',
      });
    });
  });
});
