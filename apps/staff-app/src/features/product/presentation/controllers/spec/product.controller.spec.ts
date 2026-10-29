import {
  ProductArchiveUseCase,
  ProductCreateUseCase,
  ProductGetManyUseCase,
  ProductGetOneUseCase,
  ProductRenameUseCase,
} from '../../../application';
import { ProductController } from '../product.controller';

describe('ProductController', () => {
  let create: jest.Mock;
  let getMany: jest.Mock;
  let getOne: jest.Mock;
  let rename: jest.Mock;
  let archive: jest.Mock;
  let controller: ProductController;

  beforeEach(() => {
    create = jest.fn();
    getMany = jest.fn();
    getOne = jest.fn();
    rename = jest.fn();
    archive = jest.fn();

    controller = new ProductController(
      { execute: create } as unknown as ProductCreateUseCase,
      { execute: getMany } as unknown as ProductGetManyUseCase,
      { execute: getOne } as unknown as ProductGetOneUseCase,
      { execute: rename } as unknown as ProductRenameUseCase,
      { execute: archive } as unknown as ProductArchiveUseCase,
    );
  });

  describe('handleCreate', () => {
    it('creates the product of the body under the idempotency key', async () => {
      create.mockResolvedValue({ id: '12', sku: 'SKU-1001' });

      const response = await controller.handleCreate({ sku: 'SKU-1001', name: 'Lamp' }, 'key-1');

      expect(response).toEqual({ id: '12', sku: 'SKU-1001' });
      expect(create).toHaveBeenCalledWith({
        sku: 'SKU-1001',
        name: 'Lamp',
        idempotencyKey: 'key-1',
      });
    });
  });

  describe('handleGetMany', () => {
    it('lists the products of the page window', async () => {
      getMany.mockResolvedValue({ items: [], total: 0, page: 2, size: 5 });

      const response = await controller.handleGetMany({ page: 2, size: 5 });

      expect(response).toEqual({ items: [], total: 0, page: 2, size: 5 });
      expect(getMany).toHaveBeenCalledWith({ page: 2, size: 5 });
    });
  });

  describe('handleGetOne', () => {
    it('reads the product of the path', async () => {
      getOne.mockResolvedValue({ id: '12' });

      const response = await controller.handleGetOne({ productId: '12' });

      expect(response).toEqual({ id: '12' });
      expect(getOne).toHaveBeenCalledWith({ productId: '12' });
    });
  });

  describe('handleRename', () => {
    it('renames the product of the path', async () => {
      rename.mockResolvedValue({ id: '12', name: 'Desk lamp' });

      const response = await controller.handleRename({ productId: '12' }, { name: 'Desk lamp' }, 3);

      expect(response).toEqual({ id: '12', name: 'Desk lamp' });
      expect(rename).toHaveBeenCalledWith({
        productId: '12',
        name: 'Desk lamp',
        expectedVersion: 3,
      });
    });
  });

  describe('handleArchive', () => {
    it('archives the product of the path', async () => {
      archive.mockResolvedValue({ id: '12', status: 'archived' });

      const response = await controller.handleArchive({ productId: '12' }, undefined);

      expect(response).toEqual({ id: '12', status: 'archived' });
      expect(archive).toHaveBeenCalledWith({
        productId: '12',
        expectedVersion: undefined,
      });
    });
  });
});
