import type { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing/observability';

import { TagNameInvalidException, TagNameTakenException } from '../../../domain';
import { TagCreateInsertOutcomeEnum } from '../../../outbound';
import { TagCreateUseCase } from '../tag-create.use-case';

describe('TagCreateUseCase', () => {
  let insert: jest.Mock;
  let findInserted: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: TagCreateUseCase;

  beforeEach(() => {
    insert = jest
      .fn()
      .mockResolvedValue({ outcome: TagCreateInsertOutcomeEnum.INSERTED, id: '303' });
    findInserted = jest.fn().mockResolvedValue({
      id: '303',
      name: 'heavy',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    logger = makePinoLoggerMock();
    useCase = new TagCreateUseCase({ insert, findInserted }, logger as unknown as PinoLogger);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('stores the trimmed name and answers the stored tag', async () => {
      const view = await useCase.execute({ name: ' heavy ' });

      expect(insert).toHaveBeenCalledWith({ name: 'heavy' });
      expect(findInserted).toHaveBeenCalledWith('303');
      expect(view).toEqual({
        id: '303',
        name: 'heavy',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
      expect(logger.info).toHaveBeenCalledWith({ tagId: '303', name: 'heavy' }, 'Tag created');
    });

    it('throws TagNameInvalidException and stores nothing for an empty name', async () => {
      await expect(useCase.execute({ name: ' ' })).rejects.toThrow(TagNameInvalidException);
      expect(insert).not.toHaveBeenCalled();
    });

    it('turns a duplicate key into TagNameTakenException', async () => {
      insert.mockResolvedValue({ outcome: TagCreateInsertOutcomeEnum.DUPLICATE });

      await expect(useCase.execute({ name: 'fragile' })).rejects.toThrow(TagNameTakenException);
      expect(findInserted).not.toHaveBeenCalled();
    });

    it('rethrows any other error of the insert', async () => {
      insert.mockRejectedValue(new Error('connection lost'));

      await expect(useCase.execute({ name: 'fragile' })).rejects.toThrow('connection lost');
    });
  });
});
