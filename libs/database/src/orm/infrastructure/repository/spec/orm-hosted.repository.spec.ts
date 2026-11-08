import { EntityManager } from 'typeorm';

import { OrmHostedRepository } from '../orm-hosted.repository';

describe('OrmHostedRepository', () => {
  class Item {
    public id: string;
    public name: string;
  }

  let repository: OrmHostedRepository<Item>;
  let insert: jest.SpyInstance;

  beforeEach(() => {
    repository = new OrmHostedRepository(Item, {} as EntityManager);
    insert = jest.spyOn(repository, 'insert');
  });

  describe('insertOne', () => {
    it('inserts the row and answers its generated id as a string', async () => {
      insert.mockResolvedValue({ identifiers: [{ id: 12 }] });

      const id = await repository.insertOne({ name: 'Lamp' });

      expect(id).toBe('12');
      expect(insert).toHaveBeenCalledWith({ name: 'Lamp' });
    });

    it('keeps an id the driver already answered as a string', async () => {
      insert.mockResolvedValue({
        identifiers: [{ id: '9007199254740993' }],
      });

      const id = await repository.insertOne({ name: 'Lamp' });

      expect(id).toBe('9007199254740993');
    });
  });
});
