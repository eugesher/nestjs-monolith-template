import { RoleTransactionAdapter } from '../role-transaction.adapter';

describe('RoleTransactionAdapter', () => {
  let run: jest.Mock;
  let adapter: RoleTransactionAdapter;

  beforeEach(() => {
    run = jest.fn((work: () => Promise<unknown>) => work());
    adapter = new RoleTransactionAdapter({ run, afterCommit: jest.fn() });
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
