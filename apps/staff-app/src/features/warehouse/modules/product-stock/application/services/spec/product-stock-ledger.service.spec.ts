import { PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { DomainEvent } from '@acme-libs/toolkit';
import { ProductStockAddedEvent } from '../../../domain';
import { ProductStockLedgerService } from '../product-stock-ledger.service';

describe('ProductStockLedgerService', () => {
  let enqueue: jest.Mock;
  let logger: PinoLoggerMock;
  let service: ProductStockLedgerService;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    enqueue = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    service = new ProductStockLedgerService({ enqueue }, 2, logger as unknown as PinoLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('enqueue', () => {
    it('enqueues an addition under the id of its stock row with the correlation id of the request', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        service.enqueue({
          productId: '12',
          productStockId: '700',
          events: [new ProductStockAddedEvent('12', 'SKU-0001', 5)],
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

    it('enqueues nothing without an addition', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        service.enqueue({
          productId: '12',
          productStockId: '700',
          events: [{ aggregateId: '12' } as DomainEvent<string>],
        }),
      );

      expect(enqueue).not.toHaveBeenCalled();
    });

    it('retries a failed enqueue and logs each retry', async () => {
      enqueue.mockRejectedValueOnce(new Error('redis is down')).mockResolvedValue(undefined);

      await CorrelationContextHelper.run('corr-1', () =>
        service.enqueue({
          productId: '12',
          productStockId: '700',
          events: [new ProductStockAddedEvent('12', 'SKU-0001', 5)],
        }),
      );

      expect(enqueue).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledWith(
        {
          err: new Error('redis is down'),
          correlationId: 'corr-1',
          attempt: 1,
          productId: '12',
          operationKey: 'product-restocked:700',
        },
        'Ledger enqueue (product stock) failed — retrying',
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs the record for replay after the configured attempts instead of throwing', async () => {
      enqueue.mockRejectedValue(new Error('redis is down'));

      await CorrelationContextHelper.run('corr-1', () =>
        service.enqueue({
          productId: '12',
          productStockId: '700',
          events: [new ProductStockAddedEvent('12', 'SKU-0001', 5)],
        }),
      );

      expect(enqueue).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalledWith(
        {
          err: new Error('redis is down'),
          correlationId: 'corr-1',
          productId: '12',
          operationKey: 'product-restocked:700',
        },
        'Ledger enqueue failed permanently: the record is absent from the queue and the ledger, replay this record',
      );
      expect(logger.info).not.toHaveBeenCalled();
    });
  });
});
