import { Reminder } from '@acme-core/entities';
import { ReminderStatusEnum } from '@acme-libs/kernel';
import { ReminderMapper } from '../reminder.mapper';

describe('ReminderMapper', () => {
  describe('toModel', () => {
    it('restores the row as a reminder with its string id, calendar date and stored times', () => {
      const row = Object.assign(new Reminder(), {
        id: '31',
        ownerId: '7d3f0e2a-5b1c-4c8e-9a4f-2b6d8e1f3a5c',
        title: 'Renew the subscription',
        body: 'The annual one',
        dueOn: '2026-06-01',
        status: ReminderStatusEnum.DONE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        deletedAt: null,
      });

      const reminder = ReminderMapper.toModel(row);

      expect({
        id: reminder.id,
        ownerId: reminder.ownerId,
        title: reminder.title,
        body: reminder.body,
        dueOn: reminder.dueOn,
        status: reminder.status,
        version: reminder.version,
        createdAt: reminder.createdAt,
        updatedAt: reminder.updatedAt,
      }).toEqual({
        id: '31',
        ownerId: '7d3f0e2a-5b1c-4c8e-9a4f-2b6d8e1f3a5c',
        title: 'Renew the subscription',
        body: 'The annual one',
        dueOn: '2026-06-01',
        status: ReminderStatusEnum.DONE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });
    });
  });
});
