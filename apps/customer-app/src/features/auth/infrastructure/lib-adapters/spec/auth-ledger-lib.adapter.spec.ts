import { CorrelationContextHelper } from '@acme-libs/observability';

import { AuthLedgerLibAdapter } from '../auth-ledger-lib.adapter';

describe('AuthLedgerLibAdapter', () => {
  let handleEnqueue: jest.Mock;
  let adapter: AuthLedgerLibAdapter;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    handleEnqueue = jest.fn().mockResolvedValue(undefined);
    adapter = new AuthLedgerLibAdapter({ handleEnqueue });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordRegistered', () => {
    it('enqueues the registration under the operation key and correlation id', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        adapter.recordRegistered({ customerId: 'customer-1', email: 'eve@example.com' }),
      );

      expect(handleEnqueue).toHaveBeenCalledTimes(1);
      expect(handleEnqueue).toHaveBeenCalledWith({
        operationKey: 'customer-registered:customer-1',
        subjectType: 'customer',
        subjectId: 'customer-1',
        action: 'CustomerRegistered',
        payload: { email: 'eve@example.com' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });
    });
  });
});
