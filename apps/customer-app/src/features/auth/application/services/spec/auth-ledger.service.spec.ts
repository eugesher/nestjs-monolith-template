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
    it(
      'enqueues the registration with the email under ' +
        'the operation key and correlation id of the request',
      async () => {
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
      },
    );
  });
});
