import { PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { AuthLedgerService } from '../auth-ledger.service';

describe('AuthLedgerService', () => {
  let append: jest.Mock;
  let logger: PinoLoggerMock;
  let service: AuthLedgerService;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    append = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    service = new AuthLedgerService({ append }, logger as unknown as PinoLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordRegistered', () => {
    it('appends the registration under the operation key of the customer', async () => {
      await service.recordRegistered({ customerId: 'customer-1' });

      expect(append).toHaveBeenCalledTimes(1);
      expect(append).toHaveBeenCalledWith({
        operationKey: 'customer-registered:customer-1',
        subjectType: 'customer',
        subjectId: 'customer-1',
        action: 'CustomerRegistered',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
    });

    it('retries a failed append and logs each retry', async () => {
      append.mockRejectedValueOnce(new Error('deadlock')).mockResolvedValue(undefined);

      await CorrelationContextHelper.run('corr-1', () =>
        service.recordRegistered({ customerId: 'customer-1' }),
      );

      expect(append).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledWith(
        {
          err: new Error('deadlock'),
          correlationId: 'corr-1',
          attempt: 1,
          customerId: 'customer-1',
          operationKey: 'customer-registered:customer-1',
        },
        'Ledger append (customer registered) failed — retrying',
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs the record for replay after three failures instead of throwing', async () => {
      append.mockRejectedValue(new Error('deadlock'));

      await CorrelationContextHelper.run('corr-1', () =>
        service.recordRegistered({ customerId: 'customer-1' }),
      );

      expect(append).toHaveBeenCalledTimes(3);
      expect(logger.error).toHaveBeenCalledWith(
        {
          err: new Error('deadlock'),
          correlationId: 'corr-1',
          customerId: 'customer-1',
          operationKey: 'customer-registered:customer-1',
        },
        'Ledger append failed permanently: the customer is registered but absent from the ledger, replay this record',
      );
    });
  });
});
