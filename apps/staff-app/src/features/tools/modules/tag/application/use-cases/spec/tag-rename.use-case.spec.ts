import { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';

import { TagModel, TagNameInvalidException, TagNameTakenException } from '../../../domain';
import { TagRenameUpdateOutcomeEnum } from '../../../outbound';
import { TagAccessService } from '../../services/tag-access.service';
import { TagRenameUseCase } from '../tag-rename.use-case';

describe('TagRenameUseCase', () => {
  let load: jest.Mock;
  let update: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: TagRenameUseCase;

  beforeEach(() => {
    load = jest
      .fn()
      .mockResolvedValueOnce(
        TagModel.reconstitute({
          id: '300',
          name: 'fragile',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      )
      .mockResolvedValueOnce(
        TagModel.reconstitute({
          id: '300',
          name: 'handle-with-care',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        }),
      );
    update = jest.fn().mockResolvedValue(TagRenameUpdateOutcomeEnum.UPDATED);
    logger = makePinoLoggerMock();
    useCase = new TagRenameUseCase(
      { load } as unknown as TagAccessService,
      { update },
      logger as unknown as PinoLogger,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('stores the new name and answers the stored tag', async () => {
      const view = await useCase.execute({ tagId: '300', name: ' handle-with-care ' });

      expect(update).toHaveBeenCalledWith({ id: '300', name: 'handle-with-care' });
      expect(load).toHaveBeenNthCalledWith(1, { tagId: '300' });
      expect(load).toHaveBeenNthCalledWith(2, { tagId: '300' });
      expect(view).toEqual({
        id: '300',
        name: 'handle-with-care',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });
      expect(logger.info).toHaveBeenCalledWith(
        { tagId: '300', nameAsRead: 'fragile', name: 'handle-with-care' },
        'Tag renamed',
      );
    });

    it('writes nothing when the name does not change', async () => {
      const view = await useCase.execute({ tagId: '300', name: 'fragile' });

      expect(update).not.toHaveBeenCalled();
      expect(load).toHaveBeenCalledTimes(1);
      expect(view.name).toBe('fragile');
    });

    it('throws TagNameInvalidException and writes nothing for an empty name', async () => {
      await expect(useCase.execute({ tagId: '300', name: ' ' })).rejects.toThrow(
        TagNameInvalidException,
      );
      expect(update).not.toHaveBeenCalled();
    });

    it('turns a duplicate key into TagNameTakenException', async () => {
      update.mockResolvedValue(TagRenameUpdateOutcomeEnum.DUPLICATE);

      await expect(useCase.execute({ tagId: '300', name: 'promo' })).rejects.toThrow(
        TagNameTakenException,
      );
    });

    it('rethrows any other error of the update', async () => {
      update.mockRejectedValue(new Error('connection lost'));

      await expect(useCase.execute({ tagId: '300', name: 'promo' })).rejects.toThrow(
        'connection lost',
      );
    });

    it('writes nothing for an unknown tag', async () => {
      load.mockReset().mockRejectedValue(new Error('not found'));

      await expect(useCase.execute({ tagId: '999', name: 'promo' })).rejects.toThrow('not found');
      expect(update).not.toHaveBeenCalled();
    });
  });
});
