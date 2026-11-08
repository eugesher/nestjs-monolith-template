import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { EntityManager, Repository } from 'typeorm';

import { OrmHostAdapter } from '../orm-host.adapter';

describe('OrmHostAdapter', () => {
  class Item {}

  let getRepository: jest.Mock;
  let tx: EntityManager;
  let adapter: OrmHostAdapter;

  beforeEach(() => {
    getRepository = jest.fn();
    tx = { getRepository } as unknown as EntityManager;
    adapter = new OrmHostAdapter({
      get tx(): EntityManager {
        return tx;
      },
    } as unknown as TransactionHost<TransactionalAdapterTypeOrm>);
  });

  describe('getRepository', () => {
    it('answers the repository of the entity from the current transaction', () => {
      const repository = { target: Item } as unknown as Repository<Item>;
      getRepository.mockReturnValue(repository);

      const result = adapter.getRepository(Item);

      expect(result).toBe(repository);
      expect(getRepository).toHaveBeenCalledWith(Item);
    });

    it('reads the current transaction on every call', () => {
      const getSecondRepository = jest.fn();

      adapter.getRepository(Item);
      tx = { getRepository: getSecondRepository } as unknown as EntityManager;
      adapter.getRepository(Item);

      expect(getRepository).toHaveBeenCalledTimes(1);
      expect(getSecondRepository).toHaveBeenCalledTimes(1);
    });
  });
});
