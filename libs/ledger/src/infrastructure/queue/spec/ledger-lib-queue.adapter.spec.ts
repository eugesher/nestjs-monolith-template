import type { Queue } from 'bull';

import type { ILedgerRecordProcessorPayload } from '@acme-libs/contracts/ledger';

import { LedgerLibQueueAdapter } from '../ledger-lib-queue.adapter';

describe('LedgerLibQueueAdapter', () => {
  let add: jest.Mock;
  let adapter: LedgerLibQueueAdapter;

  beforeEach(() => {
    add = jest.fn().mockResolvedValue({ id: '1' });
    adapter = new LedgerLibQueueAdapter({ add } as unknown as Queue<ILedgerRecordProcessorPayload>);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('add', () => {
    it('adds only the fields of the record as one job', async () => {
      const record = {
        operationKey: 'item-opened:7',
        subjectType: 'item',
        subjectId: '7',
        action: 'ItemOpened',
        payload: { name: 'Lamp' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'c0ffee00-0000-4000-8000-000000000001',
        extra: 'dropped',
      };

      await adapter.add({ record, timeoutMs: 500 });

      expect(add).toHaveBeenCalledTimes(1);
      expect(add).toHaveBeenCalledWith({
        operationKey: 'item-opened:7',
        subjectType: 'item',
        subjectId: '7',
        action: 'ItemOpened',
        payload: { name: 'Lamp' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'c0ffee00-0000-4000-8000-000000000001',
      });
    });

    it('passes a failing add through', async () => {
      add.mockRejectedValue(new Error('redis is down'));

      const adding = adapter.add({
        record: {
          operationKey: 'item-opened:7',
          subjectType: 'item',
          subjectId: '7',
          action: 'ItemOpened',
          payload: {},
          occurredAt: '2026-01-05T08:00:00.000Z',
          correlationId: 'c0ffee00-0000-4000-8000-000000000001',
        },
        timeoutMs: 500,
      });

      await expect(adding).rejects.toThrow('redis is down');
    });

    it('gives up on an add that hangs, as Bull does while Redis is down', async () => {
      jest.useFakeTimers();
      add.mockReturnValue(new Promise(() => undefined));

      const adding = adapter.add({
        record: {
          operationKey: 'item-opened:7',
          subjectType: 'item',
          subjectId: '7',
          action: 'ItemOpened',
          payload: {},
          occurredAt: '2026-01-05T08:00:00.000Z',
          correlationId: 'c0ffee00-0000-4000-8000-000000000001',
        },
        timeoutMs: 500,
      });

      jest.advanceTimersByTime(500);

      await expect(adding).rejects.toThrow('Enqueue timed out after 500 ms');
    });

    it('clears the timer once the add settles', async () => {
      jest.useFakeTimers();

      await adapter.add({
        record: {
          operationKey: 'item-opened:7',
          subjectType: 'item',
          subjectId: '7',
          action: 'ItemOpened',
          payload: {},
          occurredAt: '2026-01-05T08:00:00.000Z',
          correlationId: 'c0ffee00-0000-4000-8000-000000000001',
        },
        timeoutMs: 500,
      });

      expect(jest.getTimerCount()).toBe(0);
    });
  });
});
