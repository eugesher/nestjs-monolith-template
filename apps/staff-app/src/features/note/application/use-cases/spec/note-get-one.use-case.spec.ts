import { NoteModel } from '../../../domain';
import { NoteAccessService } from '../../services/note-access.service';
import { NoteGetOneUseCase } from '../note-get-one.use-case';

describe('NoteGetOneUseCase', () => {
  let load: jest.Mock;
  let useCase: NoteGetOneUseCase;

  beforeEach(() => {
    load = jest.fn().mockResolvedValue(
      NoteModel.reconstitute({
        id: '7',
        subjectType: 'product',
        subjectId: '42',
        body: 'Check the supplier',
        authorId: 'admin-1',
        resolved: false,
        version: 2,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      }),
    );
    useCase = new NoteGetOneUseCase({ load } as unknown as NoteAccessService);
  });

  describe('execute', () => {
    it('answers the note', async () => {
      const view = await useCase.execute({ noteId: '7' });

      expect(load).toHaveBeenCalledWith({ noteId: '7' });
      expect(view).toEqual({
        id: '7',
        subjectType: 'product',
        subjectId: '42',
        body: 'Check the supplier',
        authorId: 'admin-1',
        resolved: false,
        version: 2,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });
    });
  });
});
