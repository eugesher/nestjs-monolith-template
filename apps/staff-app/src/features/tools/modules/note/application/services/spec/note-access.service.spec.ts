import { NoteModel } from '../../../domain';
import { NoteAccessService } from '../note-access.service';

describe('NoteAccessService', () => {
  let findOwned: jest.Mock;
  let service: NoteAccessService;

  beforeEach(() => {
    findOwned = jest.fn().mockResolvedValue(
      NoteModel.reconstitute({
        id: '7',
        subjectType: 'product',
        subjectId: '42',
        body: 'Check the supplier',
        authorId: 'admin-1',
        resolved: false,
        version: 2,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );
    service = new NoteAccessService({ findOwned });
  });

  describe('loadOwned', () => {
    it('answers the note of its author', async () => {
      const note = await service.loadOwned({ noteId: '7', authorId: 'admin-1' });

      expect(findOwned).toHaveBeenCalledWith({ noteId: '7', authorId: 'admin-1' });
      expect(note.id).toBe('7');
      expect(note.authorId).toBe('admin-1');
    });

    it('refuses a note not found for the author with NOTE_NOT_FOUND', async () => {
      findOwned.mockResolvedValue(null);

      await expect(service.loadOwned({ noteId: '7', authorId: 'admin-1' })).rejects.toMatchObject({
        code: 'NOTE_NOT_FOUND',
        message: 'Note 7 was not found',
      });
    });
  });
});
