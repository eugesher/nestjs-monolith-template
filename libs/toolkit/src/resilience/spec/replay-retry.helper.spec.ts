import { ReplayRetryHelper } from '../replay-retry.helper';

describe('ReplayRetryHelper', () => {
  describe('retryThenLogForReplay', () => {
    let logger: { warn: jest.Mock; error: jest.Mock };

    beforeEach(() => {
      logger = { warn: jest.fn(), error: jest.fn() };
    });

    it('returns on the first success without logging', async () => {
      const operation = jest.fn().mockResolvedValue(undefined);

      await ReplayRetryHelper.retryThenLogForReplay(operation, {
        maxAttempts: 3,
        logger,
        correlationId: 'c0ffee00-0000-4000-8000-000000000001',
        label: 'Ledger append',
        context: { itemId: 7 },
        replayMessage: 'Ledger append failed permanently — replay from this record',
      });

      expect(operation).toHaveBeenCalledTimes(1);
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('retries and succeeds, warning once per failed attempt', async () => {
      const failure = new Error('ledger down');
      const operation = jest
        .fn()
        .mockRejectedValueOnce(failure)
        .mockRejectedValueOnce(failure)
        .mockResolvedValue(undefined);

      await ReplayRetryHelper.retryThenLogForReplay(operation, {
        maxAttempts: 3,
        logger,
        correlationId: 'c0ffee00-0000-4000-8000-000000000001',
        label: 'Ledger append',
        context: { itemId: 7 },
        replayMessage: 'Ledger append failed permanently — replay from this record',
      });

      expect(operation).toHaveBeenCalledTimes(3);
      expect(logger.warn.mock.calls).toEqual([
        [
          {
            err: failure,
            correlationId: 'c0ffee00-0000-4000-8000-000000000001',
            attempt: 1,
            itemId: 7,
          },
          'Ledger append failed — retrying',
        ],
        [
          {
            err: failure,
            correlationId: 'c0ffee00-0000-4000-8000-000000000001',
            attempt: 2,
            itemId: 7,
          },
          'Ledger append failed — retrying',
        ],
      ]);
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs a poison record at error and does not throw — the local write already committed', async () => {
      const failure = new Error('ledger down');
      const operation = jest.fn().mockRejectedValue(failure);

      const run = ReplayRetryHelper.retryThenLogForReplay(operation, {
        maxAttempts: 2,
        logger,
        correlationId: 'c0ffee00-0000-4000-8000-000000000001',
        label: 'Ledger append',
        context: { itemId: 7 },
        replayMessage: 'Ledger append failed permanently — replay from this record',
      });

      await expect(run).resolves.toBeUndefined();
      expect(operation).toHaveBeenCalledTimes(2);
      expect(logger.error.mock.calls).toEqual([
        [
          { err: failure, correlationId: 'c0ffee00-0000-4000-8000-000000000001', itemId: 7 },
          'Ledger append failed permanently — replay from this record',
        ],
      ]);
    });
  });
});
