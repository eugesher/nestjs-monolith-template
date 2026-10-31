import { PinoLogger } from 'nestjs-pino';

import { ReminderStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ReminderModel } from '../../../domain';
import { ReminderCreateUseCase } from '../reminder-create.use-case';

describe('ReminderCreateUseCase', () => {
  let insert: jest.Mock;
  let invalidate: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ReminderCreateUseCase;

  beforeEach(() => {
    insert = jest.fn().mockResolvedValue(
      ReminderModel.reconstitute({
        id: '7',
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: '',
        dueOn: '2026-11-05',
        status: ReminderStatusEnum.PENDING,
        version: 1,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );
    invalidate = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    useCase = new ReminderCreateUseCase(
      { insert },
      { read: jest.fn(), invalidate },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('stores a pending reminder, invalidates the summary and answers the stored reminder', async () => {
      const view = await useCase.execute({
        ownerId: 'owner-1',
        title: ' Call the bank ',
        body: undefined,
        dueOn: '2026-11-05',
      });
      const [reminder] = insert.mock.calls[0] as [ReminderModel];

      expect(reminder.title).toBe('Call the bank');
      expect(reminder.body).toBe('');
      expect(reminder.status).toBe('pending');
      expect(invalidate).toHaveBeenCalledWith('owner-1');
      expect(view).toEqual({
        id: '7',
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: '',
        dueOn: '2026-11-05',
        status: 'pending',
        version: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
      expect(logger.info).toHaveBeenCalledWith(
        { reminderId: '7', ownerId: 'owner-1' },
        'Reminder created',
      );
    });

    it('invalidates the summary only after the insert', async () => {
      await useCase.execute({
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: 'About the card',
        dueOn: '2026-11-05',
      });

      expect(insert.mock.invocationCallOrder[0]).toBeLessThan(
        invalidate.mock.invocationCallOrder[0],
      );
    });

    it('refuses an invalid reminder before storing or invalidating anything', async () => {
      await expect(
        useCase.execute({
          ownerId: 'owner-1',
          title: 'Call the bank',
          body: undefined,
          dueOn: '2026-02-30',
        }),
      ).rejects.toMatchObject({ code: 'REMINDER_DUE_ON_INVALID' });
      expect(insert).not.toHaveBeenCalled();
      expect(invalidate).not.toHaveBeenCalled();
    });

    it('leaves the summary alone when the insert fails', async () => {
      insert.mockRejectedValue(new Error('connection lost'));

      await expect(
        useCase.execute({
          ownerId: 'owner-1',
          title: 'Call the bank',
          body: undefined,
          dueOn: '2026-11-05',
        }),
      ).rejects.toThrow('connection lost');
      expect(invalidate).not.toHaveBeenCalled();
    });
  });
});
