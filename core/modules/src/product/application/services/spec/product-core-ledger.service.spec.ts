import { PinoLogger } from 'nestjs-pino';

import { ProductStatusEnum } from '@acme-libs-kernel';
import { CorrelationContextHelper } from '@acme-libs-observability';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs-observability/testing';

import { ProductCoreLedgerService } from '../product-core-ledger.service';

describe('ProductCoreLedgerService', () => {
  let enqueue: jest.Mock;
  let logger: PinoLoggerMock;
  let service: ProductCoreLedgerService;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    enqueue = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    service = new ProductCoreLedgerService({ enqueue }, 2, logger as unknown as PinoLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordArchived', () => {
    it('enqueues the archive under the product and the version it produced with the correlation id of the request', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        service.recordArchived({
          productId: '12',
          sku: 'SKU-0001',
          version: 4,
          previousStatus: ProductStatusEnum.ACTIVE,
        }),
      );

      expect(enqueue).toHaveBeenCalledTimes(1);
      expect(enqueue).toHaveBeenCalledWith({
        operationKey: 'product-archived:12:4',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { sku: 'SKU-0001', previousStatus: 'active' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });
    });
  });
});
