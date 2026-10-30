import { PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { AuthLedgerService } from '../auth-ledger.service';

describe('AuthLedgerService', () => {
  let enqueue: jest.Mock;
  let logger: PinoLoggerMock;
  let service: AuthLedgerService;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    enqueue = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    service = new AuthLedgerService({ enqueue }, 2, logger as unknown as PinoLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordRegistered', () => {
    it('enqueues the registration with the email under the operation key and correlation id of the request', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        service.recordRegistered({ customerId: 'customer-1', email: 'eve@example.com' }),
      );

      expect(enqueue).toHaveBeenCalledTimes(1);
      expect(enqueue).toHaveBeenCalledWith({
        operationKey: 'customer-registered:customer-1',
        subjectType: 'customer',
        subjectId: 'customer-1',
        action: 'CustomerRegistered',
        payload: { email: 'eve@example.com' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });
      expect(logger.info).toHaveBeenCalledWith(
        { customerId: 'customer-1', operationKey: 'customer-registered:customer-1' },
        'Ledger record enqueued',
      );
    });

    it('retries a failed enqueue and logs each retry', async () => {
      enqueue.mockRejectedValueOnce(new Error('redis is down')).mockResolvedValue(undefined);

      await CorrelationContextHelper.run('corr-1', () =>
        service.recordRegistered({ customerId: 'customer-1', email: 'eve@example.com' }),
      );

      expect(enqueue).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledWith(
        {
          err: new Error('redis is down'),
          correlationId: 'corr-1',
          attempt: 1,
          customerId: 'customer-1',
          operationKey: 'customer-registered:customer-1',
        },
        'Ledger enqueue (customer registered) failed — retrying',
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs the record for replay after the configured attempts instead of throwing', async () => {
      enqueue.mockRejectedValue(new Error('redis is down'));

      await CorrelationContextHelper.run('corr-1', () =>
        service.recordRegistered({ customerId: 'customer-1', email: 'eve@example.com' }),
      );

      expect(enqueue).toHaveBeenCalledTimes(2);
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        {
          err: new Error('redis is down'),
          correlationId: 'corr-1',
          customerId: 'customer-1',
          operationKey: 'customer-registered:customer-1',
        },
        'Ledger enqueue failed permanently: the customer is registered but absent from the queue and the ledger, replay this record',
      );
    });
  });
});
