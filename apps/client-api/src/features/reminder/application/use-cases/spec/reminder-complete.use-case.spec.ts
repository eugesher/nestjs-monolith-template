import { PinoLogger } from 'nestjs-pino';

import { ReminderStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ReminderModel } from '../../../domain';
import { ReminderWriteService } from '../../services/reminder-write.service';
import { ReminderCompleteUseCase } from '../reminder-complete.use-case';

describe('ReminderCompleteUseCase', () => {
  let write: jest.Mock;
  let invalidate: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ReminderCompleteUseCase;

  beforeEach(() => {
    write = jest.fn().mockResolvedValue(
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
    invalidate = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    useCase = new ReminderCompleteUseCase(
      { write } as unknown as ReminderWriteService,
      { read: jest.fn(), invalidate },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('completes through the write service, invalidates the summary and answers the stored reminder', async () => {
      const view = await useCase.execute({ reminderId: '7', ownerId: 'owner-1' });

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
        dueOn: '2026-11-05',
        status: 'done',
        version: 3,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      });
      expect(logger.info).toHaveBeenCalledWith(
        { reminderId: '7', version: 3 },
        'Reminder completed',
      );
    });

    it('hands the write service a change that completes the reminder', async () => {
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

      await useCase.execute({ reminderId: '7', ownerId: 'owner-1' });

      const [, mutate] = write.mock.calls[0] as [unknown, (reminder: ReminderModel) => void];

      mutate(reminder);

      expect(reminder.status).toBe('done');
    });

    it('leaves the summary alone when the write is refused', async () => {
      write.mockRejectedValue(new Error('refused'));

      await expect(useCase.execute({ reminderId: '7', ownerId: 'owner-1' })).rejects.toThrow(
        'refused',
      );
      expect(invalidate).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });
  });
});
