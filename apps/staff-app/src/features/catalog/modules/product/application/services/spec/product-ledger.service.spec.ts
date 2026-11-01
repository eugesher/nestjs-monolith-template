import { PinoLogger } from 'nestjs-pino';

import { ProductStatusEnum } from '@acme-libs-kernel';
import { CorrelationContextHelper } from '@acme-libs-observability';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs-observability/testing';

import { ProductCreatedEvent, ProductPublishedEvent, ProductUpdatedEvent } from '../../../domain';
import { ProductLedgerService } from '../product-ledger.service';

describe('ProductLedgerService', () => {
  let enqueue: jest.Mock;
  let logger: PinoLoggerMock;
  let service: ProductLedgerService;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    enqueue = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    service = new ProductLedgerService({ enqueue }, 2, logger as unknown as PinoLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordEvents', () => {
    it('enqueues a creation under the stored id with the correlation id of the request', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        service.recordEvents({
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
    });

    it('leaves an update out of the ledger', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        service.recordEvents({
          productId: '12',
          events: [new ProductUpdatedEvent('12', { name: 'Desk lamp' }, { name: 'Lamp' })],
        }),
      );

      expect(enqueue).not.toHaveBeenCalled();
    });

    it('enqueues a publication under the product and the version it produced', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        service.recordEvents({
          productId: '12',
          events: [new ProductPublishedEvent('12', 'SKU-0001', 6, ProductStatusEnum.ARCHIVED)],
        }),
      );

      expect(enqueue).toHaveBeenCalledWith({
        operationKey: 'product-published:12:6',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductPublished',
        payload: { sku: 'SKU-0001', previousStatus: 'archived' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });
    });
  });
});
