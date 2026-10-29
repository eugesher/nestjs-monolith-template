import { PinoLogger } from 'nestjs-pino';

import { ReminderStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ReminderModel } from '../../../domain';
import { ReminderWriteService } from '../../services/reminder-write.service';
import { ReminderRescheduleUseCase } from '../reminder-reschedule.use-case';

describe('ReminderRescheduleUseCase', () => {
  let write: jest.Mock;
  let invalidate: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ReminderRescheduleUseCase;

  beforeEach(() => {
    write = jest.fn().mockResolvedValue(
      ReminderModel.reconstitute({
        id: '7',
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: '',
        dueOn: '2026-11-12',
        status: ReminderStatusEnum.PENDING,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      }),
    );
    invalidate = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    useCase = new ReminderRescheduleUseCase(
      { write } as unknown as ReminderWriteService,
      { read: jest.fn(), invalidate },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('reschedules through the write service, invalidates the summary and answers the stored reminder', async () => {
      const view = await useCase.execute({
        reminderId: '7',
        ownerId: 'owner-1',
        dueOn: '2026-11-12',
      });

      expect(write).toHaveBeenCalledWith(
        { reminderId: '7', ownerId: 'owner-1' },
        expect.any(Function),
      );
      expect(invalidate).toHaveBeenCalledWith('owner-1');
      expect(write.mock.invocationCallOrder[0]).toBeLessThan(
        invalidate.mock.invocationCallOrder[0],
      );
      expect(view).toEqual({
        id: '7',
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: '',
        dueOn: '2026-11-12',
        status: 'pending',
        version: 3,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      });
      expect(logger.info).toHaveBeenCalledWith(
        { reminderId: '7', dueOn: '2026-11-12', version: 3 },
        'Reminder rescheduled',
      );
    });

    it('hands the write service a change that moves the due date', async () => {
      const reminder = ReminderModel.reconstitute({
        id: '7',
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: '',
        dueOn: '2026-11-05',
        status: ReminderStatusEnum.PENDING,
        version: 2,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      await useCase.execute({ reminderId: '7', ownerId: 'owner-1', dueOn: '2026-11-12' });

      const [, mutate] = write.mock.calls[0] as [unknown, (reminder: ReminderModel) => void];

      mutate(reminder);

      expect(reminder.dueOn).toBe('2026-11-12');
    });

    it('leaves the summary alone when the write is refused', async () => {
      write.mockRejectedValue(new Error('refused'));

      await expect(
        useCase.execute({ reminderId: '7', ownerId: 'owner-1', dueOn: '2026-11-12' }),
      ).rejects.toThrow('refused');
      expect(invalidate).not.toHaveBeenCalled();
    });
  });
});
