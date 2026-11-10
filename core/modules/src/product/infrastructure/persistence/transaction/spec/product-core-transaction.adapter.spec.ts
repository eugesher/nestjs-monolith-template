import { ProductCoreTransactionAdapter } from '../product-core-transaction.adapter';

describe('ProductCoreTransactionAdapter', () => {
  let run: jest.Mock;
  let afterCommit: jest.Mock;
  let adapter: ProductCoreTransactionAdapter;

  beforeEach(() => {
    run = jest.fn((work: () => Promise<unknown>) => work());
    afterCommit = jest.fn();
    adapter = new ProductCoreTransactionAdapter({ run, afterCommit });
  });

  describe('run', () => {
    it('runs the work in a transaction of the local storage lib and answers its result', async () => {
      const work = jest.fn().mockResolvedValue('result');

      const result = await adapter.run(work);

      expect(result).toBe('result');
      expect(run).toHaveBeenCalledWith(work);
    });
  });

  describe('afterCommit', () => {
    it('queues the hook on the transaction of the local storage lib', () => {
      const hook = jest.fn();

      adapter.afterCommit(hook);

      expect(afterCommit).toHaveBeenCalledWith(hook);
    });
  });
});
