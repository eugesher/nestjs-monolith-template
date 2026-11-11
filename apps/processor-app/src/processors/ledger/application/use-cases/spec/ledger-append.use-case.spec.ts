import type { PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing/observability';

import { LedgerAppendEntryInsertOutcomeEnum } from '../../../outbound';
import { LedgerAppendUseCase } from '../ledger-append.use-case';
import type { ILedgerAppendEntryDraftOutput } from '../../../domain';

describe('LedgerAppendUseCase', () => {
  let insert: jest.Mock;
  let findByOperationKey: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: LedgerAppendUseCase;

  beforeEach(() => {
    insert = jest
      .fn()
      .mockResolvedValue({ outcome: LedgerAppendEntryInsertOutcomeEnum.INSERTED, id: '4210' });
    findByOperationKey = jest.fn().mockResolvedValue({ id: '4210' });
    logger = makePinoLoggerMock();
    useCase = new LedgerAppendUseCase(
      { insert, findByOperationKey },
      logger as unknown as PinoLogger,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it(
      'appends the entry under the correlation id of ' +
        'the context and logs the start and the result',
      async () => {
        await CorrelationContextHelper.run('corr-1', () =>
          useCase.execute({
            operationKey: ' product-archived:12:2 ',
            subjectType: 'product',
            subjectId: '12',
            action: 'ProductArchived',
            payload: { previousStatus: 'active' },
            occurredAt: '2026-01-01T03:00:00+03:00',
          }),
        );

        const [draft] = insert.mock.calls[0] as [ILedgerAppendEntryDraftOutput];

        expect(draft).toEqual({
          operationKey: 'product-archived:12:2',
          subjectType: 'product',
          subjectId: '12',
          action: 'ProductArchived',
          payload: { previousStatus: 'active' },
          correlationId: 'corr-1',
          occurredAt: new Date('2026-01-01T00:00:00.000Z'),
        });
        expect(logger.info.mock.calls).toEqual([
          [
            { operationKey: ' product-archived:12:2 ', action: 'ProductArchived' },
            'Ledger record received',
          ],
          [
            { id: '4210', operationKey: 'product-archived:12:2', appended: true },
            'Ledger record appended',
          ],
        ]);
      },
    );

    it('logs a record the ledger already holds as already appended, without an error', async () => {
      insert.mockResolvedValue({ outcome: LedgerAppendEntryInsertOutcomeEnum.DUPLICATE });

      await CorrelationContextHelper.run('corr-2', () =>
        useCase.execute({
          operationKey: 'product-archived:12:2',
          subjectType: 'product',
          subjectId: '12',
          action: 'ProductArchived',
          payload: {},
          occurredAt: '2026-01-05T08:00:00.000Z',
        }),
      );

      expect(logger.info).toHaveBeenLastCalledWith(
        { id: '4210', operationKey: 'product-archived:12:2', appended: false },
        'Ledger record already appended',
      );
    });

    it('refuses an instant without a zone before touching storage', async () => {
      const executing = CorrelationContextHelper.run('corr-3', () =>
        useCase.execute({
          operationKey: 'product-archived:12:2',
          subjectType: 'product',
          subjectId: '12',
          action: 'ProductArchived',
          payload: {},
          occurredAt: '2026-01-01T00:00:00',
        }),
      );

      await expect(executing).rejects.toThrow(
        'occurredAt must be an ISO-8601 instant with an explicit timezone offset',
      );
      expect(insert).not.toHaveBeenCalled();
    });

    it('passes a failing append through, so Bull retries the job', async () => {
      insert.mockRejectedValue(new Error('deadlock'));

      const executing = CorrelationContextHelper.run('corr-4', () =>
        useCase.execute({
          operationKey: 'product-created:12',
          subjectType: 'product',
          subjectId: '12',
          action: 'ProductCreated',
          payload: {},
          occurredAt: '2026-01-05T08:00:00.000Z',
        }),
      );

      await expect(executing).rejects.toThrow('deadlock');
      expect(logger.info).toHaveBeenCalledTimes(1);
    });
  });
});
