import { NoteModel } from '../../../domain';
import { NoteGetRevisionsUseCase } from '../note-get-revisions.use-case';
import type { NoteAccessService } from '../../services/note-access.service';

describe('NoteGetRevisionsUseCase', () => {
  let loadOwned: jest.Mock;
  let listForNote: jest.Mock;
  let useCase: NoteGetRevisionsUseCase;

  beforeEach(() => {
    loadOwned = jest.fn().mockResolvedValue(
      NoteModel.reconstitute({
        id: '7',
        subjectType: 'product',
        subjectId: '42',
        body: 'Supplier confirmed',
        authorId: 'admin-1',
        resolved: false,
        version: 2,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      }),
    );
    listForNote = jest.fn().mockResolvedValue([
      [
        {
          id: '11',
          noteId: '7',
          noteVersion: 2,
          bodyBefore: 'Check the supplier',
          bodyAfter: 'Supplier confirmed',
          editorId: 'admin-2',
          correlationId: 'corr-1',
          recordedAt: new Date('2026-01-02T00:00:00.123Z'),
        },
      ],
      1,
    ]);
    useCase = new NoteGetRevisionsUseCase({ loadOwned } as unknown as NoteAccessService, {
      listForNote,
    });
  });

  describe('execute', () => {
    it('answers a page of the revisions of an existing note', async () => {
      const page = await useCase.execute({ noteId: '7', authorId: 'admin-1', page: 2, limit: 5 });

      expect(loadOwned).toHaveBeenCalledWith({ noteId: '7', authorId: 'admin-1' });
      expect(listForNote).toHaveBeenCalledWith({ page: 2, limit: 5, offset: 5, noteId: '7' });
      expect(page).toEqual({
        page: 2,
        count: 1,
        pageCount: 1,
        total: 1,
        data: [
          {
            id: '11',
            noteId: '7',
            noteVersion: 2,
            bodyBefore: 'Check the supplier',
            bodyAfter: 'Supplier confirmed',
            editorId: 'admin-2',
            correlationId: 'corr-1',
            recordedAt: '2026-01-02T00:00:00.123Z',
          },
        ],
      });
    });

    it('refuses the revisions of a missing note before listing them', async () => {
      loadOwned.mockRejectedValue(new Error('Note 7 was not found'));

      await expect(
        useCase.execute({ noteId: '7', authorId: 'admin-1', page: undefined, limit: undefined }),
      ).rejects.toThrow('Note 7 was not found');
      expect(listForNote).not.toHaveBeenCalled();
    });
  });
});
