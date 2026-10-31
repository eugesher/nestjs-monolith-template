import { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { NoteModel } from '../../../domain';
import { NoteAccessService } from '../../services/note-access.service';
import { NoteWriteService } from '../../services/note-write.service';
import { NoteResolveUseCase } from '../note-resolve.use-case';

describe('NoteResolveUseCase', () => {
  let findOwned: jest.Mock;
  let update: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: NoteResolveUseCase;

  beforeEach(() => {
    findOwned = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve(
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
        ),
      )
      .mockImplementation(() =>
        Promise.resolve(
          NoteModel.reconstitute({
            id: '7',
            subjectType: 'product',
            subjectId: '42',
            body: 'Check the supplier',
            authorId: 'admin-1',
            resolved: true,
            version: 3,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-03T00:00:00.000Z'),
          }),
        ),
      );
    update = jest.fn().mockResolvedValue(true);
    logger = makePinoLoggerMock();

    const accessService = new NoteAccessService({ findOwned });

    useCase = new NoteResolveUseCase(
      accessService,
      new NoteWriteService(accessService, 3, logger as unknown as PinoLogger),
      { update },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('saves the resolved note against the version as read and answers the stored note', async () => {
      const view = await useCase.execute({ noteId: '7', authorId: 'admin-1' });
      const [command] = update.mock.calls[0] as [{ note: NoteModel; versionAsRead: number }];

      expect(command.versionAsRead).toBe(2);
      expect(command.note.resolved).toBe(true);
      expect(command.note.version).toBe(3);
      expect(view.resolved).toBe(true);
      expect(view.version).toBe(3);
      expect(view.updatedAt).toBe('2026-01-03T00:00:00.000Z');
      expect(logger.info).toHaveBeenCalledWith({ noteId: '7', version: 3 }, 'Note resolved');
    });

    it('retries a lost race with a fresh read', async () => {
      update.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
      findOwned.mockReset().mockImplementation(() =>
        Promise.resolve(
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
        ),
      );

      await useCase.execute({ noteId: '7', authorId: 'admin-1' });

      expect(update).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledWith(
        { noteId: '7', currentVersion: 2, attempt: 1, maxAttempts: 3 },
        'Note write conflict — retrying with a fresh read',
      );
    });

    it('refuses a resolved note with NOTE_RESOLVED and writes nothing', async () => {
      findOwned.mockReset().mockResolvedValue(
        NoteModel.reconstitute({
          id: '7',
          subjectType: 'product',
          subjectId: '42',
          body: 'Check the supplier',
          authorId: 'admin-1',
          resolved: true,
          version: 3,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        }),
      );

      await expect(useCase.execute({ noteId: '7', authorId: 'admin-1' })).rejects.toMatchObject({
        code: 'NOTE_RESOLVED',
      });
      expect(update).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });
  });
});
