import { PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { LedgerCoreEntryModel } from '../../../domain';
import { LedgerCoreAppendEntryUseCase } from '../ledger-core-append-entry.use-case';

describe('LedgerCoreAppendEntryUseCase', () => {
  let repository: { append: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: LedgerCoreAppendEntryUseCase;

  beforeEach(() => {
    repository = { append: jest.fn().mockResolvedValue({ id: '4210', appended: true }) };
    logger = makePinoLoggerMock();
    useCase = new LedgerCoreAppendEntryUseCase(repository, logger as unknown as PinoLogger);
  });

  describe('execute', () => {
    it('appends the entry under the correlation id of the context', async () => {
      const view = await CorrelationContextHelper.run('corr-1', () =>
        useCase.execute({
          operationKey: ' product-archived:12 ',
          subjectType: 'product',
          subjectId: '12',
          action: 'ProductArchived',
          payload: { previousStatus: 'active' },
          occurredAt: '2026-01-01T03:00:00+03:00',
        }),
      );
      const [entry] = repository.append.mock.calls[0] as [LedgerCoreEntryModel];

      expect(view).toEqual({ id: '4210', appended: true });
      expect({ ...entry }).toEqual({
        id: undefined,
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { previousStatus: 'active' },
        correlationId: 'corr-1',
        occurredAt: new Date('2026-01-01T00:00:00.000Z'),
        recordedAt: undefined,
      });
      expect(logger.info).toHaveBeenCalledWith(
        { id: '4210', operationKey: 'product-archived:12' },
        'Ledger entry appended',
      );
    });

    it('answers a repeated operation key as already recorded, without an error', async () => {
      repository.append.mockResolvedValue({ id: '4210', appended: false });

      const view = await CorrelationContextHelper.run('corr-2', () =>
        useCase.execute({
          operationKey: 'product-archived:12',
          subjectType: 'product',
          subjectId: '12',
          action: 'ProductArchived',
          payload: {},
          occurredAt: '2026-01-01T00:00:00Z',
        }),
      );

      expect(view).toEqual({ id: '4210', appended: false });
      expect(logger.info).toHaveBeenCalledWith(
        { id: '4210', operationKey: 'product-archived:12' },
        'Ledger entry already recorded under this operation key',
      );
    });

    it('refuses an instant without a zone before touching storage', async () => {
      const execution = useCase.execute({
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: {},
        occurredAt: '2026-01-01T00:00:00',
      });

      await expect(execution).rejects.toThrow(
        'occurredAt must be an ISO-8601 instant with an explicit timezone offset',
      );
      expect(repository.append).not.toHaveBeenCalled();
    });
  });
});
