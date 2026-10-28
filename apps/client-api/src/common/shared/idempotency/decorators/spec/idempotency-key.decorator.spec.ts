import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { IdempotencyKey } from '../idempotency-key.decorator';

describe('IdempotencyKey', () => {
  class Probe {
    public handle(@IdempotencyKey() key: unknown): unknown {
      return key;
    }
  }

  it('reads the key from the Idempotency-Key header of the request', () => {
    const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, Probe, 'handle') as Record<
      string,
      { factory: (data: unknown, context: ExecutionContext) => unknown }
    >;
    const [{ factory }] = Object.values(metadata);
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ headers: { 'idempotency-key': ' key-1 ' } }) }),
    } as unknown as ExecutionContext;

    const key = factory(undefined, context);

    expect(key).toBe('key-1');
  });
});
