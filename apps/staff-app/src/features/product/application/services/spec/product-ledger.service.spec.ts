import { PinoLogger } from 'nestjs-pino';

import { ProductStatusEnum } from '@acme-libs/kernel';
import { CorrelationContextHelper } from '@acme-libs/observability';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ProductArchivedEvent, ProductRenamedEvent } from '../../../domain';
import { ProductLedgerService } from '../product-ledger.service';

describe('ProductLedgerService', () => {
  let append: jest.Mock;
  let logger: PinoLoggerMock;
  let service: ProductLedgerService;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    append = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    service = new ProductLedgerService({ append }, logger as unknown as PinoLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordArchived', () => {
    it('appends the archive under the operation key of the product', async () => {
      await service.recordArchived({
        productId: '12',
        events: [
          new ProductRenamedEvent('12', 'Desk lamp', 'Lamp'),
          new ProductArchivedEvent('12', 'SKU-0001', ProductStatusEnum.ACTIVE),
        ],
      });

      expect(append).toHaveBeenCalledTimes(1);
      expect(append).toHaveBeenCalledWith({
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { sku: 'SKU-0001', previousStatus: 'active' },
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
    });

    it('appends nothing without an archive', async () => {
      await service.recordArchived({ productId: '12', events: [] });

      expect(append).not.toHaveBeenCalled();
    });

    it('retries a failed append and logs each retry', async () => {
      append.mockRejectedValueOnce(new Error('deadlock')).mockResolvedValue(undefined);

      await CorrelationContextHelper.run('corr-1', () =>
        service.recordArchived({
          productId: '12',
          events: [new ProductArchivedEvent('12', 'SKU-0001', ProductStatusEnum.DRAFT)],
        }),
      );

      expect(append).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledWith(
        {
          err: new Error('deadlock'),
          correlationId: 'corr-1',
          attempt: 1,
          productId: '12',
          operationKey: 'product-archived:12',
        },
        'Ledger append (product archived) failed — retrying',
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs the record for replay after three failures instead of throwing', async () => {
      append.mockRejectedValue(new Error('deadlock'));

      await CorrelationContextHelper.run('corr-1', () =>
        service.recordArchived({
          productId: '12',
          events: [new ProductArchivedEvent('12', 'SKU-0001', ProductStatusEnum.ACTIVE)],
        }),
      );

      expect(append).toHaveBeenCalledTimes(3);
      expect(logger.error).toHaveBeenCalledWith(
        {
          err: new Error('deadlock'),
          correlationId: 'corr-1',
          productId: '12',
          operationKey: 'product-archived:12',
        },
        'Ledger append failed permanently: the product is archived but absent from the ledger, replay this record',
      );
    });
  });
});
