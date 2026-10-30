import type { Job } from 'bull';

import { ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';
import { CorrelationContextHelper } from '@acme-libs/observability';
import {
  LedgerRecordAppendUseCase,
  LedgerRecordReportFailureUseCase,
  LedgerRecordRetryFailedUseCase,
} from '../../application';
import { LedgerRecordConsumer } from '../ledger-record.consumer';

describe('LedgerRecordConsumer', () => {
  let correlationIds: string[];
  let execute: jest.Mock;
  let report: jest.Mock;
  let retry: jest.Mock;
  let consumer: LedgerRecordConsumer;

  beforeEach(() => {
    correlationIds = [];
    execute = jest.fn().mockImplementation(() => {
      correlationIds.push(CorrelationContextHelper.current('LedgerRecordAppendUseCase'));

      return Promise.resolve();
    });
    report = jest.fn().mockImplementation(() => {
      correlationIds.push(CorrelationContextHelper.current('LedgerRecordReportFailureUseCase'));
    });
    retry = jest.fn().mockImplementation(() => {
      correlationIds.push(CorrelationContextHelper.current('LedgerRecordRetryFailedUseCase'));

      return Promise.resolve();
    });
    consumer = new LedgerRecordConsumer(
      { execute } as unknown as LedgerRecordAppendUseCase,
      { execute: report } as unknown as LedgerRecordReportFailureUseCase,
      { execute: retry } as unknown as LedgerRecordRetryFailedUseCase,
    );
  });

  describe('handleRecord', () => {
    it('appends the record inside the correlation context of the producer', async () => {
      await consumer.handleRecord({
        data: {
          operationKey: 'product-created:12',
          subjectType: 'product',
          subjectId: '12',
          action: 'ProductCreated',
          payload: { sku: 'SKU-0001' },
          occurredAt: '2026-01-05T08:00:00.000Z',
          correlationId: 'corr-1',
        },
      } as unknown as Job<ILedgerRecordProcessorPayload>);

      expect(execute).toHaveBeenCalledWith({
        operationKey: 'product-created:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductCreated',
        payload: { sku: 'SKU-0001' },
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
      expect(correlationIds).toEqual(['corr-1']);
    });

    it('passes a failing append through, so Bull retries the job', async () => {
      execute.mockRejectedValue(new Error('deadlock'));

      const handling = consumer.handleRecord({
        data: {
          operationKey: 'product-created:12',
          subjectType: 'product',
          subjectId: '12',
          action: 'ProductCreated',
          payload: {},
          occurredAt: '2026-01-05T08:00:00.000Z',
          correlationId: 'corr-1',
        },
      } as unknown as Job<ILedgerRecordProcessorPayload>);

      await expect(handling).rejects.toThrow('deadlock');
    });
  });

  describe('handleFailed', () => {
    it('reports the failed attempt inside the correlation context of the producer', async () => {
      await consumer.handleFailed(
        {
          data: {
            operationKey: 'product-created:12',
            subjectType: 'product',
            subjectId: '12',
            action: 'ProductCreated',
            payload: {},
            occurredAt: '2026-01-05T08:00:00.000Z',
            correlationId: 'corr-1',
          },
          attemptsMade: 2,
          opts: { attempts: 3 },
        } as unknown as Job<ILedgerRecordProcessorPayload>,
        new Error('deadlock'),
      );

      expect(report).toHaveBeenCalledWith({
        operationKey: 'product-created:12',
        attempt: 2,
        attempts: 3,
        error: new Error('deadlock'),
      });
      expect(correlationIds).toEqual(['corr-1']);
    });

    it('treats a job without attempts as a single attempt', async () => {
      await consumer.handleFailed(
        {
          data: {
            operationKey: 'product-created:12',
            subjectType: 'product',
            subjectId: '12',
            action: 'ProductCreated',
            payload: {},
            occurredAt: '2026-01-05T08:00:00.000Z',
            correlationId: 'corr-1',
          },
          attemptsMade: 1,
          opts: {},
        } as unknown as Job<ILedgerRecordProcessorPayload>,
        new Error('deadlock'),
      );

      expect(report).toHaveBeenCalledWith({
        operationKey: 'product-created:12',
        attempt: 1,
        attempts: 1,
        error: new Error('deadlock'),
      });
    });
  });

  describe('handleRetryTick', () => {
    it('retries the failed records inside a correlation context of its own', async () => {
      await consumer.handleRetryTick();

      expect(retry).toHaveBeenCalledWith();
      expect(correlationIds).toEqual([
        expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        ),
      ]);
    });

    it('opens a new correlation context on every tick', async () => {
      await consumer.handleRetryTick();
      await consumer.handleRetryTick();

      expect(correlationIds).toHaveLength(2);
      expect(correlationIds[0]).not.toEqual(correlationIds[1]);
    });
  });
});
