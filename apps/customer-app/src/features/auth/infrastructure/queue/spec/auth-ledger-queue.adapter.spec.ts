import { Queue } from 'bull';

import { ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';

import { AuthLedgerQueueAdapter } from '../auth-ledger-queue.adapter';

describe('AuthLedgerQueueAdapter', () => {
  let add: jest.Mock;
  let adapter: AuthLedgerQueueAdapter;

  beforeEach(() => {
    add = jest.fn().mockResolvedValue({ id: '1' });
    adapter = new AuthLedgerQueueAdapter({
      add,
    } as unknown as Queue<ILedgerRecordProcessorPayload>);
  });

  describe('enqueue', () => {
    it('adds the record with its correlation id as one job', async () => {
      await adapter.enqueue({
        record: {
          operationKey: 'customer-registered:customer-1',
          subjectType: 'customer',
          subjectId: 'customer-1',
          action: 'CustomerRegistered',
          payload: { email: 'eve@example.com' },
          occurredAt: '2026-01-05T08:00:00.000Z',
          correlationId: 'corr-1',
        },
        timeoutMs: 500,
      });

      expect(add).toHaveBeenCalledWith({
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
