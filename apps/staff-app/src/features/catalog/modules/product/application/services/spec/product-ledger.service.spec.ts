import { PinoLogger } from 'nestjs-pino';

import { ProductStatusEnum } from '@acme-libs/kernel';
import { CorrelationContextHelper } from '@acme-libs/observability';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import {
  ProductArchivedEvent,
  ProductCreatedEvent,
  ProductRenamedEvent,
  ProductRestockedEvent,
} from '../../../domain';
import { ProductLedgerService } from '../product-ledger.service';

describe('ProductLedgerService', () => {
  let enqueue: jest.Mock;
  let append: jest.Mock;
  let logger: PinoLoggerMock;
  let service: ProductLedgerService;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    enqueue = jest.fn().mockResolvedValue(undefined);
    append = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    service = new ProductLedgerService({ enqueue }, { append }, 2, logger as unknown as PinoLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('enqueue', () => {
    it('enqueues a creation under the stored id with the correlation id of the request', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        service.enqueue({
          productId: '12',
          events: [new ProductCreatedEvent(undefined, 'SKU-0001', 'Lamp')],
        }),
      );

      expect(enqueue).toHaveBeenCalledWith({
        operationKey: 'product-created:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductCreated',
        payload: { sku: 'SKU-0001', name: 'Lamp' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });
      expect(logger.info).toHaveBeenCalledWith(
        { productId: '12', operationKey: 'product-created:12' },
        'Ledger record enqueued',
      );
    });

    it('enqueues an archive and leaves a rename out of the ledger', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        service.enqueue({
          productId: '12',
          events: [
            new ProductRenamedEvent('12', 'Desk lamp', 'Lamp'),
            new ProductArchivedEvent('12', 'SKU-0001', ProductStatusEnum.ACTIVE),
          ],
        }),
      );

      expect(enqueue).toHaveBeenCalledTimes(1);
      expect(enqueue).toHaveBeenCalledWith({
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { sku: 'SKU-0001', previousStatus: 'active' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });
    });

    it('retries a failed enqueue and logs each retry', async () => {
      enqueue.mockRejectedValueOnce(new Error('redis is down')).mockResolvedValue(undefined);

      await CorrelationContextHelper.run('corr-1', () =>
        service.enqueue({
          productId: '12',
          events: [new ProductCreatedEvent(undefined, 'SKU-0001', 'Lamp')],
        }),
      );

      expect(enqueue).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledWith(
        {
          err: new Error('redis is down'),
          correlationId: 'corr-1',
          attempt: 1,
          productId: '12',
          operationKey: 'product-created:12',
        },
        'Ledger enqueue (product) failed — retrying',
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs the record for replay after the configured attempts instead of throwing', async () => {
      enqueue.mockRejectedValue(new Error('redis is down'));

      await CorrelationContextHelper.run('corr-1', () =>
        service.enqueue({
          productId: '12',
          events: [new ProductCreatedEvent(undefined, 'SKU-0001', 'Lamp')],
        }),
      );

      expect(enqueue).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalledWith(
        {
          err: new Error('redis is down'),
          correlationId: 'corr-1',
          productId: '12',
          operationKey: 'product-created:12',
        },
        'Ledger enqueue failed permanently: the record is absent from the queue and the ledger, replay this record',
      );
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('enqueueRestocked', () => {
    it('enqueues a restock under the id of its stock row with the correlation id of the request', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        service.enqueueRestocked({
          productId: '12',
          productStockId: '700',
          events: [new ProductRestockedEvent('12', 'SKU-0001', 5)],
        }),
      );

      expect(enqueue).toHaveBeenCalledWith({
        operationKey: 'product-restocked:700',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductRestocked',
        payload: { sku: 'SKU-0001', quantity: 5 },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });
      expect(logger.info).toHaveBeenCalledWith(
        { productId: '12', operationKey: 'product-restocked:700' },
        'Ledger record enqueued',
      );
    });

    it('enqueues nothing without a restock', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        service.enqueueRestocked({
          productId: '12',
          productStockId: '700',
          events: [new ProductRenamedEvent('12', 'Desk lamp', 'Lamp')],
        }),
      );

      expect(enqueue).not.toHaveBeenCalled();
    });
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

    it('logs the record for replay after the configured attempts instead of throwing', async () => {
      append.mockRejectedValue(new Error('deadlock'));

      await CorrelationContextHelper.run('corr-1', () =>
        service.recordArchived({
          productId: '12',
          events: [new ProductArchivedEvent('12', 'SKU-0001', ProductStatusEnum.ACTIVE)],
        }),
      );

      expect(append).toHaveBeenCalledTimes(2);
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
