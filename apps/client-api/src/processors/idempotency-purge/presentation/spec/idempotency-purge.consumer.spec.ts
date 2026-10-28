import { CorrelationContextHelper } from '@acme-libs/observability';
import { IdempotencyPurgeRunUseCase } from '../../application';
import { IdempotencyPurgeConsumer } from '../idempotency-purge.consumer';

describe('IdempotencyPurgeConsumer', () => {
  let correlationIds: string[];
  let execute: jest.Mock;
  let consumer: IdempotencyPurgeConsumer;

  beforeEach(() => {
    correlationIds = [];
    execute = jest.fn().mockImplementation(() => {
      correlationIds.push(CorrelationContextHelper.current('IdempotencyPurgeRunUseCase'));

      return Promise.resolve();
    });
    consumer = new IdempotencyPurgeConsumer({ execute } as unknown as IdempotencyPurgeRunUseCase);
  });

  describe('handleTick', () => {
    it('runs the purge inside a correlation context of its own', async () => {
      await consumer.handleTick();

      expect(execute).toHaveBeenCalledWith();
      expect(correlationIds).toEqual([
        expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        ),
      ]);
    });

    it('opens a new correlation context on every tick', async () => {
      await consumer.handleTick();
      await consumer.handleTick();

      expect(correlationIds).toHaveLength(2);
      expect(correlationIds[0]).not.toEqual(correlationIds[1]);
    });
  });
});
