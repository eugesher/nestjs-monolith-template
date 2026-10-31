import { PinoLogger } from 'nestjs-pino';

import { ProductStatusEnum } from '@acme-libs/kernel';
import { CorrelationContextHelper } from '@acme-libs/observability';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ProductCoreModel } from '../../../domain';
import { ProductCoreArchiveUseCase } from '../product-core-archive.use-case';

describe('ProductCoreArchiveUseCase', () => {
  let outcomes: string[];
  let hooks: (() => Promise<void>)[];
  let lockById: jest.Mock;
  let update: jest.Mock;
  let enqueue: jest.Mock;
  let invalidate: jest.Mock;
  let run: jest.Mock;
  let afterCommit: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ProductCoreArchiveUseCase;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    outcomes = [];
    hooks = [];
    lockById = jest.fn().mockResolvedValue(
      ProductCoreModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        status: ProductStatusEnum.ACTIVE,
        version: 3,
      }),
    );
    update = jest.fn(() => Promise.resolve(void outcomes.push('update')));
    enqueue = jest.fn(() => Promise.resolve(void outcomes.push('enqueue')));
    invalidate = jest.fn(() => Promise.resolve(void outcomes.push('invalidate')));
    run = jest.fn(async (work: () => Promise<unknown>) => {
      const result = await work();

      outcomes.push('commit');

      for (const hook of hooks) {
        await hook();
      }

      return result;
    });
    afterCommit = jest.fn((hook: () => Promise<void>) => hooks.push(hook));
    logger = makePinoLoggerMock();
    useCase = new ProductCoreArchiveUseCase(
      { lockById, update },
      { enqueue },
      { invalidate },
      { run, afterCommit },
      2,
      logger as unknown as PinoLogger,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('execute', () => {
    it('archives the locked product, bumps its version and answers archived', async () => {
      const view = await CorrelationContextHelper.run('corr-1', () =>
        useCase.execute({ productId: '12', expectedVersion: 3 }),
      );

      expect(view).toEqual({ outcome: 'archived', currentVersion: 4 });
      expect(lockById).toHaveBeenCalledWith('12');
      expect(update).toHaveBeenCalledWith({
        product: expect.objectContaining({ id: '12', status: 'archived', version: 4 }) as unknown,
        versionAsRead: 3,
      });
      expect(logger.info).toHaveBeenCalledWith({ productId: '12', version: 4 }, 'Product archived');
    });

    it('drops the cached catalog and enqueues the ledger record only after the commit', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        useCase.execute({ productId: '12', expectedVersion: undefined }),
      );

      expect(outcomes).toEqual(['update', 'commit', 'invalidate', 'enqueue']);
      expect(enqueue).toHaveBeenCalledWith({
        operationKey: 'product-archived:12:4',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { sku: 'SKU-0001', previousStatus: 'active' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });
    });

    it('retries a failed enqueue and logs the record for a replay once the budget is spent', async () => {
      enqueue.mockRejectedValue(new Error('redis is down'));

      const view = await CorrelationContextHelper.run('corr-1', () =>
        useCase.execute({ productId: '12', expectedVersion: undefined }),
      );

      expect(view.outcome).toBe('archived');
      expect(enqueue).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalledWith(
        {
          err: new Error('redis is down'),
          correlationId: 'corr-1',
          productId: '12',
          operationKey: 'product-archived:12:4',
        },
        'Ledger enqueue failed permanently: the product is archived but absent from the ledger, replay this record',
      );
    });

    it('answers not-found for an unknown product and writes nothing', async () => {
      lockById.mockResolvedValue(null);

      const view = await useCase.execute({ productId: '99', expectedVersion: undefined });

      expect(view).toEqual({ outcome: 'not-found', currentVersion: undefined });
      expect(update).not.toHaveBeenCalled();
      expect(afterCommit).not.toHaveBeenCalled();
    });

    it('answers version-mismatch with the current version for a stale expected version', async () => {
      const view = await useCase.execute({ productId: '12', expectedVersion: 2 });

      expect(view).toEqual({ outcome: 'version-mismatch', currentVersion: 3 });
      expect(update).not.toHaveBeenCalled();
      expect(afterCommit).not.toHaveBeenCalled();
    });

    it('answers already-archived for an archived product and announces nothing', async () => {
      lockById.mockResolvedValue(
        ProductCoreModel.reconstitute({
          id: '12',
          sku: 'SKU-0001',
          status: ProductStatusEnum.ARCHIVED,
          version: 5,
        }),
      );

      const view = await useCase.execute({ productId: '12', expectedVersion: undefined });

      expect(view).toEqual({ outcome: 'already-archived', currentVersion: 5 });
      expect(update).not.toHaveBeenCalled();
      expect(afterCommit).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });
  });
});
