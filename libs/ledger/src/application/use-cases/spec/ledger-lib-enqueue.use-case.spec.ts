import type { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing/observability';

import { LedgerLibEnqueueUseCase } from '../ledger-lib-enqueue.use-case';

describe('LedgerLibEnqueueUseCase', () => {
  let add: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: LedgerLibEnqueueUseCase;

  beforeEach(() => {
    add = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    useCase = new LedgerLibEnqueueUseCase({ add }, 2, 500, logger as unknown as PinoLogger);
  });

  describe('execute', () => {
    it('adds the record once and logs it under its subject and operation key', async () => {
      await useCase.execute({
        operationKey: 'item-opened:7',
        subjectType: 'item',
        subjectId: '7',
        action: 'ItemOpened',
        payload: { name: 'Lamp' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      expect(add).toHaveBeenCalledTimes(1);
      expect(add).toHaveBeenCalledWith({
        record: {
          operationKey: 'item-opened:7',
          subjectType: 'item',
          subjectId: '7',
          action: 'ItemOpened',
          payload: { name: 'Lamp' },
          occurredAt: '2026-01-05T08:00:00.000Z',
          correlationId: 'corr-1',
        },
        timeoutMs: 500,
      });
      expect(logger.info).toHaveBeenCalledWith(
        { subjectType: 'item', subjectId: '7', operationKey: 'item-opened:7' },
        'Ledger record enqueued',
      );
    });

    it('retries a failed add and logs each retry', async () => {
      add.mockRejectedValueOnce(new Error('redis is down')).mockResolvedValue(undefined);

      await useCase.execute({
        operationKey: 'item-opened:7',
        subjectType: 'item',
        subjectId: '7',
        action: 'ItemOpened',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      expect(add).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledWith(
        {
          err: new Error('redis is down'),
          correlationId: 'corr-1',
          attempt: 1,
          subjectType: 'item',
          subjectId: '7',
          operationKey: 'item-opened:7',
        },
        'Ledger enqueue failed — retrying',
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs the record for replay after the configured attempts instead of throwing', async () => {
      add.mockRejectedValue(new Error('redis is down'));

      await useCase.execute({
        operationKey: 'item-opened:7',
        subjectType: 'item',
        subjectId: '7',
        action: 'ItemOpened',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      expect(add).toHaveBeenCalledTimes(2);
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        {
          err: new Error('redis is down'),
          correlationId: 'corr-1',
          subjectType: 'item',
          subjectId: '7',
          operationKey: 'item-opened:7',
        },
        'Ledger enqueue failed permanently: the record is ' +
          'absent from the queue and the ledger, replay this record',
      );
    });
  });
});
