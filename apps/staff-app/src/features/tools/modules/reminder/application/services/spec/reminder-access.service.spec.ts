import { ReminderStatusEnum } from '@acme-libs/kernel';
import { ReminderModel } from '../../../domain';
import { ReminderAccessService } from '../reminder-access.service';

describe('ReminderAccessService', () => {
  let findById: jest.Mock;
  let service: ReminderAccessService;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue(
      ReminderModel.reconstitute({
        id: '7',
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: '',
        dueOn: '2026-11-05',
        status: ReminderStatusEnum.PENDING,
        version: 2,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );
    service = new ReminderAccessService({ findById });
  });

  describe('loadOwned', () => {
    it('answers the reminder of its owner', async () => {
      const reminder = await service.loadOwned({ reminderId: '7', ownerId: 'owner-1' });

      expect(reminder.id).toBe('7');
      expect(findById).toHaveBeenCalledWith('7');
    });

    it('refuses a missing reminder with REMINDER_NOT_FOUND', async () => {
      findById.mockResolvedValue(null);

      await expect(
        service.loadOwned({ reminderId: '7', ownerId: 'owner-1' }),
      ).rejects.toMatchObject({
        code: 'REMINDER_NOT_FOUND',
        message: 'Reminder 7 was not found',
      });
    });

    it('refuses a reminder of another owner with the same REMINDER_NOT_FOUND, hiding that it exists', async () => {
      await expect(
        service.loadOwned({ reminderId: '7', ownerId: 'owner-2' }),
      ).rejects.toMatchObject({
        code: 'REMINDER_NOT_FOUND',
        message: 'Reminder 7 was not found',
      });
    });
  });
});
