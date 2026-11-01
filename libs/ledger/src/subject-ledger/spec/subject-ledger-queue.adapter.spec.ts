import { ISubjectLedgerQueue } from '../subject-ledger-queue.interface';
import { SubjectLedgerQueueAdapter } from '../subject-ledger-queue.adapter';

describe('SubjectLedgerQueueAdapter', () => {
  class ItemLedgerQueueAdapter extends SubjectLedgerQueueAdapter {
    constructor(
      protected readonly queue: ISubjectLedgerQueue,
      protected readonly timeoutMs: number,
    ) {
      super();
    }
  }

  let add: jest.Mock;
  let adapter: ItemLedgerQueueAdapter;

  beforeEach(() => {
    add = jest.fn().mockResolvedValue({ id: '1' });
    adapter = new ItemLedgerQueueAdapter({ add }, 500);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('enqueue', () => {
    it('adds only the fields of the record as one job', async () => {
      const record = {
        operationKey: 'item-opened:7',
        subjectType: 'item',
        subjectId: '7',
        action: 'ItemOpened',
        payload: { name: 'Lamp' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
        extra: 'dropped',
      };

      await adapter.enqueue(record);

      expect(add).toHaveBeenCalledTimes(1);
      expect(add).toHaveBeenCalledWith({
        operationKey: 'item-opened:7',
        subjectType: 'item',
        subjectId: '7',
        action: 'ItemOpened',
        payload: { name: 'Lamp' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });
    });

    it('passes a failing add through', async () => {
      add.mockRejectedValue(new Error('redis is down'));

      const enqueueing = adapter.enqueue({
        operationKey: 'item-opened:7',
        subjectType: 'item',
        subjectId: '7',
        action: 'ItemOpened',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      await expect(enqueueing).rejects.toThrow('redis is down');
    });

    it('gives up on an add that hangs, as Bull does while Redis is down', async () => {
      jest.useFakeTimers();
      add.mockReturnValue(new Promise(() => undefined));

      const enqueueing = adapter.enqueue({
        operationKey: 'item-opened:7',
        subjectType: 'item',
        subjectId: '7',
        action: 'ItemOpened',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      jest.advanceTimersByTime(500);

      await expect(enqueueing).rejects.toThrow('Enqueue timed out after 500 ms');
    });

    it('clears the timer once the add settles', async () => {
      jest.useFakeTimers();

      await adapter.enqueue({
        operationKey: 'item-opened:7',
        subjectType: 'item',
        subjectId: '7',
        action: 'ItemOpened',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      expect(jest.getTimerCount()).toBe(0);
    });
  });
});
