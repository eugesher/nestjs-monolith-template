import { ReminderStatusEnum } from '@acme-libs/kernel';
import { ReminderModel } from '../../../domain';
import { ReminderAccessService } from '../reminder-access.service';

describe('ReminderAccessService', () => {
  let findOwned: jest.Mock;
  let service: ReminderAccessService;

  beforeEach(() => {
    findOwned = jest.fn().mockResolvedValue(
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
    service = new ReminderAccessService({ findOwned });
  });

  describe('loadOwned', () => {
    it('answers the reminder of its owner', async () => {
      const reminder = await service.loadOwned({ reminderId: '7', ownerId: 'owner-1' });

      expect(reminder.id).toBe('7');
      expect(findOwned).toHaveBeenCalledWith({ reminderId: '7', ownerId: 'owner-1' });
    });

    it('refuses a reminder not found for the owner with REMINDER_NOT_FOUND', async () => {
      findOwned.mockResolvedValue(null);

      await expect(
        service.loadOwned({ reminderId: '7', ownerId: 'owner-1' }),
      ).rejects.toMatchObject({
        code: 'REMINDER_NOT_FOUND',
        message: 'Reminder 7 was not found',
      });
    });
  });
});
