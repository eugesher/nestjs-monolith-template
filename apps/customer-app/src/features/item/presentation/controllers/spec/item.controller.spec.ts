import {
  ItemArchiveUseCase,
  ItemCreateUseCase,
  ItemGetManyUseCase,
  ItemGetOneUseCase,
  ItemRenameUseCase,
} from '../../../application';
import { ItemController } from '../item.controller';

describe('ItemController', () => {
  let create: jest.Mock;
  let getMany: jest.Mock;
  let getOne: jest.Mock;
  let rename: jest.Mock;
  let archive: jest.Mock;
  let controller: ItemController;

  beforeEach(() => {
    create = jest.fn();
    getMany = jest.fn();
    getOne = jest.fn();
    rename = jest.fn();
    archive = jest.fn();

    controller = new ItemController(
      { execute: create } as unknown as ItemCreateUseCase,
      { execute: getMany } as unknown as ItemGetManyUseCase,
      { execute: getOne } as unknown as ItemGetOneUseCase,
      { execute: rename } as unknown as ItemRenameUseCase,
      { execute: archive } as unknown as ItemArchiveUseCase,
    );
  });

  describe('handleCreate', () => {
    it('creates the item of the body for the caller under the idempotency key', async () => {
      create.mockResolvedValue({ id: '12', sku: 'SKU-1001' });

      const response = await controller.handleCreate(
        { sku: 'SKU-1001', name: 'Lamp' },
        { id: 'customer-1', email: 'ann@example.com' },
        'key-1',
      );

      expect(response).toEqual({ id: '12', sku: 'SKU-1001' });
      expect(create).toHaveBeenCalledWith({
        sku: 'SKU-1001',
        name: 'Lamp',
        ownerId: 'customer-1',
        idempotencyKey: 'key-1',
      });
    });
  });

  describe('handleGetMany', () => {
    it('lists only the items of the caller', async () => {
      getMany.mockResolvedValue({ items: [], total: 0, page: 2, size: 5 });

      const response = await controller.handleGetMany(
        { page: 2, size: 5 },
        { id: 'customer-1', email: 'ann@example.com' },
      );

      expect(response).toEqual({ items: [], total: 0, page: 2, size: 5 });
      expect(getMany).toHaveBeenCalledWith({ page: 2, size: 5, ownerId: 'customer-1' });
    });
  });

  describe('handleGetOne', () => {
    it('reads the item of the path in the scope of the caller', async () => {
      getOne.mockResolvedValue({ id: '12' });

      const response = await controller.handleGetOne(
        { itemId: '12' },
        { id: 'customer-1', email: 'ann@example.com' },
      );

      expect(response).toEqual({ id: '12' });
      expect(getOne).toHaveBeenCalledWith({ itemId: '12', ownerId: 'customer-1' });
    });
  });

  describe('handleRename', () => {
    it('renames the item of the path as its owner', async () => {
      rename.mockResolvedValue({ id: '12', name: 'Desk lamp' });

      const response = await controller.handleRename(
        { itemId: '12' },
        { name: 'Desk lamp' },
        { id: 'customer-1', email: 'ann@example.com' },
        3,
      );

      expect(response).toEqual({ id: '12', name: 'Desk lamp' });
      expect(rename).toHaveBeenCalledWith({
        itemId: '12',
        name: 'Desk lamp',
        ownerId: 'customer-1',
        expectedVersion: 3,
      });
    });
  });

  describe('handleArchive', () => {
    it('archives the item of the path as its owner', async () => {
      archive.mockResolvedValue({ id: '12', status: 'archived' });

      const response = await controller.handleArchive(
        { itemId: '12' },
        { id: 'customer-1', email: 'ann@example.com' },
        undefined,
      );

      expect(response).toEqual({ id: '12', status: 'archived' });
      expect(archive).toHaveBeenCalledWith({
        itemId: '12',
        ownerId: 'customer-1',
        expectedVersion: undefined,
      });
    });
  });
});
