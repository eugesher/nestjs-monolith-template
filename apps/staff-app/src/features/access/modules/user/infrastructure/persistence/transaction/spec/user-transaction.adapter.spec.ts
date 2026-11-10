import { UserTransactionAdapter } from '../user-transaction.adapter';

describe('UserTransactionAdapter', () => {
  let run: jest.Mock;
  let adapter: UserTransactionAdapter;

  beforeEach(() => {
    run = jest.fn((work: () => Promise<unknown>) => work());
    adapter = new UserTransactionAdapter({ run, afterCommit: jest.fn() });
  });

  describe('run', () => {
    it('runs the work in a transaction of the local storage lib and answers its result', async () => {
      const work = jest.fn().mockResolvedValue('result');

      const result = await adapter.run(work);

      expect(result).toBe('result');
      expect(run).toHaveBeenCalledWith(work);
    });
  });
});
