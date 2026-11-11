import type { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/observability/testing';

import { TagModel } from '../../../domain';
import { TagDeleteUseCase } from '../tag-delete.use-case';
import type { TagAccessService } from '../../services/tag-access.service';

describe('TagDeleteUseCase', () => {
  let load: jest.Mock;
  let remove: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: TagDeleteUseCase;

  beforeEach(() => {
    load = jest.fn().mockResolvedValue(
      TagModel.reconstitute({
        id: '300',
        name: 'fragile',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );
    remove = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    useCase = new TagDeleteUseCase(
      { load } as unknown as TagAccessService,
      { delete: remove },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('deletes an existing tag', async () => {
      const result = await useCase.execute({ tagId: '300' });

      expect(result).toBeUndefined();
      expect(load).toHaveBeenCalledWith({ tagId: '300' });
      expect(remove).toHaveBeenCalledWith('300');
      expect(logger.info).toHaveBeenCalledWith({ tagId: '300' }, 'Tag deleted');
    });

    it('deletes nothing for an unknown tag', async () => {
      load.mockRejectedValue(new Error('not found'));

      await expect(useCase.execute({ tagId: '999' })).rejects.toThrow('not found');
      expect(remove).not.toHaveBeenCalled();
    });
  });
});
