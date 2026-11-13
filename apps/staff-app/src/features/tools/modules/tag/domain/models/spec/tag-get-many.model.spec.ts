import { TagGetManyModel } from '../tag-get-many.model';

describe('TagGetManyModel', () => {
  describe('toViewData', () => {
    it('answers the snapshot of every listed tag', () => {
      const data = TagGetManyModel.toViewData([
        {
          id: '300',
          name: 'promo',
          createdAt: new Date('2026-01-03T00:00:00.000Z'),
          updatedAt: new Date('2026-01-03T00:00:00.000Z'),
        },
      ]);

      expect(data).toEqual([
        {
          id: '300',
          name: 'promo',
          createdAt: '2026-01-03T00:00:00.000Z',
          updatedAt: '2026-01-03T00:00:00.000Z',
        },
      ]);
    });

    it('answers no snapshots for no records', () => {
      expect(TagGetManyModel.toViewData([])).toEqual([]);
    });
  });
});
