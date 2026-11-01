import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { EntityManager } from 'typeorm';

import { RepositoryHost } from '../repository.host';

describe('RepositoryHost', () => {
  let tx: { getRepository: jest.Mock };
  let host: RepositoryHost;

  beforeEach(() => {
    tx = { getRepository: jest.fn().mockReturnValue({ name: 'repository' }) };
    host = new RepositoryHost({
      get tx(): EntityManager {
        return tx as unknown as EntityManager;
      },
    } as unknown as TransactionHost<TransactionalAdapterTypeOrm>);
  });

  describe('getRepository', () => {
    it('answers the repository of the entity from the current transaction', () => {
      class Item {}

      const repository = host.getRepository(Item);

      expect(repository).toEqual({ name: 'repository' });
      expect(tx.getRepository).toHaveBeenCalledWith(Item);
    });

    it('reads the current transaction on every call', () => {
      class Item {}
      const first = { getRepository: jest.fn().mockReturnValue({ name: 'first' }) };
      const second = { getRepository: jest.fn().mockReturnValue({ name: 'second' }) };

      tx = first;
      const before = host.getRepository(Item);
      tx = second;
      const after = host.getRepository(Item);

      expect(before).toEqual({ name: 'first' });
      expect(after).toEqual({ name: 'second' });
    });
  });
});
