import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { EntityManager } from 'typeorm';

import { RepositoryHostAdapter } from '../repository-host.adapter';

describe('RepositoryHostAdapter', () => {
  let tx: { getRepository: jest.Mock };
  let adapter: RepositoryHostAdapter;

  beforeEach(() => {
    tx = { getRepository: jest.fn().mockReturnValue({ name: 'repository' }) };
    adapter = new RepositoryHostAdapter({
      get tx(): EntityManager {
        return tx as unknown as EntityManager;
      },
    } as unknown as TransactionHost<TransactionalAdapterTypeOrm>);
  });

  describe('getRepository', () => {
    it('answers the repository of the entity from the current transaction', () => {
      class Item {}

      const repository = adapter.getRepository(Item);

      expect(repository).toEqual({ name: 'repository' });
      expect(tx.getRepository).toHaveBeenCalledWith(Item);
    });

    it('reads the current transaction on every call', () => {
      class Item {}
      const first = { getRepository: jest.fn().mockReturnValue({ name: 'first' }) };
      const second = { getRepository: jest.fn().mockReturnValue({ name: 'second' }) };

      tx = first;
      const before = adapter.getRepository(Item);
      tx = second;
      const after = adapter.getRepository(Item);

      expect(before).toEqual({ name: 'first' });
      expect(after).toEqual({ name: 'second' });
    });
  });
});
