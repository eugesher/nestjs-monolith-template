import {
  ProductArchiveUseCase,
  ProductCreateUseCase,
  ProductGetManyUseCase,
  ProductGetOneUseCase,
  ProductPublishUseCase,
  ProductRestockUseCase,
  ProductUpdateUseCase,
} from '../../../application';
import { ProductController } from '../product.controller';

describe('ProductController', () => {
  let create: jest.Mock;
  let getMany: jest.Mock;
  let getOne: jest.Mock;
  let update: jest.Mock;
  let publish: jest.Mock;
  let archive: jest.Mock;
  let restock: jest.Mock;
  let controller: ProductController;

  beforeEach(() => {
    create = jest.fn();
    getMany = jest.fn();
    getOne = jest.fn();
    update = jest.fn();
    publish = jest.fn();
    archive = jest.fn();
    restock = jest.fn();

    controller = new ProductController(
      { execute: create } as unknown as ProductCreateUseCase,
      { execute: getMany } as unknown as ProductGetManyUseCase,
      { execute: getOne } as unknown as ProductGetOneUseCase,
      { execute: update } as unknown as ProductUpdateUseCase,
      { execute: publish } as unknown as ProductPublishUseCase,
      { execute: archive } as unknown as ProductArchiveUseCase,
      { execute: restock } as unknown as ProductRestockUseCase,
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

  describe('handleUpdate', () => {
    it('updates the product of the path with the fields of the body', async () => {
      update.mockResolvedValue({ id: '12', name: 'Desk lamp' });

      const response = await controller.handleUpdate({ productId: '12' }, { name: 'Desk lamp' }, 3);

      expect(response).toEqual({ id: '12', name: 'Desk lamp' });
      expect(update).toHaveBeenCalledWith({
        productId: '12',
        name: 'Desk lamp',
        expectedVersion: 3,
      });
    });

    it('passes no name for a body without one', async () => {
      update.mockResolvedValue({ id: '12', name: 'Lamp' });

      await controller.handleUpdate({ productId: '12' }, {}, undefined);

      expect(update).toHaveBeenCalledWith({
        productId: '12',
        name: undefined,
        expectedVersion: undefined,
      });
    });
  });

  describe('handlePublish', () => {
    it('publishes the product of the path', async () => {
      publish.mockResolvedValue({ id: '12', status: 'active' });

      const response = await controller.handlePublish({ productId: '12' }, 2);

      expect(response).toEqual({ id: '12', status: 'active' });
      expect(publish).toHaveBeenCalledWith({ productId: '12', expectedVersion: 2 });
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

  describe('handleRestock', () => {
    it('restocks the product of the path by the quantity of the body under the idempotency key', async () => {
      restock.mockResolvedValue({ productId: '12', quantity: 15 });

      const response = await controller.handleRestock(
        { productId: '12' },
        { quantity: 5 },
        'key-1',
      );

      expect(response).toEqual({ productId: '12', quantity: 15 });
      expect(restock).toHaveBeenCalledWith({
        productId: '12',
        quantity: 5,
        idempotencyKey: 'key-1',
      });
    });
  });
});
