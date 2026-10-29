import { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { LedgerRecordAppendUseCase } from '../ledger-record-append.use-case';

describe('LedgerRecordAppendUseCase', () => {
  let append: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: LedgerRecordAppendUseCase;

  beforeEach(() => {
    append = jest.fn().mockResolvedValue({ appended: true });
    logger = makePinoLoggerMock();
    useCase = new LedgerRecordAppendUseCase({ append }, logger as unknown as PinoLogger);
  });

  describe('execute', () => {
    it('appends the record and logs the start and the result', async () => {
      await useCase.execute({
        operationKey: 'product-created:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductCreated',
        payload: { sku: 'SKU-0001' },
        occurredAt: '2026-01-05T08:00:00.000Z',
      });

      expect(append).toHaveBeenCalledWith({
        operationKey: 'product-created:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductCreated',
        payload: { sku: 'SKU-0001' },
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
      expect(logger.info.mock.calls).toEqual([
        [
          { operationKey: 'product-created:12', action: 'ProductCreated' },
          'Ledger record received',
        ],
        [{ operationKey: 'product-created:12', appended: true }, 'Ledger record appended'],
      ]);
    });

    it('logs a record the ledger already holds as already appended', async () => {
      append.mockResolvedValue({ appended: false });

      await useCase.execute({
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
      });

      expect(logger.info).toHaveBeenLastCalledWith(
        { operationKey: 'product-archived:12', appended: false },
        'Ledger record already appended',
      );
    });

    it('passes a failing append through, so Bull retries the job', async () => {
      append.mockRejectedValue(new Error('deadlock'));

      const executing = useCase.execute({
        operationKey: 'product-created:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductCreated',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
      });

      await expect(executing).rejects.toThrow('deadlock');
      expect(logger.info).toHaveBeenCalledTimes(1);
    });
  });
});
