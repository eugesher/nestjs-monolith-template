import { PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs-observability';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs-observability/testing';

import { OrderLedgerService } from '../order-ledger.service';

describe('OrderLedgerService', () => {
  let enqueue: jest.Mock;
  let logger: PinoLoggerMock;
  let service: OrderLedgerService;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    enqueue = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    service = new OrderLedgerService({ enqueue }, 2, logger as unknown as PinoLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordPlaced', () => {
    it('enqueues the placed order under the operation key and correlation id of the request', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        service.recordPlaced({
          orderId: '610',
          customerId: 'customer-1',
          productIds: ['100', '100'],
        }),
      );

      expect(enqueue).toHaveBeenCalledTimes(1);
      expect(enqueue).toHaveBeenCalledWith({
        operationKey: 'order-placed:610',
        subjectType: 'order',
        subjectId: '610',
        action: 'OrderPlaced',
        payload: { customerId: 'customer-1', productIds: ['100', '100'] },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });
    });
  });
});
