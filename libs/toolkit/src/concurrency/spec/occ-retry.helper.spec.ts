import { OccRetryHelper } from '../occ-retry.helper';

describe('OccRetryHelper', () => {
  describe('run', () => {
    let logger: { info: jest.Mock; warn: jest.Mock };

    beforeEach(() => {
      logger = { info: jest.fn(), warn: jest.fn() };
    });

    it('returns the first successful attempt without logging', async () => {
      const result = await OccRetryHelper.run(() => Promise.resolve('renamed'), {
        subject: 'Item',
        logger,
        maxAttempts: 5,
        isConflict: (error: unknown): error is Error => error instanceof Error,
        retryContext: () => ({}),
        exhaustedContext: () => ({}),
        onExhausted: (): never => {
          throw new Error('EXHAUSTED');
        },
      });

      expect(result).toBe('renamed');
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('retries a lost compare-and-swap and logs each retry at info', async () => {
      const attempt = jest
        .fn()
        .mockRejectedValueOnce(new RangeError('version 1'))
        .mockRejectedValueOnce(new RangeError('version 2'))
        .mockResolvedValue('renamed');

      const result = await OccRetryHelper.run(attempt, {
        subject: 'Item',
        logger,
        maxAttempts: 5,
        isConflict: (error: unknown): error is RangeError => error instanceof RangeError,
        retryContext: (conflict) => ({ conflict: conflict.message }),
        exhaustedContext: () => ({}),
        onExhausted: (): never => {
          throw new Error('EXHAUSTED');
        },
      });

      expect(result).toBe('renamed');
      expect(attempt).toHaveBeenCalledTimes(3);
      expect(logger.info.mock.calls).toEqual([
        [
          { conflict: 'version 1', attempt: 1, maxAttempts: 5 },
          'Item write conflict — retrying with a fresh read',
        ],
        [
          { conflict: 'version 2', attempt: 2, maxAttempts: 5 },
          'Item write conflict — retrying with a fresh read',
        ],
      ]);
    });

    it('never retries an error that is not a conflict', async () => {
      const attempt = jest.fn().mockRejectedValue(new Error('domain refusal'));

      const run = OccRetryHelper.run(attempt, {
        subject: 'Item',
        logger,
        maxAttempts: 5,
        isConflict: (error: unknown): error is RangeError => error instanceof RangeError,
        retryContext: () => ({}),
        exhaustedContext: () => ({}),
        onExhausted: (): never => {
          throw new Error('EXHAUSTED');
        },
      });

      await expect(run).rejects.toThrow('domain refusal');
      expect(attempt).toHaveBeenCalledTimes(1);
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('warns and calls onExhausted once the budget is spent', async () => {
      const attempt = jest.fn().mockRejectedValue(new RangeError('version 9'));
      const onExhausted = jest.fn((): never => {
        throw new Error('EXHAUSTED');
      });

      const run = OccRetryHelper.run(attempt, {
        subject: 'Item',
        logger,
        maxAttempts: 3,
        isConflict: (error: unknown): error is RangeError => error instanceof RangeError,
        retryContext: () => ({}),
        exhaustedContext: (conflict) => ({ conflict: conflict.message }),
        onExhausted,
      });

      await expect(run).rejects.toThrow('EXHAUSTED');
      expect(attempt).toHaveBeenCalledTimes(3);
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.warn.mock.calls).toEqual([
        [
          { conflict: 'version 9', attempts: 3, maxAttempts: 3 },
          'Item write conflict exhausted retry budget',
        ],
      ]);
      expect(onExhausted).toHaveBeenCalledWith(new RangeError('version 9'), 3);
    });

    it('surfaces the conflict at once when the budget is one attempt (the If-Match posture)', async () => {
      const attempt = jest.fn().mockRejectedValue(new RangeError('version 2'));

      const run = OccRetryHelper.run(attempt, {
        subject: 'Item',
        logger,
        maxAttempts: 1,
        isConflict: (error: unknown): error is RangeError => error instanceof RangeError,
        retryContext: () => ({}),
        exhaustedContext: () => ({}),
        onExhausted: (): never => {
          throw new Error('EXHAUSTED');
        },
      });

      await expect(run).rejects.toThrow('EXHAUSTED');
      expect(attempt).toHaveBeenCalledTimes(1);
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('fails loudly when onExhausted returns instead of throwing', async () => {
      const attempt = jest.fn().mockRejectedValue(new RangeError('version 2'));

      const run = OccRetryHelper.run(attempt, {
        subject: 'Item',
        logger,
        maxAttempts: 1,
        isConflict: (error: unknown): error is RangeError => error instanceof RangeError,
        retryContext: () => ({}),
        exhaustedContext: () => ({}),
        onExhausted: jest.fn() as unknown as () => never,
      });

      await expect(run).rejects.toThrow(
        'OccRetryHelper.run: optimistic retry loop exited unexpectedly',
      );
    });
  });
});
