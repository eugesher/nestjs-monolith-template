import { ProductStatusEnum } from '@acme-libs/kernel';

import { ProductGetManyUseCase } from '../product-get-many.use-case';

describe('ProductGetManyUseCase', () => {
  let list: jest.Mock;
  let findProductIds: jest.Mock;
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
    findProductIds = jest.fn().mockResolvedValue(['12', '14']);
    useCase = new ProductGetManyUseCase(
      { list },
      { find: jest.fn(), replace: jest.fn(), findProductIds },
    );
  });

  describe('execute', () => {
    it('answers a page of views', async () => {
      const page = await useCase.execute({ page: 2, limit: 20, tagId: undefined });

      expect(list).toHaveBeenCalledWith({ limit: 20, offset: 20, productIds: undefined });
      expect(findProductIds).not.toHaveBeenCalled();
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
      ['defaults an absent window', undefined, undefined, { limit: 20, offset: 0 }],
      ['caps the limit at 100', 1, 500, { limit: 100, offset: 0 }],
    ])('%s', async (_, page, limit, pageWindow) => {
      await useCase.execute({ page, limit, tagId: undefined });

      expect(list).toHaveBeenCalledWith({ ...pageWindow, productIds: undefined });
    });

    it('lists only the products that carry the tag', async () => {
      await useCase.execute({ page: 1, limit: 20, tagId: '300' });

      expect(findProductIds).toHaveBeenCalledWith({ tagId: '300' });
      expect(list).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        productIds: ['12', '14'],
      });
    });

    it('answers an empty page without a query when no product carries the tag', async () => {
      findProductIds.mockResolvedValue([]);

      const page = await useCase.execute({ page: 1, limit: 20, tagId: '300' });

      expect(list).not.toHaveBeenCalled();
      expect(page).toEqual({ page: 1, count: 0, pageCount: 0, total: 0, data: [] });
    });
  });
});
