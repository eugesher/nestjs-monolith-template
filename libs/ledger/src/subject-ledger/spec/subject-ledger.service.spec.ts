import { ISubjectLedgerLogger } from '../subject-ledger-logger.interface';
import { ISubjectLedgerPort } from '../subject-ledger-port.interface';
import { ISubjectLedgerRecord } from '../subject-ledger-record.interface';
import { SubjectLedgerService } from '../subject-ledger.service';

describe('SubjectLedgerService', () => {
  class ItemLedgerService extends SubjectLedgerService {
    constructor(
      protected readonly queue: ISubjectLedgerPort,
      protected readonly retryAttempts: number,
      protected readonly logger: ISubjectLedgerLogger,
    ) {
      super();
    }

    public async recordOpened(record: ISubjectLedgerRecord): Promise<void> {
      await this.record(record);
    }
  }

  let enqueue: jest.Mock;
  let logger: { info: jest.Mock; warn: jest.Mock; error: jest.Mock };
  let service: ItemLedgerService;

  beforeEach(() => {
    enqueue = jest.fn().mockResolvedValue(undefined);
    logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    service = new ItemLedgerService({ enqueue }, 2, logger);
  });

  describe('record', () => {
    it('enqueues the record once and logs it under its subject and operation key', async () => {
      await service.recordOpened({
        operationKey: 'item-opened:7',
        subjectType: 'item',
        subjectId: '7',
        action: 'ItemOpened',
        payload: { name: 'Lamp' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      expect(enqueue).toHaveBeenCalledTimes(1);
      expect(enqueue).toHaveBeenCalledWith({
        operationKey: 'item-opened:7',
        subjectType: 'item',
        subjectId: '7',
        action: 'ItemOpened',
        payload: { name: 'Lamp' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });
      expect(logger.info).toHaveBeenCalledWith(
        { subjectType: 'item', subjectId: '7', operationKey: 'item-opened:7' },
        'Ledger record enqueued',
      );
    });

    it('retries a failed enqueue and logs each retry', async () => {
      enqueue.mockRejectedValueOnce(new Error('redis is down')).mockResolvedValue(undefined);

      await service.recordOpened({
        operationKey: 'item-opened:7',
        subjectType: 'item',
        subjectId: '7',
        action: 'ItemOpened',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      expect(enqueue).toHaveBeenCalledTimes(2);
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
      enqueue.mockRejectedValue(new Error('redis is down'));

      await service.recordOpened({
        operationKey: 'item-opened:7',
        subjectType: 'item',
        subjectId: '7',
        action: 'ItemOpened',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      expect(enqueue).toHaveBeenCalledTimes(2);
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
