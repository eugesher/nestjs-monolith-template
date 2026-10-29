import { NoteModel, NoteRevisionModel } from '../../../domain';
import { NoteAccessService } from '../../services/note-access.service';
import { NoteGetRevisionsUseCase } from '../note-get-revisions.use-case';

describe('NoteGetRevisionsUseCase', () => {
  let load: jest.Mock;
  let listForNote: jest.Mock;
  let useCase: NoteGetRevisionsUseCase;

  beforeEach(() => {
    load = jest.fn().mockResolvedValue(
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
    listForNote = jest.fn().mockResolvedValue({
      items: [
        NoteRevisionModel.reconstitute({
          id: '11',
          noteId: '7',
          noteVersion: 2,
          bodyBefore: 'Check the supplier',
          bodyAfter: 'Supplier confirmed',
          editorId: 'admin-2',
          correlationId: 'corr-1',
          recordedAt: new Date('2026-01-02T00:00:00.123Z'),
        }),
      ],
      total: 1,
      page: 2,
      size: 5,
    });
    useCase = new NoteGetRevisionsUseCase({ load } as unknown as NoteAccessService, {
      listForNote,
    });
  });

  describe('execute', () => {
    it('answers a page of the revisions of an existing note', async () => {
      const page = await useCase.execute({ noteId: '7', page: 2, size: 5 });

      expect(load).toHaveBeenCalledWith({ noteId: '7' });
      expect(listForNote).toHaveBeenCalledWith({ page: 2, size: 5, noteId: '7' });
      expect(page).toEqual({
        items: [
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
        total: 1,
        page: 2,
        size: 5,
      });
    });

    it('refuses the revisions of a missing note before listing them', async () => {
      load.mockRejectedValue(new Error('Note 7 was not found'));

      await expect(
        useCase.execute({ noteId: '7', page: undefined, size: undefined }),
      ).rejects.toThrow('Note 7 was not found');
      expect(listForNote).not.toHaveBeenCalled();
    });
  });
});
