import { PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { LedgerCatalogEventsRecordService } from '../ledger-catalog-events-record.service';

describe('LedgerCatalogEventsRecordService', () => {
  let append: jest.Mock;
  let logger: PinoLoggerMock;
  let service: LedgerCatalogEventsRecordService;

  beforeEach(() => {
    append = jest.fn().mockResolvedValue({ appended: true });
    logger = makePinoLoggerMock();
    service = new LedgerCatalogEventsRecordService({ append }, logger as unknown as PinoLogger);
  });

  describe('record', () => {
    it('appends the entry and logs the start and the result', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        service.record({
          operationKey: 'product-created:12',
          subjectType: 'product',
          subjectId: '12',
          action: 'ProductCreated',
          payload: { sku: 'SKU-0001' },
          occurredAt: '2026-01-05T08:00:00.000Z',
        }),
      );

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
          'Catalog event received',
        ],
        [{ operationKey: 'product-created:12', appended: true }, 'Catalog event recorded'],
      ]);
    });

    it('logs an entry the ledger already holds as already recorded', async () => {
      append.mockResolvedValue({ appended: false });

      await CorrelationContextHelper.run('corr-1', () =>
        service.record({
          operationKey: 'product-archived:12',
          subjectType: 'product',
          subjectId: '12',
          action: 'ProductArchived',
          payload: {},
          occurredAt: '2026-01-05T08:00:00.000Z',
        }),
      );

      expect(logger.info).toHaveBeenLastCalledWith(
        { operationKey: 'product-archived:12', appended: false },
        'Catalog event already recorded',
      );
    });

    it('retries a failed append and logs each retry', async () => {
      append.mockRejectedValueOnce(new Error('deadlock')).mockResolvedValue({ appended: true });

      await CorrelationContextHelper.run('corr-1', () =>
        service.record({
          operationKey: 'product-created:12',
          subjectType: 'product',
          subjectId: '12',
          action: 'ProductCreated',
          payload: {},
          occurredAt: '2026-01-05T08:00:00.000Z',
        }),
      );

      expect(append).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledWith(
        {
          err: new Error('deadlock'),
          correlationId: 'corr-1',
          attempt: 1,
          operationKey: 'product-created:12',
        },
        'Ledger append (catalog event) failed — retrying',
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs the entry for replay after three failures instead of throwing', async () => {
      append.mockRejectedValue(new Error('deadlock'));

      await CorrelationContextHelper.run('corr-1', () =>
        service.record({
          operationKey: 'product-created:12',
          subjectType: 'product',
          subjectId: '12',
          action: 'ProductCreated',
          payload: {},
          occurredAt: '2026-01-05T08:00:00.000Z',
        }),
      );

      expect(append).toHaveBeenCalledTimes(3);
      expect(logger.error).toHaveBeenCalledWith(
        { err: new Error('deadlock'), correlationId: 'corr-1', operationKey: 'product-created:12' },
        'Ledger append failed permanently: the catalog event is absent from the ledger, replay this record',
      );
    });
  });
});
