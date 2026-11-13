import { NoteGetManyModel } from '../note-get-many.model';

describe('NoteGetManyModel', () => {
  describe('toViewData', () => {
    it('answers the snapshot of every listed note', () => {
      const data = NoteGetManyModel.toViewData([
        {
          id: '7',
          subjectType: 'product',
          subjectId: '12',
          body: 'Check the stock',
          authorId: 'admin-1',
          resolved: false,
          version: 1,
          createdAt: new Date('2026-01-03T00:00:00.000Z'),
          updatedAt: new Date('2026-01-03T00:00:00.000Z'),
        },
      ]);

      expect(data).toEqual([
        {
          id: '7',
          subjectType: 'product',
          subjectId: '12',
          body: 'Check the stock',
          authorId: 'admin-1',
          resolved: false,
          version: 1,
          createdAt: '2026-01-03T00:00:00.000Z',
          updatedAt: '2026-01-03T00:00:00.000Z',
        },
      ]);
    });

    it('answers no snapshots for no records', () => {
      expect(NoteGetManyModel.toViewData([])).toEqual([]);
    });
  });
});
