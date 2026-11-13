import { NoteGetRevisionsModel } from '../note-get-revisions.model';

describe('NoteGetRevisionsModel', () => {
  describe('toViewData', () => {
    it('answers the snapshot of every listed revision', () => {
      const data = NoteGetRevisionsModel.toViewData([
        {
          id: '40',
          noteId: '7',
          noteVersion: 2,
          bodyBefore: 'Check',
          bodyAfter: 'Check the stock',
          editorId: 'admin-1',
          correlationId: 'c0ffee00-0000-4000-8000-000000000001',
          recordedAt: new Date('2026-01-03T00:00:00.000Z'),
        },
      ]);

      expect(data).toEqual([
        {
          id: '40',
          noteId: '7',
          noteVersion: 2,
          bodyBefore: 'Check',
          bodyAfter: 'Check the stock',
          editorId: 'admin-1',
          correlationId: 'c0ffee00-0000-4000-8000-000000000001',
          recordedAt: '2026-01-03T00:00:00.000Z',
        },
      ]);
    });

    it('answers no snapshots for no records', () => {
      expect(NoteGetRevisionsModel.toViewData([])).toEqual([]);
    });
  });
});
