import { NoteModel } from '../../../domain';
import { NoteAccessService } from '../note-access.service';

describe('NoteAccessService', () => {
  let findById: jest.Mock;
  let service: NoteAccessService;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue(
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
    service = new NoteAccessService({ findById });
  });

  describe('load', () => {
    it('answers the note of any author', async () => {
      const note = await service.load({ noteId: '7' });

      expect(findById).toHaveBeenCalledWith('7');
      expect(note.id).toBe('7');
      expect(note.authorId).toBe('admin-1');
    });

    it('refuses a missing note with NOTE_NOT_FOUND', async () => {
      findById.mockResolvedValue(null);

      await expect(service.load({ noteId: '7' })).rejects.toMatchObject({
        code: 'NOTE_NOT_FOUND',
        message: 'Note 7 was not found',
      });
    });
  });
});
