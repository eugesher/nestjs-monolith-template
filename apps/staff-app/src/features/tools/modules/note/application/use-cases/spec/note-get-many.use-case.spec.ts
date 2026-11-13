import { NoteGetManyUseCase } from '../note-get-many.use-case';

describe('NoteGetManyUseCase', () => {
  let list: jest.Mock;
  let useCase: NoteGetManyUseCase;

  beforeEach(() => {
    list = jest.fn().mockResolvedValue([
      [
        {
          id: '7',
          subjectType: 'product',
          subjectId: '42',
          body: 'Check the supplier',
          authorId: 'admin-1',
          resolved: false,
          version: 2,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        },
      ],
      1,
    ]);
    useCase = new NoteGetManyUseCase({ list });
  });

  describe('execute', () => {
    it('lists the notes of the author on the default page when nothing else is filtered', async () => {
      const page = await useCase.execute({
        page: undefined,
        limit: undefined,
        subjectType: undefined,
        subjectId: undefined,
        resolved: undefined,
        authorId: 'admin-1',
      });

      expect(list).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        subjectType: undefined,
        subjectId: undefined,
        resolved: undefined,
        authorId: 'admin-1',
      });
      expect(page).toEqual({
        page: 1,
        count: 1,
        pageCount: 1,
        total: 1,
        data: [
          {
            id: '7',
            subjectType: 'product',
            subjectId: '42',
            body: 'Check the supplier',
            authorId: 'admin-1',
            resolved: false,
            version: 2,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        ],
      });
    });

    it('passes a subject, a resolution filter and a clamped window', async () => {
      await useCase.execute({
        page: 0,
        limit: 500,
        subjectType: 'product',
        subjectId: '42',
        resolved: false,
        authorId: 'admin-1',
      });

      expect(list).toHaveBeenCalledWith({
        limit: 100,
        offset: 0,
        subjectType: 'product',
        subjectId: '42',
        resolved: false,
        authorId: 'admin-1',
      });
    });

    it.each([
      ['only a subject type', 'product', undefined],
      ['only a subject id', undefined, '42'],
    ])('refuses %s with NOTE_SUBJECT_INVALID', async (_, subjectType, subjectId) => {
      await expect(
        useCase.execute({
          page: undefined,
          limit: undefined,
          subjectType,
          subjectId,
          resolved: undefined,
          authorId: 'admin-1',
        }),
      ).rejects.toMatchObject({
        code: 'NOTE_SUBJECT_INVALID',
        message: 'A subject filter needs both subjectType and subjectId, or neither',
      });
      expect(list).not.toHaveBeenCalled();
    });
  });
});
