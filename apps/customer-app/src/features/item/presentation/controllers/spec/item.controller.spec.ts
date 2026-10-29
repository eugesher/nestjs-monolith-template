import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
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
        { id: 'user-1', email: 'ann@example.com', roles: [RoleEnum.ADMIN], permissions: [] },
        'key-1',
      );

      expect(response).toEqual({ id: '12', sku: 'SKU-1001' });
      expect(create).toHaveBeenCalledWith({
        sku: 'SKU-1001',
        name: 'Lamp',
        ownerId: 'user-1',
        idempotencyKey: 'key-1',
      });
    });
  });

  describe('handleGetMany', () => {
    it('lists only the items of a caller who is not an admin', async () => {
      getMany.mockResolvedValue({ items: [], total: 0, page: 2, size: 5 });

      const response = await controller.handleGetMany(
        { page: 2, size: 5 },
        {
          id: 'user-1',
          email: 'ann@example.com',
          roles: [RoleEnum.VIEWER],
          permissions: [PermissionCodeEnum.ITEM_READ],
        },
      );

      expect(response).toEqual({ items: [], total: 0, page: 2, size: 5 });
      expect(getMany).toHaveBeenCalledWith({ page: 2, size: 5, ownerId: 'user-1' });
    });

    it('lists the items of every owner for an admin', async () => {
      getMany.mockResolvedValue({ items: [], total: 0, page: 1, size: 20 });

      await controller.handleGetMany(
        {},
        { id: 'user-1', email: 'ann@example.com', roles: [RoleEnum.ADMIN], permissions: [] },
      );

      expect(getMany).toHaveBeenCalledWith({
        page: undefined,
        size: undefined,
        ownerId: undefined,
      });
    });
  });

  describe('handleGetOne', () => {
    it('reads the item of the path in the scope of a caller who is not an admin', async () => {
      getOne.mockResolvedValue({ id: '12' });

      const response = await controller.handleGetOne(
        { itemId: '12' },
        { id: 'user-1', email: 'ann@example.com', roles: [RoleEnum.EDITOR], permissions: [] },
      );

      expect(response).toEqual({ id: '12' });
      expect(getOne).toHaveBeenCalledWith({ itemId: '12', ownerId: 'user-1' });
    });

    it('reads the item of the path without an owner scope for an admin', async () => {
      getOne.mockResolvedValue({ id: '12' });

      await controller.handleGetOne(
        { itemId: '12' },
        { id: 'user-1', email: 'ann@example.com', roles: [RoleEnum.ADMIN], permissions: [] },
      );

      expect(getOne).toHaveBeenCalledWith({ itemId: '12', ownerId: undefined });
    });
  });

  describe('handleRename', () => {
    it('renames the item of the path as its owner, even for an admin', async () => {
      rename.mockResolvedValue({ id: '12', name: 'Desk lamp' });

      const response = await controller.handleRename(
        { itemId: '12' },
        { name: 'Desk lamp' },
        { id: 'user-1', email: 'ann@example.com', roles: [RoleEnum.ADMIN], permissions: [] },
        3,
      );

      expect(response).toEqual({ id: '12', name: 'Desk lamp' });
      expect(rename).toHaveBeenCalledWith({
        itemId: '12',
        name: 'Desk lamp',
        ownerId: 'user-1',
        expectedVersion: 3,
      });
    });
  });

  describe('handleArchive', () => {
    it('archives the item of the path as its owner, even for an admin', async () => {
      archive.mockResolvedValue({ id: '12', status: 'archived' });

      const response = await controller.handleArchive(
        { itemId: '12' },
        { id: 'user-1', email: 'ann@example.com', roles: [RoleEnum.ADMIN], permissions: [] },
        undefined,
      );

      expect(response).toEqual({ id: '12', status: 'archived' });
      expect(archive).toHaveBeenCalledWith({
        itemId: '12',
        ownerId: 'user-1',
        expectedVersion: undefined,
      });
    });
  });
});
