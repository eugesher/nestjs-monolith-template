import { ReminderStatusEnum } from '@acme-libs/kernel';
import { ReminderModel } from '../../../domain';
import { ReminderViewMapper } from '../reminder-view.mapper';

describe('ReminderViewMapper', () => {
  describe('toView', () => {
    it('maps a stored reminder with its instants as ISO strings', () => {
      const reminder = ReminderModel.reconstitute({
        id: '7',
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: 'About the card',
        dueOn: '2026-11-05',
        status: ReminderStatusEnum.PENDING,
        version: 2,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });

      expect(ReminderViewMapper.toView(reminder)).toEqual({
        id: '7',
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: 'About the card',
        dueOn: '2026-11-05',
        status: 'pending',
        version: 2,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });
    });

    it('answers an empty id and the current instant for a reminder that was never stored', () => {
      jest.useFakeTimers({ now: new Date('2026-03-01T10:00:00.000Z') });

      const reminder = ReminderModel.create({
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: '',
        dueOn: '2026-11-05',
      });
      const view = ReminderViewMapper.toView(reminder);

      jest.useRealTimers();

      expect(view.id).toBe('');
      expect(view.createdAt).toBe('2026-03-01T10:00:00.000Z');
      expect(view.updatedAt).toBe('2026-03-01T10:00:00.000Z');
    });
  });
});
