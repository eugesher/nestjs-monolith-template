import { ItemStatusEnum } from '@acme-libs/kernel';
import { ItemArchivedEvent } from '../../events/item-archived.event';
import { ItemCreatedEvent } from '../../events/item-created.event';
import { ItemRenamedEvent } from '../../events/item-renamed.event';
import { ItemModel } from '../item.model';

describe('ItemModel', () => {
  describe('create', () => {
    it('opens a draft at version 1 with a trimmed name and records the creation', () => {
      const item = ItemModel.create({ sku: 'SKU-0001', name: '  Lamp  ', ownerId: 'owner-1' });
      const events = item.pullDomainEvents();

      expect(item.id).toBeUndefined();
      expect(item.sku).toBe('SKU-0001');
      expect(item.name).toBe('Lamp');
      expect(item.ownerId).toBe('owner-1');
      expect(item.status).toBe('draft');
      expect(item.version).toBe(1);
      expect(item.createdAt).toBeUndefined();
      expect(item.updatedAt).toBeUndefined();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ItemCreatedEvent);
      expect(events[0]).toMatchObject({
        aggregateId: undefined,
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
      });
    });

    it.each([
      ['a lowercase sku', 'sku-0001'],
      ['a sku shorter than 3', 'AB'],
      ['a sku starting with a dash', '-ABC'],
      ['a sku longer than 64', `A${'B'.repeat(64)}`],
    ])('refuses %s with ITEM_SKU_INVALID', (_, sku) => {
      expect(() => ItemModel.create({ sku, name: 'Lamp', ownerId: 'owner-1' })).toThrow(
        expect.objectContaining({ code: 'ITEM_SKU_INVALID' }) as Error,
      );
    });

    it.each([
      ['a blank name', '   '],
      ['a name longer than 255', 'n'.repeat(256)],
    ])('refuses %s with ITEM_NAME_INVALID', (_, name) => {
      expect(() => ItemModel.create({ sku: 'SKU-0001', name, ownerId: 'owner-1' })).toThrow(
        expect.objectContaining({
          code: 'ITEM_NAME_INVALID',
          message: 'Item.name must be a non-empty string of at most 255 characters',
        }) as Error,
      );
    });

    it('accepts a name of 255 characters', () => {
      const item = ItemModel.create({ sku: 'SKU-0001', name: 'n'.repeat(255), ownerId: 'owner-1' });

      expect(item.name).toHaveLength(255);
    });
  });

  describe('reconstitute', () => {
    it('restores a stored item without recording anything', () => {
      const item = ItemModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        status: ItemStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });

      expect(item.id).toBe('12');
      expect(item.status).toBe('active');
      expect(item.version).toBe(3);
      expect(item.createdAt).toEqual(new Date('2026-01-01T00:00:00.000Z'));
      expect(item.updatedAt).toEqual(new Date('2026-01-02T00:00:00.000Z'));
      expect(item.pullDomainEvents()).toEqual([]);
    });

    it.each([
      ['zero', 0],
      ['a fraction', 1.5],
    ])('refuses a version of %s with ITEM_VERSION_INVALID', (_, version) => {
      expect(() =>
        ItemModel.reconstitute({
          id: '12',
          sku: 'SKU-0001',
          name: 'Lamp',
          ownerId: 'owner-1',
          status: ItemStatusEnum.ACTIVE,
          version,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      ).toThrow(
        expect.objectContaining({
          code: 'ITEM_VERSION_INVALID',
          message: `Item.version must be a positive integer, got ${version}`,
        }) as Error,
      );
    });

    it('refuses a stored sku that breaks the pattern', () => {
      expect(() =>
        ItemModel.reconstitute({
          id: '12',
          sku: 'bad',
          name: 'Lamp',
          ownerId: 'owner-1',
          status: ItemStatusEnum.ACTIVE,
          version: 1,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      ).toThrow(
        expect.objectContaining({
          code: 'ITEM_SKU_INVALID',
          message: 'Item.sku must match /^[A-Z0-9][A-Z0-9-]{2,63}$/, got bad',
        }) as Error,
      );
    });
  });

  describe('rename', () => {
    let item: ItemModel;

    beforeEach(() => {
      item = ItemModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        status: ItemStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });
    });

    it('renames, bumps the version and records the previous name', () => {
      item.rename('  Desk lamp ');

      const events = item.pullDomainEvents();

      expect(item.name).toBe('Desk lamp');
      expect(item.version).toBe(4);
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ItemRenamedEvent);
      expect(events[0]).toMatchObject({
        aggregateId: '12',
        name: 'Desk lamp',
        previousName: 'Lamp',
      });
    });

    it('changes nothing when the trimmed name is the current one', () => {
      item.rename(' Lamp ');

      expect(item.version).toBe(3);
      expect(item.pullDomainEvents()).toEqual([]);
    });

    it('refuses a blank name with ITEM_NAME_INVALID', () => {
      expect(() => item.rename(' ')).toThrow(
        expect.objectContaining({ code: 'ITEM_NAME_INVALID' }) as Error,
      );
    });
  });

  describe('activate', () => {
    it('activates a draft and bumps the version without recording anything', () => {
      const item = ItemModel.create({ sku: 'SKU-0001', name: 'Lamp', ownerId: 'owner-1' });

      item.pullDomainEvents();
      item.activate();

      expect(item.status).toBe('active');
      expect(item.version).toBe(2);
      expect(item.pullDomainEvents()).toEqual([]);
    });

    it('changes nothing on an active item', () => {
      const item = ItemModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        status: ItemStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      item.activate();

      expect(item.status).toBe('active');
      expect(item.version).toBe(3);
    });
  });

  describe('archive', () => {
    it('archives, bumps the version and records the previous status', () => {
      const item = ItemModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        status: ItemStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      item.archive();

      const events = item.pullDomainEvents();

      expect(item.status).toBe('archived');
      expect(item.version).toBe(4);
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ItemArchivedEvent);
      expect(events[0]).toMatchObject({ aggregateId: '12', previousStatus: 'active' });
    });

    it.each([
      ['rename', (item: ItemModel) => item.rename('Desk')],
      ['activate', (item: ItemModel) => item.activate()],
      ['archive', (item: ItemModel) => item.archive()],
    ])('refuses to %s an archived item with ITEM_ALREADY_ARCHIVED', (_, change) => {
      const item = ItemModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        status: ItemStatusEnum.ARCHIVED,
        version: 5,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      expect(() => change(item)).toThrow(
        expect.objectContaining({
          code: 'ITEM_ALREADY_ARCHIVED',
          message: 'Item 12 is archived and can no longer be modified',
        }) as Error,
      );
    });
  });
});
