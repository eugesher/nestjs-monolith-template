import { Queue } from 'bull';

import { ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';

import { AuthLedgerRecordQueueAdapter } from '../auth-ledger-record-queue.adapter';

describe('AuthLedgerRecordQueueAdapter', () => {
  let add: jest.Mock;
  let adapter: AuthLedgerRecordQueueAdapter;

  beforeEach(() => {
    add = jest.fn().mockResolvedValue({ id: '1' });
    adapter = new AuthLedgerRecordQueueAdapter(
      { add } as unknown as Queue<ILedgerRecordProcessorPayload>,
      500,
    );
  });

  describe('enqueue', () => {
    it('adds the record with its correlation id as one job', async () => {
      await adapter.enqueue({
        operationKey: 'customer-registered:customer-1',
        subjectType: 'customer',
        subjectId: 'customer-1',
        action: 'CustomerRegistered',
        payload: { email: 'eve@example.com' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
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
