import { ReminderStatusEnum } from '@acme-libs/kernel';

import { ReminderGetManyModel } from '../reminder-get-many.model';

describe('ReminderGetManyModel', () => {
  describe('toViewData', () => {
    it('answers the snapshot of every listed reminder', () => {
      const data = ReminderGetManyModel.toViewData([
        {
          id: '31',
          ownerId: 'staff-1',
          title: 'Call the bank',
          body: '',
          dueOn: '2026-11-05',
          status: ReminderStatusEnum.PENDING,
          version: 1,
          createdAt: new Date('2026-01-03T00:00:00.000Z'),
          updatedAt: new Date('2026-01-03T00:00:00.000Z'),
        },
      ]);

      expect(data).toEqual([
        {
          id: '31',
          ownerId: 'staff-1',
          title: 'Call the bank',
          body: '',
          dueOn: '2026-11-05',
          status: ReminderStatusEnum.PENDING,
          version: 1,
          createdAt: '2026-01-03T00:00:00.000Z',
          updatedAt: '2026-01-03T00:00:00.000Z',
        },
      ]);
    });

    it('answers no snapshots for no records', () => {
      expect(ReminderGetManyModel.toViewData([])).toEqual([]);
    });
  });
});
