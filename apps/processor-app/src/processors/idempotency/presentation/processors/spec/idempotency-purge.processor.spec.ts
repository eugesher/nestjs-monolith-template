import { CorrelationContextHelper } from '@acme-libs/observability';

import { IdempotencyPurgeProcessor } from '../idempotency-purge.processor';
import type { IdempotencyPurgeUseCase } from '../../../application';

describe('IdempotencyPurgeProcessor', () => {
  let correlationIds: string[];
  let execute: jest.Mock;
  let processor: IdempotencyPurgeProcessor;

  beforeEach(() => {
    correlationIds = [];
    execute = jest.fn().mockImplementation(() => {
      correlationIds.push(CorrelationContextHelper.current('IdempotencyPurgeUseCase'));

      return Promise.resolve();
    });
    processor = new IdempotencyPurgeProcessor({ execute } as unknown as IdempotencyPurgeUseCase);
  });

  describe('handleTick', () => {
    it('runs the purge inside a correlation context of its own', async () => {
      await processor.handleTick();

      expect(execute).toHaveBeenCalledWith();
      expect(correlationIds).toEqual([
        expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        ),
      ]);
    });

    it('opens a new correlation context on every tick', async () => {
      await processor.handleTick();
      await processor.handleTick();

      expect(correlationIds).toHaveLength(2);
      expect(correlationIds[0]).not.toEqual(correlationIds[1]);
    });
  });
});
