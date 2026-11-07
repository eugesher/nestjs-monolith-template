import { ClassProvider, Injectable } from '@nestjs/common';
import { trace } from '@opentelemetry/api';

import {
  CACHE_LIB_TRACER_PORT,
  ICacheLibTracerPort,
  ICacheLibTracerSpanCommand,
} from '../../outbound';

@Injectable()
export class CacheLibTracerAdapter implements ICacheLibTracerPort {
  public static readonly provider: ClassProvider<ICacheLibTracerPort> = {
    provide: CACHE_LIB_TRACER_PORT,
    useClass: CacheLibTracerAdapter,
  };

  private static readonly TRACER_NAME = '@acme-libs/cache';

  public async span<T>(command: ICacheLibTracerSpanCommand<T>): Promise<T> {
    const { name, attributes, work } = command;
    const tracer = trace.getTracer(CacheLibTracerAdapter.TRACER_NAME);

    return await tracer.startActiveSpan(name, async (span) => {
      const collected = { ...attributes };

      try {
        return await work(collected);
      } finally {
        span.setAttributes(collected);
        span.end();
      }
    });
  }
}
