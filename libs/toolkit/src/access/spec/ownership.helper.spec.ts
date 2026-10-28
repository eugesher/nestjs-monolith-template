import { OwnershipHelper } from '../ownership.helper';

describe('OwnershipHelper', () => {
  describe('loadOwned', () => {
    it('returns the entity to its owner', async () => {
      const item = { id: 1, ownerId: 'user-1' };

      const loaded = await OwnershipHelper.loadOwned({
        find: () => Promise.resolve(item),
        owner: (entity) => entity.ownerId,
        requiredOwner: 'user-1',
        onMissing: (): never => {
          throw new Error('MISSING');
        },
        onForbidden: (): never => {
          throw new Error('FORBIDDEN');
        },
      });

      expect(loaded).toBe(item);
    });

    it('refuses a non-owner with FORBIDDEN, never an empty result', async () => {
      const onForbidden = jest.fn((): never => {
        throw new Error('FORBIDDEN');
      });

      const load = OwnershipHelper.loadOwned({
        find: () => Promise.resolve({ id: 1, ownerId: 'user-1' }),
        owner: (entity) => entity.ownerId,
        requiredOwner: 'user-2',
        onMissing: (): never => {
          throw new Error('MISSING');
        },
        onForbidden,
      });

      await expect(load).rejects.toThrow('FORBIDDEN');
      expect(onForbidden).toHaveBeenCalledWith('user-1');
    });

    it('refuses a miss with MISSING', async () => {
      const load = OwnershipHelper.loadOwned<{ ownerId: string }>({
        find: () => Promise.resolve(null),
        owner: (entity) => entity.ownerId,
        requiredOwner: 'user-1',
        onMissing: (): never => {
          throw new Error('MISSING');
        },
        onForbidden: (): never => {
          throw new Error('FORBIDDEN');
        },
      });

      await expect(load).rejects.toThrow('MISSING');
    });

    it('skips the ownership check for an unscoped (undefined) caller', async () => {
      const item = { id: 1, ownerId: 'user-1' };

      const loaded = await OwnershipHelper.loadOwned({
        find: () => Promise.resolve(item),
        owner: (entity) => entity.ownerId,
        requiredOwner: undefined,
        onMissing: (): never => {
          throw new Error('MISSING');
        },
        onForbidden: (): never => {
          throw new Error('FORBIDDEN');
        },
      });

      expect(loaded).toBe(item);
    });

    it.each([
      ['an explicit null caller matches nothing', 'user-1', null],
      ['an unowned resource belongs to nobody in particular', null, 'user-1'],
    ])('refuses when %s', async (_, ownerId, requiredOwner) => {
      const load = OwnershipHelper.loadOwned({
        find: () => Promise.resolve({ id: 1, ownerId }),
        owner: (entity) => entity.ownerId,
        requiredOwner,
        onMissing: (): never => {
          throw new Error('MISSING');
        },
        onForbidden: (): never => {
          throw new Error('FORBIDDEN');
        },
      });

      await expect(load).rejects.toThrow('FORBIDDEN');
    });

    it.each([
      ['onMissing', null, 'OwnershipHelper.loadOwned: onMissing must throw'],
      ['onForbidden', { ownerId: 'user-1' }, 'OwnershipHelper.loadOwned: onForbidden must throw'],
    ])('fails loudly when %s returns instead of throwing', async (_, found, message) => {
      const load = OwnershipHelper.loadOwned<{ ownerId: string }>({
        find: () => Promise.resolve(found),
        owner: (entity) => entity.ownerId,
        requiredOwner: 'user-2',
        onMissing: jest.fn() as unknown as () => never,
        onForbidden: jest.fn() as unknown as () => never,
      });

      await expect(load).rejects.toThrow(message);
    });
  });
});
