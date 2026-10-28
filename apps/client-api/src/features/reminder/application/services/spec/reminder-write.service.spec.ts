import { PinoLogger } from 'nestjs-pino';

import { ReminderStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ReminderModel } from '../../../domain';
import { ReminderAccessService } from '../reminder-access.service';
import { ReminderWriteService } from '../reminder-write.service';

describe('ReminderWriteService', () => {
  let loadOwned: jest.Mock;
  let findById: jest.Mock;
  let update: jest.Mock;
  let logger: PinoLoggerMock;
  let service: ReminderWriteService;

  beforeEach(() => {
    loadOwned = jest.fn().mockImplementation(() =>
      Promise.resolve(
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
      ),
    );
    findById = jest.fn().mockResolvedValue(
      ReminderModel.reconstitute({
        id: '7',
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: '',
        dueOn: '2026-11-05',
        status: ReminderStatusEnum.DONE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      }),
    );
    update = jest.fn().mockResolvedValue(true);
    logger = makePinoLoggerMock();
    service = new ReminderWriteService(
      { loadOwned } as unknown as ReminderAccessService,
      { findById, update },
      5,
      logger as unknown as PinoLogger,
    );
  });

  describe('write', () => {
    it('saves the change against the version as read and answers the stored reminder', async () => {
      const written = await service.write({ reminderId: '7', ownerId: 'owner-1' }, (reminder) =>
        reminder.complete(),
      );
      const [command] = update.mock.calls[0] as [
        { reminder: ReminderModel; versionAsRead: number },
      ];

      expect(loadOwned).toHaveBeenCalledWith({ reminderId: '7', ownerId: 'owner-1' });
      expect(command.versionAsRead).toBe(2);
      expect(command.reminder.status).toBe('done');
      expect(command.reminder.version).toBe(3);
      expect(findById).toHaveBeenCalledWith('7');
      expect(written.updatedAt).toEqual(new Date('2026-01-03T00:00:00.000Z'));
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('writes nothing when the change leaves the version as read', async () => {
      const written = await service.write({ reminderId: '7', ownerId: 'owner-1' }, (reminder) =>
        reminder.reschedule('2026-11-05'),
      );

      expect(update).not.toHaveBeenCalled();
      expect(findById).not.toHaveBeenCalled();
      expect(written.version).toBe(2);
    });

    it('retries a lost race with a fresh read and logs the retry', async () => {
      update.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

      const written = await service.write({ reminderId: '7', ownerId: 'owner-1' }, (reminder) =>
        reminder.complete(),
      );

      expect(loadOwned).toHaveBeenCalledTimes(2);
      expect(update).toHaveBeenCalledTimes(2);
      expect(written.version).toBe(3);
      expect(logger.info).toHaveBeenCalledWith(
        { reminderId: '7', currentVersion: 3, attempt: 1, maxAttempts: 5 },
        'Reminder write conflict — retrying with a fresh read',
      );
    });

    it('refuses with VERSION_MISMATCH once the budget is spent and logs a warning', async () => {
      update.mockResolvedValue(false);

      await expect(
        service.write({ reminderId: '7', ownerId: 'owner-1' }, (reminder) => reminder.complete()),
      ).rejects.toMatchObject({
        code: 'VERSION_MISMATCH',
        message: 'Reminder 7 write lost the optimistic race after 5 attempts',
        details: { currentVersion: 3 },
      });
      expect(update).toHaveBeenCalledTimes(5);
      expect(logger.warn).toHaveBeenCalledWith(
        { reminderId: '7', attempts: 5, maxAttempts: 5 },
        'Reminder write conflict exhausted retry budget',
      );
    });

    it('does not retry a domain refusal', async () => {
      await expect(
        service.write({ reminderId: '7', ownerId: 'owner-1' }, (reminder) =>
          reminder.reschedule('2026-02-30'),
        ),
      ).rejects.toMatchObject({ code: 'REMINDER_DUE_ON_INVALID' });
      expect(loadOwned).toHaveBeenCalledTimes(1);
      expect(update).not.toHaveBeenCalled();
    });

    it('refuses with REMINDER_NOT_FOUND when the reminder vanished after the update', async () => {
      findById.mockResolvedValue(null);

      await expect(
        service.write({ reminderId: '7', ownerId: 'owner-1' }, (reminder) => reminder.complete()),
      ).rejects.toMatchObject({
        code: 'REMINDER_NOT_FOUND',
        message: 'Reminder 7 was not found',
      });
    });
  });
});
