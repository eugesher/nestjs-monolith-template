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
    service = new ProductStockLedgerService({ enqueue }, 2, 500, logger as unknown as PinoLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordEvents', () => {
    it(
      'enqueues an addition under the id of its stock ' +
        'row with the correlation id of the request',
      async () => {
        await CorrelationContextHelper.run('corr-1', () =>
          service.recordEvents({
            productStockId: '700',
            events: [new ProductStockAddedEvent('12', 'SKU-0001', 5)],
          }),
        );

        expect(enqueue).toHaveBeenCalledWith({
          record: {
            operationKey: 'product-restocked:700',
            subjectType: 'product',
            subjectId: '12',
            action: 'ProductRestocked',
            payload: { sku: 'SKU-0001', quantity: 5 },
            occurredAt: '2026-01-05T08:00:00.000Z',
            correlationId: 'corr-1',
          },
          timeoutMs: 500,
        });
      },
    );

    it('enqueues nothing without an addition', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        service.recordEvents({
          productStockId: '700',
          events: [{ aggregateId: '12' } as DomainEvent<string>],
        }),
      );

      expect(enqueue).not.toHaveBeenCalled();
    });
  });
});
