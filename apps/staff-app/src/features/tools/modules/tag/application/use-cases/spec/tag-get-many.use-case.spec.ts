import { TagGetManyUseCase } from '../tag-get-many.use-case';

describe('TagGetManyUseCase', () => {
  let list: jest.Mock;
  let useCase: TagGetManyUseCase;

  beforeEach(() => {
    list = jest.fn().mockResolvedValue([
      [
        {
          id: '300',
          name: 'fragile',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
      21,
    ]);
    useCase = new TagGetManyUseCase({ list });
  });

  describe('execute', () => {
    it('answers a page of views', async () => {
      const page = await useCase.execute({ page: 2, limit: 20 });

      expect(list).toHaveBeenCalledWith({ limit: 20, offset: 20 });
      expect(page).toEqual({
        page: 2,
        count: 1,
        pageCount: 2,
        total: 21,
        data: [
          {
            id: '300',
            name: 'fragile',
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
      await useCase.execute({ page, limit });

      expect(list).toHaveBeenCalledWith(pageWindow);
    });
  });
});
