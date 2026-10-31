import { PinoLogger } from 'nestjs-pino';

import { ReminderStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ReminderModel } from '../../../domain';
import { ReminderAccessService } from '../../services/reminder-access.service';
import { ReminderDeleteUseCase } from '../reminder-delete.use-case';

describe('ReminderDeleteUseCase', () => {
  let loadOwned: jest.Mock;
  let softDelete: jest.Mock;
  let invalidate: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ReminderDeleteUseCase;

  beforeEach(() => {
    loadOwned = jest.fn().mockResolvedValue(
      ReminderModel.reconstitute({
        id: '7',
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: '',
        dueOn: '2026-11-05',
        status: ReminderStatusEnum.DONE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );
    softDelete = jest.fn().mockResolvedValue(undefined);
    invalidate = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    useCase = new ReminderDeleteUseCase(
      { loadOwned } as unknown as ReminderAccessService,
      { softDelete },
      { read: jest.fn(), invalidate },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('deletes an owned reminder, then invalidates the summary', async () => {
      const result = await useCase.execute({ reminderId: '7', ownerId: 'owner-1' });

      expect(result).toBeUndefined();
      expect(loadOwned).toHaveBeenCalledWith({ reminderId: '7', ownerId: 'owner-1' });
      expect(softDelete).toHaveBeenCalledWith('7');
      expect(invalidate).toHaveBeenCalledWith('owner-1');
      expect(softDelete.mock.invocationCallOrder[0]).toBeLessThan(
        invalidate.mock.invocationCallOrder[0],
      );
      expect(logger.info).toHaveBeenCalledWith({ reminderId: '7' }, 'Reminder deleted');
    });

    it('deletes nothing when the caller does not own the reminder', async () => {
      loadOwned.mockRejectedValue(new Error('forbidden'));

      await expect(useCase.execute({ reminderId: '7', ownerId: 'owner-2' })).rejects.toThrow(
        'forbidden',
      );
      expect(softDelete).not.toHaveBeenCalled();
      expect(invalidate).not.toHaveBeenCalled();
    });

    it('leaves the summary alone when the delete fails', async () => {
      softDelete.mockRejectedValue(new Error('connection lost'));

      await expect(useCase.execute({ reminderId: '7', ownerId: 'owner-1' })).rejects.toThrow(
        'connection lost',
      );
      expect(invalidate).not.toHaveBeenCalled();
    });
  });
});
