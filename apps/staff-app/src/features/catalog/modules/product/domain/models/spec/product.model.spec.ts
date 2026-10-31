import { ProductStatusEnum } from '@acme-libs/kernel';
import { ProductCreatedEvent } from '../../events/product-created.event';
import { ProductPublishedEvent } from '../../events/product-published.event';
import { ProductUpdatedEvent } from '../../events/product-updated.event';
import { ProductRestockedEvent } from '../../events/product-restocked.event';
import { ProductModel } from '../product.model';

describe('ProductModel', () => {
  describe('create', () => {
    it('opens a draft at version 1 with a trimmed name and records the creation', () => {
      const product = ProductModel.create({ sku: 'SKU-0001', name: '  Lamp  ' });
      const events = product.pullDomainEvents();

      expect(product.id).toBeUndefined();
      expect(product.sku).toBe('SKU-0001');
      expect(product.name).toBe('Lamp');
      expect(product.status).toBe('draft');
      expect(product.version).toBe(1);
      expect(product.createdAt).toBeUndefined();
      expect(product.updatedAt).toBeUndefined();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ProductCreatedEvent);
      expect(events[0]).toMatchObject({
        aggregateId: undefined,
        sku: 'SKU-0001',
        name: 'Lamp',
      });
    });

    it.each([
      ['a lowercase sku', 'sku-0001'],
      ['a sku shorter than 3', 'AB'],
      ['a sku starting with a dash', '-ABC'],
      ['a sku longer than 64', `A${'B'.repeat(64)}`],
    ])('refuses %s with PRODUCT_SKU_INVALID', (_, sku) => {
      expect(() => ProductModel.create({ sku, name: 'Lamp' })).toThrow(
        expect.objectContaining({ code: 'PRODUCT_SKU_INVALID' }) as Error,
      );
    });

    it.each([
      ['a blank name', '   '],
      ['a name longer than 255', 'n'.repeat(256)],
    ])('refuses %s with PRODUCT_NAME_INVALID', (_, name) => {
      expect(() => ProductModel.create({ sku: 'SKU-0001', name })).toThrow(
        expect.objectContaining({
          code: 'PRODUCT_NAME_INVALID',
          message: 'Product.name must be a non-empty string of at most 255 characters',
        }) as Error,
      );
    });

    it('accepts a name of 255 characters', () => {
      const product = ProductModel.create({ sku: 'SKU-0001', name: 'n'.repeat(255) });

      expect(product.name).toHaveLength(255);
    });
  });

  describe('reconstitute', () => {
    it('restores a stored product without recording anything', () => {
      const product = ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });

      expect(product.id).toBe('12');
      expect(product.status).toBe('active');
      expect(product.version).toBe(3);
      expect(product.createdAt).toEqual(new Date('2026-01-01T00:00:00.000Z'));
      expect(product.updatedAt).toEqual(new Date('2026-01-02T00:00:00.000Z'));
      expect(product.pullDomainEvents()).toEqual([]);
    });

    it.each([
      ['zero', 0],
      ['a fraction', 1.5],
    ])('refuses a version of %s with PRODUCT_VERSION_INVALID', (_, version) => {
      expect(() =>
        ProductModel.reconstitute({
          id: '12',
          sku: 'SKU-0001',
          name: 'Lamp',
          status: ProductStatusEnum.ACTIVE,
          version,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      ).toThrow(
        expect.objectContaining({
          code: 'PRODUCT_VERSION_INVALID',
          message: `Product.version must be a positive integer, got ${version}`,
        }) as Error,
      );
    });

    it('refuses a stored sku that breaks the pattern', () => {
      expect(() =>
        ProductModel.reconstitute({
          id: '12',
          sku: 'bad',
          name: 'Lamp',
          status: ProductStatusEnum.ACTIVE,
          version: 1,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      ).toThrow(
        expect.objectContaining({
          code: 'PRODUCT_SKU_INVALID',
          message: 'Product.sku must match /^[A-Z0-9][A-Z0-9-]{2,63}$/, got bad',
        }) as Error,
      );
    });
  });

  describe('update', () => {
    let product: ProductModel;

    beforeEach(() => {
      product = ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });
    });

    it('renames, bumps the version and records the change with the previous name', () => {
      product.update({ name: '  Desk lamp ' });

      const events = product.pullDomainEvents();

      expect(product.name).toBe('Desk lamp');
      expect(product.version).toBe(4);
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ProductUpdatedEvent);
      expect(events[0]).toMatchObject({
        aggregateId: '12',
        changes: { name: 'Desk lamp' },
        previous: { name: 'Lamp' },
      });
    });

    it('changes nothing without a name', () => {
      product.update({ name: undefined });

      expect(product.name).toBe('Lamp');
      expect(product.version).toBe(3);
      expect(product.pullDomainEvents()).toEqual([]);
    });

    it('changes nothing when the trimmed name is the current one', () => {
      product.update({ name: ' Lamp ' });

      expect(product.version).toBe(3);
      expect(product.pullDomainEvents()).toEqual([]);
    });

    it('refuses a blank name with PRODUCT_NAME_INVALID', () => {
      expect(() => product.update({ name: ' ' })).toThrow(
        expect.objectContaining({ code: 'PRODUCT_NAME_INVALID' }) as Error,
      );
    });
  });

  describe('publish', () => {
    it('publishes a draft, bumps the version and records the publication', () => {
      const product = ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.DRAFT,
        version: 1,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      product.publish();

      const events = product.pullDomainEvents();

      expect(product.status).toBe('active');
      expect(product.version).toBe(2);
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ProductPublishedEvent);
      expect(events[0]).toMatchObject({
        aggregateId: '12',
        sku: 'SKU-0001',
        version: 2,
        previousStatus: 'draft',
      });
    });

    it('changes nothing on an active product', () => {
      const product = ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      product.publish();

      expect(product.status).toBe('active');
      expect(product.version).toBe(3);
      expect(product.pullDomainEvents()).toEqual([]);
    });
  });

  describe('a change of an archived product', () => {
    it.each([
      ['update', (product: ProductModel) => product.update({ name: 'Desk' }), 'archived', 6],
      ['publish', (product: ProductModel) => product.publish(), 'active', 6],
      ['restock', (product: ProductModel) => product.restock(5), 'archived', 5],
    ])('is allowed: %s', (_, change, status, version) => {
      const product = ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ARCHIVED,
        version: 5,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      change(product);

      expect(product.status).toBe(status);
      expect(product.version).toBe(version);
      expect(product.pullDomainEvents()).toHaveLength(1);
    });
  });

  describe('restock', () => {
    it.each([
      ['a draft', ProductStatusEnum.DRAFT],
      ['an active product', ProductStatusEnum.ACTIVE],
    ])('records the restock of %s and keeps its version', (_, status) => {
      const product = ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      product.restock(5);

      const events = product.pullDomainEvents();

      expect(product.status).toBe(status);
      expect(product.version).toBe(3);
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ProductRestockedEvent);
      expect(events[0]).toMatchObject({ aggregateId: '12', sku: 'SKU-0001', quantity: 5 });
    });

    it.each([
      ['zero', 0],
      ['a negative quantity', -1],
      ['a fraction', 2.5],
      ['more than 100000', 100_001],
    ])('refuses %s with PRODUCT_QUANTITY_INVALID', (_, quantity) => {
      const product = ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      expect(() => product.restock(quantity)).toThrow(
        expect.objectContaining({
          code: 'PRODUCT_QUANTITY_INVALID',
          message: `Product restock quantity must be an integer from 1 to 100000, got ${quantity}`,
        }) as Error,
      );
    });
  });
});
