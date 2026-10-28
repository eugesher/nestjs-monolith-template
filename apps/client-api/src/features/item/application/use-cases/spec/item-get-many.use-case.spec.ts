import { ItemStatusEnum } from '@acme-libs/kernel';
import { ItemModel } from '../../../domain';
import { ItemGetManyUseCase } from '../item-get-many.use-case';

describe('ItemGetManyUseCase', () => {
  let list: jest.Mock;
  let useCase: ItemGetManyUseCase;

  beforeEach(() => {
    list = jest.fn().mockResolvedValue({
      items: [
        ItemModel.reconstitute({
          id: '12',
          sku: 'SKU-0001',
          name: 'Lamp',
          ownerId: 'owner-1',
          status: ItemStatusEnum.DRAFT,
          version: 1,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      ],
      total: 41,
      page: 2,
      size: 20,
    });
    useCase = new ItemGetManyUseCase({ list });
  });

  describe('execute', () => {
    it('answers a page of views', async () => {
      const page = await useCase.execute({ page: 2, size: 20, ownerId: 'owner-1' });

      expect(list).toHaveBeenCalledWith({ page: 2, size: 20, ownerId: 'owner-1' });
      expect(page).toEqual({
        items: [
          {
            id: '12',
            sku: 'SKU-0001',
            name: 'Lamp',
            status: 'draft',
            version: 1,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        total: 41,
        page: 2,
        size: 20,
      });
    });

    it.each([
      ['defaults an absent window', undefined, undefined, { page: 1, size: 20 }],
      ['caps the size at 100', 1, 500, { page: 1, size: 100 }],
    ])('%s', async (_, page, size, window) => {
      await useCase.execute({ page, size, ownerId: undefined });

      expect(list).toHaveBeenCalledWith({ ...window, ownerId: undefined });
    });
  });
});
