import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { EntityManager } from 'typeorm';

import { OrmHostedRepository } from '../../repository/orm-hosted.repository';
import { OrmHostAdapter } from '../orm-host.adapter';

describe('OrmHostAdapter', () => {
  class Item {}

  let tx: EntityManager;
  let adapter: OrmHostAdapter;

  beforeEach(() => {
    tx = { queryRunner: { name: 'runner' } } as unknown as EntityManager;
    adapter = new OrmHostAdapter({
      get tx(): EntityManager {
        return tx;
      },
    } as unknown as TransactionHost<TransactionalAdapterTypeOrm>);
  });

  describe('getRepository', () => {
    it('answers a hosted repository of the entity bound to the current transaction', () => {
      const repository = adapter.getRepository(Item);

      expect(repository).toBeInstanceOf(OrmHostedRepository);
      expect(repository.target).toBe(Item);
      expect(repository.manager).toBe(tx);
      expect(repository.queryRunner).toBe(tx.queryRunner);
    });

    it('reads the current transaction on every call', () => {
      const first = tx;
      const before = adapter.getRepository(Item);
      const second = { queryRunner: { name: 'second' } } as unknown as EntityManager;

      tx = second;

      const after = adapter.getRepository(Item);

      expect(before.manager).toBe(first);
      expect(after.manager).toBe(second);
    });
  });
});
