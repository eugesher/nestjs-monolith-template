import type { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing';
import { TagCommonSubjectTypeEnum } from '@acme-staff/contracts/tag';

import { TagCommonReplaceUseCase } from '../tag-common-replace.use-case';

describe('TagCommonReplaceUseCase', () => {
  let outcomes: string[];
  let lockTags: jest.Mock;
  let findLinked: jest.Mock;
  let link: jest.Mock;
  let unlink: jest.Mock;
  let run: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: TagCommonReplaceUseCase;

  beforeEach(() => {
    outcomes = [];
    lockTags = jest.fn().mockResolvedValue([
      { id: '301', name: 'promo' },
      { id: '302', name: 'vip' },
    ]);
    findLinked = jest.fn().mockResolvedValue([{ tagId: '300' }, { tagId: '301' }]);
    link = jest.fn(() => Promise.resolve(void outcomes.push('link')));
    unlink = jest.fn(() => Promise.resolve(void outcomes.push('unlink')));
    run = jest.fn(async (work: () => Promise<unknown>) => {
      const result = await work();

      outcomes.push('commit');

      return result;
    });
    logger = makePinoLoggerMock();
    useCase = new TagCommonReplaceUseCase(
      { lockTags, findLinked, link, unlink },
      { run },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('links the new tags and unlinks the dropped ones in one transaction', async () => {
      const view = await useCase.execute({
        subjectType: TagCommonSubjectTypeEnum.PRODUCT,
        subjectId: '100',
        tagIds: ['302', '301'],
      });

      expect(view).toEqual({
        outcome: 'replaced',
        tags: [
          { id: '301', name: 'promo' },
          { id: '302', name: 'vip' },
        ],
        missingTagIds: [],
      });
      expect(lockTags).toHaveBeenCalledWith(['302', '301']);
      expect(findLinked).toHaveBeenCalledWith({ subjectType: 'product', subjectId: '100' });
      expect(unlink).toHaveBeenCalledWith({
        subjectType: 'product',
        subjectId: '100',
        tagIds: ['300'],
      });
      expect(link).toHaveBeenCalledWith({
        subjectType: 'product',
        subjectId: '100',
        tagIds: ['302'],
      });
      expect(outcomes).toEqual(['unlink', 'link', 'commit']);
      expect(logger.info).toHaveBeenCalledWith(
        { subjectType: 'product', subjectId: '100', tagIds: ['301', '302'] },
        'Subject tags replaced',
      );
    });

    it('answers tag-not-found and writes nothing when a tag does not exist', async () => {
      const view = await useCase.execute({
        subjectType: TagCommonSubjectTypeEnum.ORDER,
        subjectId: '600',
        tagIds: ['301', '998', '999'],
      });

      expect(view).toEqual({
        outcome: 'tag-not-found',
        tags: [],
        missingTagIds: ['998', '999'],
      });
      expect(findLinked).not.toHaveBeenCalled();
      expect(link).not.toHaveBeenCalled();
      expect(unlink).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('clears the tags of the subject for an empty list', async () => {
      lockTags.mockResolvedValue([]);

      const view = await useCase.execute({
        subjectType: TagCommonSubjectTypeEnum.ORDER,
        subjectId: '600',
        tagIds: [],
      });

      expect(view).toEqual({ outcome: 'replaced', tags: [], missingTagIds: [] });
      expect(unlink).toHaveBeenCalledWith({
        subjectType: 'order',
        subjectId: '600',
        tagIds: ['300', '301'],
      });
      expect(link).toHaveBeenCalledWith({ subjectType: 'order', subjectId: '600', tagIds: [] });
    });

    it('does not commit when a write fails', async () => {
      link.mockRejectedValue(new Error('connection lost'));

      await expect(
        useCase.execute({
          subjectType: TagCommonSubjectTypeEnum.PRODUCT,
          subjectId: '100',
          tagIds: ['301', '302'],
        }),
      ).rejects.toThrow('connection lost');
      expect(outcomes).toEqual(['unlink']);
      expect(logger.info).not.toHaveBeenCalled();
    });
  });
});
