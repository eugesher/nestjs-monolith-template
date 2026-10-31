import { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { NoteModel } from '../../../domain';
import { NoteWriteConflictError } from '../../errors/note-write-conflict.error';
import { NoteAccessService } from '../note-access.service';
import { NoteWriteService } from '../note-write.service';

describe('NoteWriteService', () => {
  let loadOwned: jest.Mock;
  let logger: PinoLoggerMock;
  let service: NoteWriteService;

  beforeEach(() => {
    loadOwned = jest.fn().mockResolvedValue(
      NoteModel.reconstitute({
        id: '7',
        subjectType: 'product',
        subjectId: '42',
        body: 'Supplier confirmed',
        authorId: 'admin-1',
        resolved: false,
        version: 4,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      }),
    );
    logger = makePinoLoggerMock();
    service = new NoteWriteService(
      { loadOwned } as unknown as NoteAccessService,
      5,
      logger as unknown as PinoLogger,
    );
  });

  describe('run', () => {
    it('answers what the attempt answers', async () => {
      const attempt = jest.fn().mockResolvedValue('written');

      const result = await service.run({ noteId: '7' }, attempt);

      expect(result).toBe('written');
      expect(attempt).toHaveBeenCalledTimes(1);
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('retries a lost race and logs the retry', async () => {
      const attempt = jest
        .fn()
        .mockRejectedValueOnce(new NoteWriteConflictError('7', 4))
        .mockResolvedValueOnce('written');

      const result = await service.run({ noteId: '7' }, attempt);

      expect(result).toBe('written');
      expect(attempt).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledWith(
        { noteId: '7', currentVersion: 4, attempt: 1, maxAttempts: 5 },
        'Note write conflict — retrying with a fresh read',
      );
    });

    it('refuses with VERSION_MISMATCH once the budget is spent and logs a warning', async () => {
      const attempt = jest.fn().mockRejectedValue(new NoteWriteConflictError('7', 4));

      await expect(service.run({ noteId: '7' }, attempt)).rejects.toMatchObject({
        code: 'VERSION_MISMATCH',
        message: 'Note 7 write lost the optimistic race after 5 attempts',
        details: { currentVersion: 4 },
      });
      expect(attempt).toHaveBeenCalledTimes(5);
      expect(logger.warn).toHaveBeenCalledWith(
        { noteId: '7', attempts: 5, maxAttempts: 5 },
        'Note write conflict exhausted retry budget',
      );
    });

    it('does not retry any other failure', async () => {
      const attempt = jest.fn().mockRejectedValue(new Error('connection lost'));

      await expect(service.run({ noteId: '7' }, attempt)).rejects.toThrow('connection lost');
      expect(attempt).toHaveBeenCalledTimes(1);
    });
  });

  describe('reload', () => {
    it('answers the stored note after a saved write', async () => {
      const note = await service.reload({ noteId: '7', authorId: 'admin-1', saved: true });

      expect(loadOwned).toHaveBeenCalledWith({ noteId: '7', authorId: 'admin-1' });
      expect(note.version).toBe(4);
      expect(note.updatedAt).toEqual(new Date('2026-01-03T00:00:00.000Z'));
    });

    it('turns a lost race into a conflict carrying the stored version', async () => {
      await expect(
        service.reload({ noteId: '7', authorId: 'admin-1', saved: false }),
      ).rejects.toEqual(new NoteWriteConflictError('7', 4));
    });
  });
});
