import { PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { LedgerRecordEntryModel } from '../../../domain';
import { LedgerRecordAppendUseCase } from '../ledger-record-append.use-case';

describe('LedgerRecordAppendUseCase', () => {
  let append: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: LedgerRecordAppendUseCase;

  beforeEach(() => {
    append = jest.fn().mockResolvedValue({ id: '4210', appended: true });
    logger = makePinoLoggerMock();
    useCase = new LedgerRecordAppendUseCase({ append }, logger as unknown as PinoLogger);
  });

  describe('execute', () => {
    it('appends the entry under the correlation id of the context and logs the start and the result', async () => {
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

      const [entry] = append.mock.calls[0] as [LedgerRecordEntryModel];

      expect({ ...entry }).toEqual({
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
    });

    it('logs a record the ledger already holds as already appended, without an error', async () => {
      append.mockResolvedValue({ id: '4210', appended: false });

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
      expect(append).not.toHaveBeenCalled();
    });

    it('passes a failing append through, so Bull retries the job', async () => {
      append.mockRejectedValue(new Error('deadlock'));

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
