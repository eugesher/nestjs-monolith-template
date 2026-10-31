import { PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { NoteModel, NoteRevisionModel } from '../../../domain';
import { NoteAccessService } from '../../services/note-access.service';
import { NoteWriteService } from '../../services/note-write.service';
import { NoteEditUseCase } from '../note-edit.use-case';

describe('NoteEditUseCase', () => {
  let findOwned: jest.Mock;
  let update: jest.Mock;
  let appendRevision: jest.Mock;
  let run: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: NoteEditUseCase;

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
            body: 'Supplier confirmed',
            authorId: 'admin-1',
            resolved: false,
            version: 3,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-03T00:00:00.000Z'),
          }),
        ),
      );
    update = jest.fn().mockResolvedValue(true);
    appendRevision = jest.fn().mockResolvedValue(undefined);
    run = jest.fn((work: () => Promise<unknown>) => work());
    logger = makePinoLoggerMock();

    const accessService = new NoteAccessService({ findOwned });

    useCase = new NoteEditUseCase(
      accessService,
      new NoteWriteService(accessService, 3, logger as unknown as PinoLogger),
      { update, appendRevision },
      { run, afterCommit: jest.fn() },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('saves the note and appends its revision in one transaction, then answers the stored note', async () => {
      const view = await CorrelationContextHelper.run('corr-1', () =>
        useCase.execute({ noteId: '7', body: ' Supplier confirmed ', editorId: 'admin-1' }),
      );
      const [command] = update.mock.calls[0] as [{ note: NoteModel; versionAsRead: number }];
      const [revision] = appendRevision.mock.calls[0] as [NoteRevisionModel];

      expect(run).toHaveBeenCalledTimes(1);
      expect(command.versionAsRead).toBe(2);
      expect(command.note.body).toBe('Supplier confirmed');
      expect(command.note.version).toBe(3);
      expect(revision).toEqual({
        id: undefined,
        noteId: '7',
        noteVersion: 3,
        bodyBefore: 'Check the supplier',
        bodyAfter: 'Supplier confirmed',
        editorId: 'admin-1',
        correlationId: 'corr-1',
        recordedAt: undefined,
      });
      expect(view).toEqual({
        id: '7',
        subjectType: 'product',
        subjectId: '42',
        body: 'Supplier confirmed',
        authorId: 'admin-1',
        resolved: false,
        version: 3,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      });
      expect(logger.info).toHaveBeenCalledWith(
        { noteId: '7', editorId: 'admin-1', version: 3, edited: true },
        'Note edited',
      );
    });

    it('reads before the transaction and reads the stored note after it', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        useCase.execute({ noteId: '7', body: 'Supplier confirmed', editorId: 'admin-1' }),
      );

      expect(findOwned.mock.invocationCallOrder[0]).toBeLessThan(run.mock.invocationCallOrder[0]);
      expect(run.mock.invocationCallOrder[0]).toBeLessThan(update.mock.invocationCallOrder[0]);
      expect(update.mock.invocationCallOrder[0]).toBeLessThan(
        appendRevision.mock.invocationCallOrder[0],
      );
      expect(appendRevision.mock.invocationCallOrder[0]).toBeLessThan(
        findOwned.mock.invocationCallOrder[1],
      );
    });

    it('writes nothing and opens no transaction for an edit to the same body', async () => {
      const view = await useCase.execute({
        noteId: '7',
        body: ' Check the supplier ',
        editorId: 'admin-1',
      });

      expect(run).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
      expect(appendRevision).not.toHaveBeenCalled();
      expect(findOwned).toHaveBeenCalledTimes(1);
      expect(view.version).toBe(2);
      expect(logger.info).toHaveBeenCalledWith(
        { noteId: '7', editorId: 'admin-1', version: 2, edited: false },
        'Note edit was a no-op',
      );
    });

    it('fails the transaction when the revision cannot be appended, so the note update rolls back', async () => {
      appendRevision.mockRejectedValue(new Error('deadlock'));

      await expect(
        CorrelationContextHelper.run('corr-1', () =>
          useCase.execute({ noteId: '7', body: 'Supplier confirmed', editorId: 'admin-1' }),
        ),
      ).rejects.toThrow('deadlock');
      await expect(run.mock.results[0].value).rejects.toThrow('deadlock');
      expect(update).toHaveBeenCalledTimes(1);
      expect(run).toHaveBeenCalledTimes(1);
      expect(findOwned).toHaveBeenCalledTimes(1);
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('appends no revision for a lost race and retries the whole edit with a fresh read', async () => {
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

      await CorrelationContextHelper.run('corr-1', () =>
        useCase.execute({ noteId: '7', body: 'Supplier confirmed', editorId: 'admin-1' }),
      );

      expect(run).toHaveBeenCalledTimes(2);
      expect(update).toHaveBeenCalledTimes(2);
      expect(appendRevision).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith(
        { noteId: '7', currentVersion: 2, attempt: 1, maxAttempts: 3 },
        'Note write conflict — retrying with a fresh read',
      );
    });

    it('refuses with VERSION_MISMATCH once every attempt lost the race', async () => {
      update.mockResolvedValue(false);
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

      await expect(
        useCase.execute({ noteId: '7', body: 'Supplier confirmed', editorId: 'admin-1' }),
      ).rejects.toMatchObject({
        code: 'VERSION_MISMATCH',
        details: { currentVersion: 2 },
      });
      expect(update).toHaveBeenCalledTimes(3);
      expect(appendRevision).not.toHaveBeenCalled();
    });

    it('refuses a resolved note before opening a transaction', async () => {
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

      await expect(
        useCase.execute({ noteId: '7', body: 'Supplier confirmed', editorId: 'admin-1' }),
      ).rejects.toMatchObject({ code: 'NOTE_RESOLVED' });
      expect(run).not.toHaveBeenCalled();
    });

    it('refuses a note not found for the editor with NOTE_NOT_FOUND', async () => {
      findOwned.mockReset().mockResolvedValue(null);

      await expect(
        useCase.execute({ noteId: '7', body: 'Supplier confirmed', editorId: 'admin-1' }),
      ).rejects.toMatchObject({ code: 'NOTE_NOT_FOUND' });
      expect(run).not.toHaveBeenCalled();
    });
  });
});
