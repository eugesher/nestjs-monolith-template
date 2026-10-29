import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { IfMatch } from '../if-match.decorator';

describe('IfMatch', () => {
  class Probe {
    public handle(@IfMatch() version: unknown): unknown {
      return version;
    }
  }

  it('reads the version from the If-Match header of the request', () => {
    const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, Probe, 'handle') as Record<
      string,
      { factory: (data: unknown, context: ExecutionContext) => unknown }
    >;
    const [{ factory }] = Object.values(metadata);
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ headers: { 'if-match': '"3"' } }) }),
    } as unknown as ExecutionContext;

    const version = factory(undefined, context);

    expect(version).toBe(3);
  });
});
