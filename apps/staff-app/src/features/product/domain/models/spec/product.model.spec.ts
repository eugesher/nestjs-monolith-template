import { ProductStatusEnum } from '@acme-libs/kernel';
import { ProductArchivedEvent } from '../../events/product-archived.event';
import { ProductCreatedEvent } from '../../events/product-created.event';
import { ProductRenamedEvent } from '../../events/product-renamed.event';
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

  describe('rename', () => {
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

    it('renames, bumps the version and records the previous name', () => {
      product.rename('  Desk lamp ');

      const events = product.pullDomainEvents();

      expect(product.name).toBe('Desk lamp');
      expect(product.version).toBe(4);
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ProductRenamedEvent);
      expect(events[0]).toMatchObject({
        aggregateId: '12',
        name: 'Desk lamp',
        previousName: 'Lamp',
      });
    });

    it('changes nothing when the trimmed name is the current one', () => {
      product.rename(' Lamp ');

      expect(product.version).toBe(3);
      expect(product.pullDomainEvents()).toEqual([]);
    });

    it('refuses a blank name with PRODUCT_NAME_INVALID', () => {
      expect(() => product.rename(' ')).toThrow(
        expect.objectContaining({ code: 'PRODUCT_NAME_INVALID' }) as Error,
      );
    });
  });

  describe('activate', () => {
    it('activates a draft and bumps the version without recording anything', () => {
      const product = ProductModel.create({ sku: 'SKU-0001', name: 'Lamp' });

      product.pullDomainEvents();
      product.activate();

      expect(product.status).toBe('active');
      expect(product.version).toBe(2);
      expect(product.pullDomainEvents()).toEqual([]);
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

      product.activate();

      expect(product.status).toBe('active');
      expect(product.version).toBe(3);
    });
  });

  describe('archive', () => {
    it('archives, bumps the version and records the previous status', () => {
      const product = ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      product.archive();

      const events = product.pullDomainEvents();

      expect(product.status).toBe('archived');
      expect(product.version).toBe(4);
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ProductArchivedEvent);
      expect(events[0]).toMatchObject({
        aggregateId: '12',
        sku: 'SKU-0001',
        previousStatus: 'active',
      });
    });

    it.each([
      ['rename', (product: ProductModel) => product.rename('Desk')],
      ['activate', (product: ProductModel) => product.activate()],
      ['archive', (product: ProductModel) => product.archive()],
    ])('refuses to %s an archived product with PRODUCT_ALREADY_ARCHIVED', (_, change) => {
      const product = ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ARCHIVED,
        version: 5,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      expect(() => change(product)).toThrow(
        expect.objectContaining({
          code: 'PRODUCT_ALREADY_ARCHIVED',
          message: 'Product 12 is archived and can no longer be modified',
        }) as Error,
      );
    });
  });
});
