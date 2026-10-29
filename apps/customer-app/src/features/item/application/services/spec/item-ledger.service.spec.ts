import { PinoLogger } from 'nestjs-pino';

import { ItemStatusEnum } from '@acme-libs/kernel';
import { CorrelationContextHelper } from '@acme-libs/observability';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ItemArchivedEvent, ItemRenamedEvent } from '../../../domain';
import { ItemLedgerService } from '../item-ledger.service';

describe('ItemLedgerService', () => {
  let append: jest.Mock;
  let logger: PinoLoggerMock;
  let service: ItemLedgerService;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    append = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    service = new ItemLedgerService({ append }, logger as unknown as PinoLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordArchived', () => {
    it('appends the archive under the operation key of the item', async () => {
      await service.recordArchived({
        itemId: '12',
        events: [
          new ItemRenamedEvent('12', 'Desk lamp', 'Lamp'),
          new ItemArchivedEvent('12', 'SKU-0001', ItemStatusEnum.ACTIVE),
        ],
      });

      expect(append).toHaveBeenCalledTimes(1);
      expect(append).toHaveBeenCalledWith({
        operationKey: 'item-archived:12',
        subjectType: 'item',
        subjectId: '12',
        action: 'ItemArchived',
        payload: { sku: 'SKU-0001', previousStatus: 'active' },
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
    });

    it('appends nothing without an archive', async () => {
      await service.recordArchived({ itemId: '12', events: [] });

      expect(append).not.toHaveBeenCalled();
    });

    it('retries a failed append and logs each retry', async () => {
      append.mockRejectedValueOnce(new Error('deadlock')).mockResolvedValue(undefined);

      await CorrelationContextHelper.run('corr-1', () =>
        service.recordArchived({
          itemId: '12',
          events: [new ItemArchivedEvent('12', 'SKU-0001', ItemStatusEnum.DRAFT)],
        }),
      );

      expect(append).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledWith(
        {
          err: new Error('deadlock'),
          correlationId: 'corr-1',
          attempt: 1,
          itemId: '12',
          operationKey: 'item-archived:12',
        },
        'Ledger append (item archived) failed — retrying',
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs the record for replay after three failures instead of throwing', async () => {
      append.mockRejectedValue(new Error('deadlock'));

      await CorrelationContextHelper.run('corr-1', () =>
        service.recordArchived({
          itemId: '12',
          events: [new ItemArchivedEvent('12', 'SKU-0001', ItemStatusEnum.ACTIVE)],
        }),
      );

      expect(append).toHaveBeenCalledTimes(3);
      expect(logger.error).toHaveBeenCalledWith(
        {
          err: new Error('deadlock'),
          correlationId: 'corr-1',
          itemId: '12',
          operationKey: 'item-archived:12',
        },
        'Ledger append failed permanently: the item is archived but absent from the ledger, replay this record',
      );
    });
  });
});
