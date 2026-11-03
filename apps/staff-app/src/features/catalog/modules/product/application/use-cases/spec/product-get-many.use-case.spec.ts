import { ProductStatusEnum } from '@acme-libs/kernel';

import { ProductGetManyUseCase } from '../product-get-many.use-case';

describe('ProductGetManyUseCase', () => {
  let list: jest.Mock;
  let useCase: ProductGetManyUseCase;

  beforeEach(() => {
    list = jest.fn().mockResolvedValue([
      [
        {
          id: '12',
          sku: 'SKU-0001',
          name: 'Lamp',
          status: ProductStatusEnum.DRAFT,
          version: 1,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
      41,
    ]);
    useCase = new ProductGetManyUseCase({ list });
  });

  describe('execute', () => {
    it('answers a page of views', async () => {
      const page = await useCase.execute({ page: 2, size: 20 });

      expect(list).toHaveBeenCalledWith({ page: 2, size: 20 });
      expect(page).toEqual({
        page: 2,
        count: 1,
        pageCount: 3,
        total: 41,
        data: [
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
      });
    });

    it.each([
      ['defaults an absent window', undefined, undefined, { page: 1, size: 20 }],
      ['caps the size at 100', 1, 500, { page: 1, size: 100 }],
    ])('%s', async (_, page, size, window) => {
      await useCase.execute({ page, size });

      expect(list).toHaveBeenCalledWith({ ...window });
    });
  });
});
