import type { TransactionHost } from '@nestjs-cls/transactional';
import type { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { LocalStorageTransactionalHostAdapter } from '../local-storage-transactional-host.adapter';

describe('LocalStorageTransactionalHostAdapter', () => {
  let isTransactionActive: jest.Mock;
  let withTransaction: jest.Mock;
  let adapter: LocalStorageTransactionalHostAdapter;

  beforeEach(() => {
    isTransactionActive = jest.fn().mockReturnValue(true);
    withTransaction = jest.fn((work: () => Promise<unknown>) => work());
    adapter = new LocalStorageTransactionalHostAdapter({
      isTransactionActive,
      withTransaction,
    } as unknown as TransactionHost<TransactionalAdapterTypeOrm>);
  });

  it('answers whether a transaction is open', () => {
    expect(adapter.isActive()).toBe(true);
  });

  it('runs the work in a transaction and returns its result', async () => {
    const result = await adapter.withTransaction(() => Promise.resolve('done'));

    expect(result).toBe('done');
    expect(withTransaction).toHaveBeenCalledTimes(1);
  });
});
